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
- Option 1: Intelligent Transaction Import (Recommended)
  - Upload purchase agreement and supporting documents.
  - Run ITI extraction, review extracted fields, then create the transaction.
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

## REC-006

Title:
Standardize modal and drawer footer layout

Priority:
P2

Category:
Design System / UX

Area:
Global UI Components

Issue:
Modal and wizard footer buttons were not consistently positioned across dialogs, with varying spacing and no safe-area support.

Implementation:
- Added `ModalFooter` and `ModalFooterActions` as the single shared footer system.
- Migrated New Transaction wizard, action form modals, confirm/delete dialogs, design-system Modal, Drawer, `DialogFooter`, and `SheetFooter`.
- Desktop: secondary actions left, primary actions right.
- Mobile: full-width stacked buttons with 44px touch targets and `env(safe-area-inset-bottom)` padding.
- Documented that all future overlays must use the shared footer.

Status:
Fixed

## REC-007

Title:
Bring ITI online

Priority:
P0

Category:
AI Core Workflow

Area:
Intelligent Transaction Import

Implementation:
- Replaced coming-soon placeholder with full ITI upload and review flow in New Transaction wizard.
- Drag-and-drop multi-file upload with per-file status indicators.
- Footer uses shared ModalFooter: Back left, Continue Manually + Run ITI right.
- ITI service layer at `src/services/iti/` with OpenAI provider and mock fallback.
- Review Import screen with editable sections and archive decision for historical deals.
- Creates transaction, contacts, deadlines, document metadata, and notes on confirm.
- Archived imports use `transaction_status = archived` and are excluded from active dashboard counts.

Status:
Fixed

### REC-007 Follow-up

- Dedicated Archived Transactions list view (currently accessible via workspace URL only).
- OCR for image uploads.
- Wire workspace Upload Purchase Agreement action to open ITI directly on transactions page via event (route fallback exists).
- Scheduled cleanup for orphaned temporary Blob files older than 24 hours.
- Restrict Blob uploads to authenticated users once auth ships.

## REC-008

Title:
Fix ITI upload server response handling

Priority:
P0

Category:
Bug

Area:
ITI / File Upload / Server Action

Implementation:
- Server action now always returns a predictable `{ ok, error?, extraction?, files?, warning?, provider? }` shape instead of throwing.
- Increased Next.js server action and proxy body limits to 25mb for multi-PDF uploads.
- Mock extraction fallback when `OPENAI_API_KEY` is missing returns `ok: true` with a warning.
- Added dev-only ITI logging for file counts, names, types, sizes, provider, and status.
- Frontend shows server and file-level errors, preserves selected files, and supports Retry ITI.

Status:
Fixed

## REC-009

Title:
Move ITI uploads to direct object storage

Priority:
P0

Category:
Production Architecture Bug

Area:
ITI / File Upload / Vercel

Implementation:
- Browser uploads files directly to Vercel Blob via `@vercel/blob/client` and `/api/blob/upload`.
- ITI extraction moved to `POST /api/iti/extract` with JSON metadata only (no multipart file bodies).
- Server fetches documents from validated Blob URLs with SSRF protections.
- Per-file upload progress, retry, package summary, and Run ITI gating until all uploads succeed.
- Document metadata stores `blob_url`, `blob_pathname`, `import_session_id`, and `processing_status`.
- Temporary uploads marked `temporary`; confirmed on transaction import.

Status:
Fixed

### REC-009 Follow-up

- Verify on deployed Vercel environment with files larger than 4.5 MB and multi-file packages over 4.5 MB total.
- Scheduled cleanup job for orphaned temporary Blob files older than 24 hours.
- Authentication gate for Blob upload token generation before production launch.

## REC-011

Title:
Add OCR and vision fallback for scanned PDFs and images

Priority:
P0

Category:
AI Core Workflow Bug

Area:
ITI / PDF Parsing / OCR

Implementation:
- Added layered document-processing pipeline under `src/services/iti/document-processing/`.
- Stage 1 attempts embedded PDF text extraction; stage 2 renders PDF pages when text quality is insufficient.
- Stage 3 runs OpenAI vision (`gpt-4o-mini`) on rendered pages and uploaded JPEG/PNG images server-side from private Blob content.
- Removed the hard-stop "no readable text" failure before OCR/vision fallback is attempted.
- Per-file processing metadata now includes method, page count, warnings, and confidence.
- UI shows processing method and scanned-document analysis statuses.
- HEIC/HEIF uploads are accepted but return a clear conversion message until native support is added.
- Mock provider returns synthetic scanned-document text so local review flow still works without an API key.

Status:
In Progress

### REC-011 Follow-up

- Validate on production with a real scanned purchase agreement reaching Review Import.
- Add native HEIC/HEIF conversion support.
- Consider live per-file progress updates during long OCR/vision runs.

## Button Functionality Audit

Title:
Fix ITI upload server response handling

Priority:
P0

Category:
Bug

Area:
ITI / File Upload / Server Action

Implementation:
- Server action now always returns a predictable `{ ok, error?, extraction?, files?, warning?, provider? }` shape instead of throwing.
- Increased Next.js server action and proxy body limits to 25mb for multi-PDF uploads.
- Mock extraction fallback when `OPENAI_API_KEY` is missing returns `ok: true` with a warning.
- Added dev-only ITI logging for file counts, names, types, sizes, provider, and status.
- Frontend shows server and file-level errors, preserves selected files, and supports Retry ITI.

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
| Upload Purchase Agreement | Wizard entry / workspace | Opens ITI upload flow | Run ITI extraction + review | Functional | P0 |
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
