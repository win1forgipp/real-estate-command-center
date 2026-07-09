# Real Estate Command Center — Project Backlog

## REC-001

Title:
Primary add buttons are unresponsive

Priority:
P0

Category:
Critical Bug

Area:
Global App / Create Actions

Observed Behavior:
Primary add buttons such as New Transaction, Add Buyer, Add Listing, Add Task, Add Note, Upload Document, and similar create/action buttons can be clicked but do not perform any visible action.

Expected Behavior:
Every primary add/create button should either:
1. Open the correct create form/modal/drawer, or
2. If the feature is not implemented yet, show a clear toast or placeholder message explaining that the feature is coming soon.

Why this matters:
The app cannot be meaningfully tested for real workflow usability if the main action buttons appear broken. Users need immediate feedback when clicking an action.

Acceptance Criteria:
- Audit all primary action buttons across the app.
- No add/create button should be silently unresponsive.
- Implement placeholder toast feedback for unfinished actions.
- Where practical, route buttons to an existing page or workspace.
- New Transaction should be prioritized.
- Mobile and desktop behavior should both work.
- npm run build passes.

Status:
Fixed
