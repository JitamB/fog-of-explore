// Campus locations configuration
// These are sample locations - replace with actual campus coordinates
const CAMPUS_LOCATIONS = [
    {
        id: 1,
        name: "🏛️ Main Library",
        description: "The heart of academic research and study",
        latitude: 40.7128,
        longitude: -74.0060,
        points: 50,
        category: "academic",
        radius: 30 // meters for detection
    },
    {
        id: 2,
        name: "🍕 Student Center",
        description: "Hub of student life and dining",
        latitude: 40.7130,
        longitude: -74.0055,
        points: 30,
        category: "social",
        radius: 25
    },
    {
        id: 3,
        name: "🔬 Science Building",
        description: "Where discoveries are made",
        latitude: 40.7125,
        longitude: -74.0065,
        points: 40,
        category: "academic",
        radius: 35
    },
    {
        id: 4,
        name: "🏃 Athletic Center",
        description: "Stay fit and healthy",
        latitude: 40.7135,
        longitude: -74.0070,
        points: 35,
        category: "recreation",
        radius: 40
    },
    {
        id: 5,
        name: "🎨 Arts Building",
        description: "Express your creativity",
        latitude: 40.7120,
        longitude: -74.0050,
        points: 45,
        category: "arts",
        radius: 30
    },
    {
        id: 6,
        name: "☕ Campus Coffee Shop",
        description: "Fuel your studies with caffeine",
        latitude: 40.7132,
        longitude: -74.0058,
        points: 20,
        category: "social",
        radius: 20
    },
    {
        id: 7,
        name: "🌳 Central Quad",
        description: "Beautiful green space for relaxation",
        latitude: 40.7127,
        longitude: -74.0062,
        points: 25,
        category: "recreation",
        radius: 50
    },
    {
        id: 8,
        name: "🖥️ Computer Lab",
        description: "High-tech learning environment",
        latitude: 40.7123,
        longitude: -74.0067,
        points: 35,
        category: "academic",
        radius: 25
    },
    {
        id: 9,
        name: "🏠 Dormitory Complex",
        description: "Home away from home",
        latitude: 40.7140,
        longitude: -74.0045,
        points: 30,
        category: "residential",
        radius: 60
    },
    {
        id: 10,
        name: "🅿️ Main Parking",
        description: "Central campus parking area",
        latitude: 40.7115,
        longitude: -74.0075,
        points: 15,
        category: "utility",
        radius: 40
    }
];

// Point multipliers for different categories
const CATEGORY_MULTIPLIERS = {
    academic: 1.2,
    social: 1.0,
    recreation: 1.1,
    arts: 1.3,
    residential: 0.8,
    utility: 0.9
};

// Level thresholds
const LEVEL_THRESHOLDS = [
    { level: 1, minPoints: 0 },
    { level: 2, minPoints: 100 },
    { level: 3, minPoints: 250 },
    { level: 4, minPoints: 500 },
    { level: 5, minPoints: 1000 },
    { level: 6, minPoints: 2000 },
    { level: 7, minPoints: 3500 },
    { level: 8, minPoints: 5500 },
    { level: 9, minPoints: 8000 },
    { level: 10, minPoints: 12000 }
];

// Configuration constants
const CONFIG = {
    NEARBY_DISTANCE: 100, // meters to show as "nearby"
    VISIT_DISTANCE: 30,   // meters to trigger a visit
    MIN_ACCURACY: 50,     // minimum GPS accuracy required (meters)
    REVISIT_COOLDOWN: 3600000, // 1 hour cooldown for revisiting same location (milliseconds)
    AUTO_REFRESH_INTERVAL: 30000 // 30 seconds auto-refresh interval
};

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        academic: '📚',
        social: '👥',
        recreation: '🎯',
        arts: '🎨',
        residential: '🏠',
        utility: '🔧'
    };
    return emojis[category] || '📍';
}

// Calculate level from points
function calculateLevel(points) {
    let level = 1;
    for (const threshold of LEVEL_THRESHOLDS) {
        if (points >= threshold.minPoints) {
            level = threshold.level;
        } else {
            break;
        }
    }
    return level;
}

// Get points needed for next level
function getPointsForNextLevel(currentPoints) {
    const currentLevel = calculateLevel(currentPoints);
    const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level > currentLevel);
    
    if (nextThreshold) {
        return nextThreshold.minPoints - currentPoints;
    }
    return 0; // Max level reached
}