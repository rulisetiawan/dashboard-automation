import fs from 'node:fs';

const content = fs.readFileSync('app.legacy.js', 'utf8');
const lines = content.split('\n');

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

console.log('Splitting app.legacy.js into modular ES structure...');

// 1. src/state.js (Lines 1 to 1476)
fs.writeFileSync('src/state.js', `// ============================================================================
// State & Configuration Module
// ============================================================================

` + getSlice(1, 1476));
console.log('Created src/state.js');

// 2. src/utils/formatters.js (Lines 1477 to 2221)
fs.writeFileSync('src/utils/formatters.js', `// ============================================================================
// UI Formatters & Markup Helpers
// ============================================================================

` + getSlice(1477, 2221));
console.log('Created src/utils/formatters.js');

// 3. src/pages/fleet.js (Lines 2222 to 4313, 4777 to 4784, 6093 to 6815)
const fleetContent = `// ============================================================================
// Page: Process Fleet (Jetflow, Calator, Dryer, Kalender, Finishing, etc.)
// ============================================================================

` + getSlice(2222, 4313) + `\n\n` + getSlice(4777, 4784) + `\n\n` + getSlice(6093, 6815);
fs.writeFileSync('src/pages/fleet.js', fleetContent);
console.log('Created src/pages/fleet.js');

// 4. src/pages/overview.js (Lines 4756 to 4776)
fs.writeFileSync('src/pages/overview.js', `// ============================================================================
// Page: Plant Overview & Live Operations
// ============================================================================

` + getSlice(4756, 4776));
console.log('Created src/pages/overview.js');

// 5. src/pages/asset-status.js (Lines 4314 to 4755)
fs.writeFileSync('src/pages/asset-status.js', `// ============================================================================
// Page: Asset Status (Snapshot Matrix & 30s Auto-Slide Carousel)
// ============================================================================

` + getSlice(4314, 4755));
console.log('Created src/pages/asset-status.js');

// 6. src/pages/utilities.js (Lines 4785 to 4911)
fs.writeFileSync('src/pages/utilities.js', `// ============================================================================
// Page: Plant Utilities & Power Demand
// ============================================================================

` + getSlice(4785, 4911));
console.log('Created src/pages/utilities.js');

// 7. src/pages/chemical.js (Lines 4912 to 5037)
fs.writeFileSync('src/pages/chemical.js', `// ============================================================================
// Page: Chemical Processing & Dispensing
// ============================================================================

` + getSlice(4912, 5037));
console.log('Created src/pages/chemical.js');

// 8. src/pages/solar.js (Lines 5038 to 5365)
fs.writeFileSync('src/pages/solar.js', `// ============================================================================
// Page: Solar Fueling Operations
// ============================================================================

` + getSlice(5038, 5365));
console.log('Created src/pages/solar.js');

// 9. src/pages/wwtp.js (Lines 5366 to 5739)
fs.writeFileSync('src/pages/wwtp.js', `// ============================================================================
// Page: Wastewater Treatment Plant (WWTP / IPAL)
// ============================================================================

` + getSlice(5366, 5739));
console.log('Created src/pages/wwtp.js');

// 10. src/pages/alarms.js (Lines 5740 to 5776)
fs.writeFileSync('src/pages/alarms.js', `// ============================================================================
// Page: Alarms & Events Management
// ============================================================================

` + getSlice(5740, 5776));
console.log('Created src/pages/alarms.js');

// 11. src/pages/trends.js (Lines 5777 to 6076)
fs.writeFileSync('src/pages/trends.js', `// ============================================================================
// Page: Historical Trends & Explorer Graph
// ============================================================================

` + getSlice(5777, 6076));
console.log('Created src/pages/trends.js');

// 12. src/pages/health.js (Lines 6077 to 6092)
fs.writeFileSync('src/pages/health.js', `// ============================================================================
// Page: Data Health & Telemetry Quality
// ============================================================================

` + getSlice(6077, 6092));
console.log('Created src/pages/health.js');

// 13. src/components/modal-machine.js (Lines 8117 to 9718)
fs.writeFileSync('src/components/modal-machine.js', `// ============================================================================
// Component: Machine Detail Modal & Diagnostics
// ============================================================================

` + getSlice(8117, 9718));
console.log('Created src/components/modal-machine.js');

// 14. src/pages/roles.js (Lines 9719 to 10233)
fs.writeFileSync('src/pages/roles.js', `// ============================================================================
// Page: Role & Permission Management (RBAC Matrix)
// ============================================================================

` + getSlice(9719, 10233));
console.log('Created src/pages/roles.js');

// 15. src/pages/users.js (Lines 10234 to 10692)
fs.writeFileSync('src/pages/users.js', `// ============================================================================
// Page: User Management (CRUD, Password Reset, Status)
// ============================================================================

` + getSlice(10234, 10692));
console.log('Created src/pages/users.js');

// 16. src/main.js (Router, Event Bindings, App Lifecycle - Lines 6816 to 8116)
const mainContent = `// ============================================================================
// Digital Automation Dashboard - Main Entry Point & Router
// ============================================================================

// Import all modules
import "./state.js";
import "./utils/formatters.js";
import "./pages/fleet.js";
import "./pages/overview.js";
import "./pages/asset-status.js";
import "./pages/utilities.js";
import "./pages/chemical.js";
import "./pages/solar.js";
import "./pages/wwtp.js";
import "./pages/alarms.js";
import "./pages/trends.js";
import "./pages/health.js";
import "./components/modal-machine.js";
import "./pages/roles.js";
import "./pages/users.js";

// Main Router & Lifecycle Events
` + getSlice(6816, 8116);
fs.writeFileSync('src/main.js', mainContent);
console.log('Created src/main.js');

console.log('All modules successfully generated!');
