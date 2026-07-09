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

## REC-002

Title:
Implement New Transaction Wizard

Priority:
P0

Category:
Core Feature

Area:
Transactions

Current Behavior:
New Transaction displays a coming-soon toast.

Desired Behavior:
Clicking New Transaction opens a guided creation wizard with two starting options:

1. Upload Purchase Agreement
2. Create Manually

Why this matters:
Creating a transaction is the primary entry point into the app. Until users can create real transactions, the app cannot be meaningfully used for real business.

Acceptance Criteria:
- New Transaction opens a modal or drawer wizard.
- First screen asks: "How would you like to create this transaction?"
- Option 1: Upload Purchase Agreement
  - Show this option as Recommended.
  - For now, clicking it should show a clear message:
    "AI document extraction is coming soon. Continue with manual entry for now?"
  - Provide a Continue Manually button.
- Option 2: Create Manually
  - Starts the manual wizard.

Manual wizard steps:
1. Transaction Type
   - Buyer Representation
   - Seller Listing
   - Dual Agency

2. Property Information
   - Property Address
   - City
   - State
   - ZIP

3. People
   - Buyer Name(s)
   - Seller Name(s)
   - Assigned Agent

4. Deal Terms
   - Purchase Price
   - Contract Date
   - Closing Date
   - Earnest Money Amount

5. Review & Create

On create:
- Save the transaction to Turso.
- Create the Transaction Workspace.
- Add an initial note or activity placeholder if activity events are not implemented yet.
- Redirect to /transactions/[id].
- Show a success toast.

Technical requirements:
- Use existing design system components.
- Use React Hook Form and Zod.
- Reuse existing database schema where possible.
- Do not implement real document upload yet.
- Do not implement AI extraction yet.
- Do not add authentication yet.
- Do not break existing transactions list.
- Make the wizard usable on mobile.

Status:
Fixed

## REC-003

Title:
Centralize app action handling

Priority:
P0

Category:
Architecture

Area:
Global App / Actions

Problem:
Many buttons still only show coming-soon toasts. Some are expected to open real features, such as New Transaction. Others are correctly unfinished and should show a toast. The current behavior is inconsistent and hard to debug.

Goal:
Every clickable action in the app must declare an action type and be handled by a central action registry.

Solution:
- Added `src/lib/app-actions/` with types, registry, handler, audit utility, and `useAppAction` hook.
- Page headers, empty states, command palette, dashboard actions, and workspace quick actions now resolve through the registry.
- Implemented actions (e.g. `new_transaction`, `view_deadlines`) route or callback without falling through to placeholder toasts.
- Placeholder actions show consistent coming-soon feedback from registry definitions.

Status:
Fixed
