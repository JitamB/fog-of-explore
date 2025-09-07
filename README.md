# 🏫 Fog of Explore - Campus Adventure Game

A Pokemon Go-like location-based game designed for college campuses. Explore your campus, discover new locations, and earn points for visiting different places!

## 🎮 Features

- **Real-time Location Tracking**: Uses GPS to track your position on campus
- **Point System**: Earn points by visiting different campus locations
- **Level Progression**: Gain levels as you accumulate points
- **Location Discovery**: Find nearby locations and track your visits
- **Visit Bonuses**: Get bonus points for first-time visits to locations
- **Mobile Friendly**: Responsive design optimized for mobile devices
- **Offline Storage**: Your progress is saved locally in your browser

## 🎯 How to Play

1. **Enable Location**: Click the "Enable Location" button to start tracking your position
2. **Explore Campus**: Walk around campus to discover nearby locations
3. **Visit Locations**: Get within range of a location to automatically check in and earn points
4. **Level Up**: Accumulate points to advance to higher levels
5. **Collect All**: Try to visit all campus locations to complete your collection!

## 📱 Getting Started

1. Open `index.html` in a web browser (preferably on a mobile device)
2. Allow location permissions when prompted
3. Start exploring your campus!

### Location Setup

The game comes with sample campus locations. To customize for your campus:

1. Edit `locations.js`
2. Replace the coordinates in `CAMPUS_LOCATIONS` with actual campus coordinates
3. Adjust location names, descriptions, and point values as needed
4. Set appropriate detection radius for each location

## 🏆 Point System

- **Base Points**: Each location has a base point value
- **Category Multipliers**: Different location types have different multipliers:
  - Academic: 1.2x (Libraries, Labs, etc.)
  - Arts: 1.3x (Art buildings, Studios, etc.)
  - Recreation: 1.1x (Gyms, Sports fields, etc.)
  - Social: 1.0x (Student centers, Cafeterias, etc.)
  - Residential: 0.8x (Dormitories, etc.)
  - Utility: 0.9x (Parking, Service buildings, etc.)
- **First Visit Bonus**: 50% extra points for discovering a new location
- **Cooldown**: 1-hour cooldown before you can revisit the same location

## 📊 Level System

Progress through 10 levels by earning points:
- Level 1: 0+ points
- Level 2: 100+ points
- Level 3: 250+ points
- Level 4: 500+ points
- Level 5: 1,000+ points
- Level 6: 2,000+ points
- Level 7: 3,500+ points
- Level 8: 5,500+ points
- Level 9: 8,000+ points
- Level 10: 12,000+ points

## ⚙️ Configuration

Key settings in `locations.js`:

- `NEARBY_DISTANCE`: How far to show locations as "nearby" (default: 100m)
- `VISIT_DISTANCE`: How close you need to be to trigger a visit (default: 30m)
- `MIN_ACCURACY`: Minimum GPS accuracy required (default: 50m)
- `REVISIT_COOLDOWN`: Time before you can revisit a location (default: 1 hour)

## 🔧 Technical Requirements

- Modern web browser with geolocation support
- HTTPS connection (required for geolocation API)
- Location services enabled on device

## 🛠️ Development

The game is built with vanilla HTML, CSS, and JavaScript:

- `index.html`: Main game interface
- `style.css`: Responsive styling and animations
- `script.js`: Game logic and geolocation handling
- `locations.js`: Campus location definitions and configuration

## 📱 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Location features require HTTPS in production environments.

## 🔒 Privacy

- Location data is only stored locally in your browser
- No data is sent to external servers
- You can clear your data by clearing browser storage

## 🎨 Customization

Easy to customize:
- **Colors**: Edit CSS variables in `style.css`
- **Locations**: Modify `CAMPUS_LOCATIONS` in `locations.js`
- **Point Values**: Adjust point rewards and multipliers
- **UI Text**: Update HTML content and messages

Enjoy exploring your campus! 🎓