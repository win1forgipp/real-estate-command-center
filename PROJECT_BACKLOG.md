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

## REC-004

Title:
Implement core create/action buttons beyond New Transaction

Priority:
P1

Category:
Core Workflow

Area:
Global App Actions

Issue:
Core create/action buttons (Add Buyer, Add Listing, Add Contact, Schedule Showing, Add Deadline, Add Task, Add Link, Create Template, Add Commission, Add Mileage, and top-right user menu) only showed placeholder toasts or did not perform useful actions.

Expected Behavior:
Each button opens a usable modal, drawer, wizard, dropdown, or route. A toast alone does not count as working for these core actions.

Implementation:
- Added `AppActionFormsProvider` with modal forms for all listed actions.
- Wired modal behavior in the app action handler via `dispatchAppActionEvent`.
- Added server actions and mutations for contacts, listings, deadlines, tasks, links, and commission updates.
- Schedule Showing saves as a task placeholder until a showings table exists.
- Create Template and Add Mileage save to localStorage with persistence-pending messaging.
- User menu dropdown opens Profile, Preferences, Help, and Sign out placeholder modals.
- Updated action registry so listed actions are `implemented` with `modal` behavior.

Status:
Fixed

## REC-005

Title:
Fix action tiles, modal button spacing, EMD holder, progress hover, and dashboard counts

Priority:
P1

Category:
Bug + UX Fix

Area:
Dashboard / Actions / Transaction Wizard / Transaction Workspace

Issues:
1. Dashboard tiles used mock data and inconsistent click behavior.
2. Modal footer buttons sat flush with the bottom edge.
3. New Transaction wizard lacked Earnest Money Held By fields.
4. Progress tracker showed duplicate native tooltips on hover.
5. Dashboard Active Transactions count did not match live Turso data.

Implementation:
- Added live Turso dashboard queries and per-item navigation links.
- Aligned Active Transactions count with the transactions list (excludes closed/cancelled).
- Introduced shared `OverlayFooter` and fixed `DialogFooter` spacing globally.
- Added `earnest_money_held_by` and `earnest_money_holder_name` schema migration and wizard fields.
- Removed native `title` tooltip from progress tracker stages.

Status:
Fixed

## Button Functionality Audit

Definition: A button is **Functional** only if it performs the real expected workflow (opens the correct form/wizard/modal or navigates to a working page). A **Placeholder** intentionally shows coming-soon feedback for an unbuilt feature. **Broken** means the button should work now but only shows a placeholder or does nothing.

### Core transaction workflow

| Button | Location | Current behavior | Expected behavior | Classification | Priority |
|--------|----------|------------------|-------------------|----------------|----------|
| New Transaction | Transactions PageHeader | Opens New Transaction wizard | Open wizard | Functional | P0 |
| New Transaction | Command Palette | Routes to `/transactions?new=1` and opens wizard | Open wizard | Functional | P0 |
| New Transaction | Module empty state (`page-config`) | Routes to `/transactions?new=1` and opens wizard | Open wizard | Functional | P0 |
| Upload Purchase Agreement | Wizard entry screen | Shows upload prompt with Continue Manually | Show AI-coming-soon prompt, then manual path | Functional (MVP) | P1 |
| Create Manually | Wizard entry screen | Starts manual wizard step 1 | Start manual wizard | Functional | P0 |
| Continue Manually | Wizard upload prompt | Starts manual wizard step 1 | Start manual wizard | Functional | P0 |
| Create Transaction | Wizard review step | Saves to Turso and redirects to workspace | Create transaction + redirect | Functional | P0 |

### PageHeader primary actions (module pages)

| Button | Location | Current behavior | Expected behavior | Classification | Priority |
|--------|----------|------------------|-------------------|----------------|----------|
| Add Buyer | `/buyers` PageHeader + EmptyState | Coming-soon toast | Open buyer create form | Placeholder | P2 |
| Add Listing | `/sellers` PageHeader + EmptyState | Coming-soon toast | Open listing create form | Placeholder | P2 |
| Add Deadline | `/deadlines` PageHeader + EmptyState | Coming-soon toast | Open deadline create form | Placeholder | P2 |
| Add Task | `/tasks` PageHeader + EmptyState | Coming-soon toast | Open task create form | Placeholder | P2 |
| Add Contact | `/contacts` PageHeader + EmptyState | Coming-soon toast | Open contact create form | Placeholder | P2 |
| Schedule Showing | `/showings` PageHeader + EmptyState | Coming-soon toast | Open showing scheduler | Placeholder | P2 |
| Add Link | `/documents` PageHeader + EmptyState | Coming-soon toast | Open link create form | Placeholder | P2 |
| Create Template | `/templates` PageHeader + EmptyState | Coming-soon toast | Open template editor | Placeholder | P2 |
| Add Commission | `/commissions` PageHeader + EmptyState | Coming-soon toast | Open commission form | Placeholder | P2 |
| Add Expense | `/expenses` PageHeader + EmptyState | Coming-soon toast | Open expense form | Placeholder | P2 |
| Open Preferences | `/settings` PageHeader + EmptyState | Coming-soon toast | Open settings preferences | Placeholder | P2 |
| Import Deal | `/transactions` secondary PageHeader | Coming-soon toast | Import deal workflow | Placeholder | P3 |

### Dashboard

| Button | Location | Current behavior | Expected behavior | Classification | Priority |
|--------|----------|------------------|-------------------|----------------|----------|
| Add Task | Dashboard PageHeader | Coming-soon toast | Open task create form | Placeholder | P2 |
| View Deadlines | Dashboard PageHeader secondary | Navigates to `/deadlines` | Open deadlines page | Functional | P0 |
| Dashboard overview cards | Dashboard grid | Link to module pages | Navigate to module | Functional | P1 |

### Command Palette

| Button | Location | Current behavior | Expected behavior | Classification | Priority |
|--------|----------|------------------|-------------------|----------------|----------|
| Navigation items | Command Palette | Navigate to module routes | Navigate | Functional | P1 |
| New Transaction | Command Palette actions | Opens wizard via route/callback | Open wizard | Functional | P0 |
| View Deadlines | Command Palette actions | Navigates to `/deadlines` | Open deadlines page | Functional | P0 |
| Add Buyer / Add Task / etc. | Command Palette actions | Coming-soon toast | Real create workflows when built | Placeholder | P2 |
| Workspace search results | Command Palette workspaces | Navigate + workspace placeholder toast | Open record workspace | Placeholder | P2 |

### Transaction Workspace

| Button | Location | Current behavior | Expected behavior | Classification | Priority |
|--------|----------|------------------|-------------------|----------------|----------|
| Edit | Workspace summary quick action | Coming-soon toast | Open transaction edit form | Placeholder | P2 |
| Add Task | Workspace summary + Tasks tab empty state | Coming-soon toast | Open task create form linked to transaction | Placeholder | P2 |
| Add Note | Workspace summary + Notes tab empty state | Coming-soon toast | Open note create form | Placeholder | P2 |
| Upload Document | Workspace summary quick action | Coming-soon toast | Open document upload | Placeholder | P2 |
| Add Deadline | Deadlines tab empty state | Coming-soon toast | Open deadline create form | Placeholder | P2 |
| Add Link | Documents tab empty state | Coming-soon toast | Open link create form | Placeholder | P2 |
| AI Assistant tab | Workspace tabs | Static placeholder copy | AI assistant workflow | Placeholder | P3 |
| Timeline tab | Workspace tabs | Static placeholder copy | Activity timeline | Placeholder | P3 |

### P0 fixes applied in this audit

- New Transaction opens the wizard from every registry entry point (direct event on `/transactions`, route fallback elsewhere).
- Create Manually and Continue Manually advance into the manual wizard (verified).
- View Deadlines navigates to `/deadlines` from dashboard and command palette (verified).

### Notes

- REC-001 and REC-003 addressed feedback visibility, not feature completion. Placeholder toasts alone do not make a button functional.
- Unbuilt create workflows remain intentionally Placeholder until their forms are implemented.
