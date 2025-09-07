// Game state management
class GameState {
    constructor() {
        this.userPosition = null;
        this.userPoints = 0;
        this.userLevel = 1;
        this.visitedLocations = new Set();
        this.lastVisitTimes = new Map(); // Track when locations were last visited
        this.isLocationEnabled = false;
        this.watchId = null;
        this.autoRefreshTimer = null;
        
        this.loadFromStorage();
        this.initializeUI();
        this.setupEventListeners();
    }

    // Load game state from localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('fogOfExploreData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.userPoints = data.userPoints || 0;
                this.userLevel = data.userLevel || 1;
                this.visitedLocations = new Set(data.visitedLocations || []);
                this.lastVisitTimes = new Map(data.lastVisitTimes || []);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    // Save game state to localStorage
    saveToStorage() {
        try {
            const data = {
                userPoints: this.userPoints,
                userLevel: this.userLevel,
                visitedLocations: Array.from(this.visitedLocations),
                lastVisitTimes: Array.from(this.lastVisitTimes.entries())
            };
            localStorage.setItem('fogOfExploreData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Initialize UI elements
    initializeUI() {
        this.updatePointsDisplay();
        this.updateLevelDisplay();
        this.updateLocationDisplay();
        this.updateNearbyLocations();
        this.updateVisitedLocations();
        this.updateStats();
    }

    // Setup event listeners
    setupEventListeners() {
        const enableLocationBtn = document.getElementById('enableLocation');
        const refreshLocationBtn = document.getElementById('refreshLocation');

        enableLocationBtn.addEventListener('click', () => this.enableLocation());
        refreshLocationBtn.addEventListener('click', () => this.refreshLocation());
    }

    // Enable geolocation
    enableLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        const enableBtn = document.getElementById('enableLocation');
        const refreshBtn = document.getElementById('refreshLocation');
        
        enableBtn.textContent = 'Enabling Location...';
        enableBtn.disabled = true;

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minute
        };

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.handleLocationSuccess(position);
                this.startLocationWatching();
                
                enableBtn.style.display = 'none';
                refreshBtn.style.display = 'inline-block';
                this.isLocationEnabled = true;
                
                // Start auto-refresh timer
                this.startAutoRefresh();
            },
            (error) => {
                this.handleLocationError(error);
                enableBtn.textContent = 'Enable Location';
                enableBtn.disabled = false;
            },
            options
        );
    }

    // Start watching location changes
    startLocationWatching() {
        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 30000
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleLocationSuccess(position),
            (error) => this.handleLocationError(error),
            options
        );
    }

    // Start auto-refresh timer
    startAutoRefresh() {
        this.autoRefreshTimer = setInterval(() => {
            if (this.isLocationEnabled) {
                this.refreshLocation();
            }
        }, CONFIG.AUTO_REFRESH_INTERVAL);
    }

    // Refresh location manually
    refreshLocation() {
        const refreshBtn = document.getElementById('refreshLocation');
        const originalText = refreshBtn.textContent;
        
        refreshBtn.textContent = 'Refreshing...';
        refreshBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.handleLocationSuccess(position);
                refreshBtn.textContent = originalText;
                refreshBtn.disabled = false;
            },
            (error) => {
                this.handleLocationError(error);
                refreshBtn.textContent = originalText;
                refreshBtn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0 // Force fresh reading
            }
        );
    }

    // Handle successful location update
    handleLocationSuccess(position) {
        this.userPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        this.updateLocationDisplay();
        this.checkNearbyLocations();
        this.updateNearbyLocations();
        this.updateStats();
    }

    // Handle location error
    handleLocationError(error) {
        let message = 'Unable to get location: ';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Position unavailable';
                break;
            case error.TIMEOUT:
                message += 'Request timeout';
                break;
            default:
                message += 'Unknown error';
                break;
        }
        
        document.getElementById('currentLocation').textContent = message;
        console.error('Location error:', error);
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    }

    // Check for nearby locations and potential visits
    checkNearbyLocations() {
        if (!this.userPosition) return;

        const currentTime = Date.now();
        
        CAMPUS_LOCATIONS.forEach(location => {
            const distance = this.calculateDistance(
                this.userPosition.latitude,
                this.userPosition.longitude,
                location.latitude,
                location.longitude
            );

            // Check if user is close enough to visit
            if (distance <= Math.max(location.radius, CONFIG.VISIT_DISTANCE)) {
                const lastVisit = this.lastVisitTimes.get(location.id);
                const canRevisit = !lastVisit || (currentTime - lastVisit) >= CONFIG.REVISIT_COOLDOWN;

                if (canRevisit) {
                    this.visitLocation(location);
                }
            }
        });
    }

    // Visit a location and award points
    visitLocation(location) {
        const currentTime = Date.now();
        const wasVisited = this.visitedLocations.has(location.id);
        
        // Add to visited locations
        this.visitedLocations.add(location.id);
        this.lastVisitTimes.set(location.id, currentTime);

        // Calculate points (bonus for first visit)
        let pointsAwarded = location.points;
        const multiplier = CATEGORY_MULTIPLIERS[location.category] || 1.0;
        pointsAwarded = Math.round(pointsAwarded * multiplier);

        if (!wasVisited) {
            pointsAwarded = Math.round(pointsAwarded * 1.5); // 50% bonus for first visit
        }

        // Award points
        this.userPoints += pointsAwarded;
        this.userLevel = calculateLevel(this.userPoints);

        // Save state
        this.saveToStorage();

        // Update UI
        this.updatePointsDisplay();
        this.updateLevelDisplay();
        this.updateVisitedLocations();
        this.updateStats();

        // Show notification
        this.showVisitNotification(location, pointsAwarded, !wasVisited);
    }

    // Show visit notification
    showVisitNotification(location, points, isFirstVisit) {
        const message = isFirstVisit 
            ? `🎉 Discovered ${location.name}! +${points} points (First Visit Bonus!)`
            : `✅ Visited ${location.name}! +${points} points`;
        
        // Simple notification - could be enhanced with a proper notification system
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Fog of Explore', {
                body: message,
                icon: '/favicon.ico'
            });
        } else {
            // Fallback to alert for now - could be enhanced with custom notification UI
            alert(message);
        }
    }

    // Update points display
    updatePointsDisplay() {
        document.getElementById('userPoints').textContent = this.userPoints;
    }

    // Update level display
    updateLevelDisplay() {
        document.getElementById('userLevel').textContent = this.userLevel;
    }

    // Update location display
    updateLocationDisplay() {
        const locationElement = document.getElementById('currentLocation');
        const coordinatesElement = document.getElementById('coordinates');

        if (this.userPosition) {
            locationElement.textContent = `Location tracking active`;
            coordinatesElement.textContent = 
                `Lat: ${this.userPosition.latitude.toFixed(4)}, Lon: ${this.userPosition.longitude.toFixed(4)}`;
        } else {
            locationElement.textContent = 'Location not available';
            coordinatesElement.textContent = 'Lat: --, Lon: --';
        }
    }

    // Update nearby locations display
    updateNearbyLocations() {
        const container = document.getElementById('nearbyLocations');
        
        if (!this.userPosition) {
            container.innerHTML = '<p class="placeholder">Enable location to discover nearby places!</p>';
            return;
        }

        const nearbyLocations = CAMPUS_LOCATIONS
            .map(location => {
                const distance = this.calculateDistance(
                    this.userPosition.latitude,
                    this.userPosition.longitude,
                    location.latitude,
                    location.longitude
                );
                return { ...location, distance };
            })
            .filter(location => location.distance <= CONFIG.NEARBY_DISTANCE)
            .sort((a, b) => a.distance - b.distance);

        if (nearbyLocations.length === 0) {
            container.innerHTML = '<p class="placeholder">No locations nearby. Keep exploring!</p>';
            return;
        }

        container.innerHTML = nearbyLocations
            .map(location => `
                <div class="location-card nearby">
                    <h4>${location.name}</h4>
                    <p>${location.description}</p>
                    <p class="distance">${Math.round(location.distance)}m away</p>
                    <p>${getCategoryEmoji(location.category)} ${location.points} points</p>
                </div>
            `).join('');
    }

    // Update visited locations display
    updateVisitedLocations() {
        const container = document.getElementById('visitedLocations');

        if (this.visitedLocations.size === 0) {
            container.innerHTML = '<p class="placeholder">No locations visited yet. Start exploring!</p>';
            return;
        }

        const visitedLocationData = CAMPUS_LOCATIONS
            .filter(location => this.visitedLocations.has(location.id))
            .map(location => {
                const visitTime = this.lastVisitTimes.get(location.id);
                return { ...location, visitTime };
            })
            .sort((a, b) => b.visitTime - a.visitTime);

        container.innerHTML = visitedLocationData
            .map(location => `
                <div class="location-card visited">
                    <h4>${location.name}</h4>
                    <p>${location.description}</p>
                    <p>${getCategoryEmoji(location.category)} ${location.points} points earned</p>
                    <p class="visit-time">Visited: ${new Date(location.visitTime).toLocaleDateString()}</p>
                </div>
            `).join('');
    }

    // Update stats display
    updateStats() {
        document.getElementById('totalVisited').textContent = this.visitedLocations.size;
        document.getElementById('totalLocations').textContent = CAMPUS_LOCATIONS.length;
        
        const accuracy = this.userPosition ? Math.round(this.userPosition.accuracy) : '--';
        document.getElementById('accuracy').textContent = accuracy;
    }

    // Cleanup when page unloads
    cleanup() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
    }
}

// Initialize the game when the page loads
let gameState;

document.addEventListener('DOMContentLoaded', () => {
    gameState = new GameState();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameState) {
        gameState.cleanup();
    }
});