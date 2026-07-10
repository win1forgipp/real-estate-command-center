# Real Estate Command Center — Project Master Plan

## 1. Project Purpose

Real Estate Command Center is a private internal dashboard for managing real estate business operations.

It is not a public marketing website.

The goal is to consolidate daily real estate workflows into one simple dashboard for Tim and Tater, reducing the number of websites, spreadsheets, forms, reminders, and disconnected systems needed to manage transactions.

The app should feel like a private business operating system.

## 2. Primary Users

### Tim
Advanced user. Needs full access to all tools, settings, transactions, commissions, reports, templates, AI tools, and admin functions.

### Tater
Simplified user experience. Needs large buttons, plain language, minimal clicks, and limited clutter.

The app must always be designed so a non-technical user can understand what to do next.

## 3. Design Philosophy

Do not prioritize public branding yet.

Prioritize:
- clarity
- speed
- simplicity
- low clutter
- fewer clicks
- large obvious actions
- mobile usability
- desktop command-center layout

Desktop layout:
- left sidebar navigation
- top header bar
- main content area
- card-based dashboard sections

Mobile layout:
- hamburger menu
- collapsed navigation
- simplified vertical card layout
- large tap targets

Visual style:
- clean dashboard interface
- soft neutral background
- rounded cards
- subtle shadows or borders
- status badges
- simple icons
- clear headings
- obvious quick actions

## User-Facing Naming and Capitalization Standards

All user-visible text must use readable capitalization and labels. Machine values must never appear directly in the UI.

### Person names
- Use Title Case: Tim Brady, Rory Benson, John Smith
- Capitalize the first letter of first and last names
- Preserve valid special capitalization such as McDonald, MacArthur, O'Connor, de la Cruz, ABC Title, eXp Realty, and MKB, REALTORS®
- For person-name inputs, capitalize each entered segment by default while allowing manual correction

### Proper nouns and business names
- Company, brokerage, city, state, title company, lender, attorney, street, and document titles use readable capitalization
- Acronyms remain uppercase: MLS, EMD, HOA, VA, FHA, ITI, RVAR

### Enum and machine values
- `buyer_representation` displays as Buyer Representation
- `under_contract` displays as Under Contract
- `title_company` displays as Title Company
- Never show UUIDs, database IDs, snake_case, or lowercase machine values in normal UI fields

### Formatting scope
Apply naming helpers on new records, imported ITI data, displayed legacy data, dropdown labels, tables, and workspace summaries without destructively rewriting valid stored capitalization.

## 4. Core Design Principle: Workspaces

The Real Estate Command Center is built around Workspaces, not individual records.

A Transaction is more than a database entry—it is the operational workspace where all activity related to that transaction takes place.

Whenever possible, users should complete work from within a single workspace rather than navigating between multiple modules.

Each Transaction Workspace will eventually include:

### Overview
- Transaction status
- Progress timeline
- Quick actions
- Property summary
- Buyer/Seller summary

### Contacts
- Buyers
- Sellers
- Agents
- Lender
- Attorney
- Inspector
- Contractor
- Title company

### Deadlines
- Inspection
- Financing
- Appraisal
- Earnest Money
- Closing
- Walkthrough
- Custom milestones

### Task Checklist
- Automatically generated based on transaction type
- User-created tasks
- Completed tasks
- Overdue tasks

### Documents
- Purchase agreement
- Addenda
- Inspections
- Repair documents
- Closing documents
- Google Drive links
- Dotloop links
- MLS links

### Notes
- Transaction notes
- Phone call log
- Meeting notes
- AI summaries

### Commission
- Expected commission
- Split
- Referral fees
- Estimated taxes
- Net income

### Timeline
- Chronological history of the transaction
- Notes
- Emails
- Tasks completed
- Status changes
- Uploaded documents

### Communication
- Email history
- Text history (future)
- Call log (future)

### AI Assistant
Future capability:
- Summarize transaction status
- Generate emails
- Draft contingency removals
- Draft repair responses
- Answer transaction questions
- Identify missing documents
- Suggest next actions

### Related Records
- Linked contacts
- Related listings
- Future referrals
- Previous transactions

Every major future module should be designed to plug into a Transaction Workspace whenever practical.

The Transaction Workspace is the primary operating screen of the application and should minimize the need for users to switch between modules.

## 5. Core Design Principle: 360° Workspaces

The application is built around a 360° Workspace philosophy.

Every major record in the system should eventually have its own dedicated Workspace.

Examples include:

- Transaction Workspace
- Contact Workspace
- Property Workspace
- Listing Workspace
- Buyer Workspace
- Seller Workspace

Each Workspace should become the single place where users complete work related to that record.

Avoid forcing users to jump between multiple modules.

### Transaction Workspace

Eventually contains:

- Overview
- Contacts
- Property Information
- Timeline
- Tasks
- Contract Deadlines
- Documents
- Notes
- Commission
- Communication
- AI Assistant
- Activity Feed
- Related Records

### Contact Workspace

Eventually contains:

- Contact Profile
- Role(s)
- Current Transactions
- Previous Transactions
- Listings
- Buyer Activity
- Notes
- Tasks
- Emails
- Documents
- Referral History
- Timeline
- AI Summary

### Property Workspace

Eventually contains:

- Property Summary
- Listing Information
- MLS Information
- Showing History
- Offers
- Transaction History
- Photos
- Documents
- Notes
- Deadlines
- Related Contacts
- Timeline
- AI Summary

### Listing Workspace

Eventually contains:

- Listing Status
- Price History
- Marketing
- Showing Feedback
- Offers
- Documents
- Timeline
- Tasks

### Buyer Workspace

Eventually contains:

- Buyer Preferences
- Saved Searches
- Favorite Properties
- Showing History
- Active Transactions
- Notes
- Communication
- Timeline

### Seller Workspace

Eventually contains:

- Active Listings
- Previous Listings
- Showing Feedback
- Offers
- Documents
- Timeline
- Communication

### Universal Rules

Every Workspace should eventually support:

- Overview tab
- Timeline tab
- Notes
- Documents
- Tasks
- AI Assistant
- Related Records
- Quick Actions
- Search
- Activity Feed

Each workspace should feel like an operating console instead of a traditional database record.

## 6. Core Design Principle: Global Activity Timeline

### Purpose

The Real Estate Command Center should maintain a unified activity timeline across the entire application.

Every meaningful action should eventually generate an activity event.

Examples include:

- Transaction created
- Transaction status changed
- Contact added
- Property added
- Deadline completed
- Task completed
- Document uploaded
- Commission updated
- Note created
- Listing status changed
- Showing completed
- Offer received
- Offer accepted
- Closing completed
- AI-generated document
- AI-generated summary

The activity timeline should support:

- filtering by workspace
- filtering by user
- filtering by transaction
- filtering by property
- filtering by contact
- filtering by date
- filtering by activity type

Every major workspace should contain a Timeline tab showing only activity related to that workspace.

The Dashboard should eventually include a Recent Activity card showing the latest business activity across all workspaces.

Future AI functionality may summarize activity timelines into daily, weekly, or transaction-specific summaries.

## 7. Tech Stack

- Next.js 15
- React 19
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- Zod
- React Hook Form
- Turso database
- Vercel hosting
- GitHub source control

## 8. Core Navigation

Initial navigation should include:

- Dashboard
- Transactions
- Buyers
- Sellers / Listings
- Contract Deadlines
- Tasks
- Contacts
- Showings
- Documents / Links
- Templates
- Commission Tracker
- Mileage / Expenses
- Settings

## 9. Core Modules

### Dashboard
High-level overview of business activity.

Cards may include:
- active transactions
- upcoming deadlines
- tasks due today
- closings this month
- commission pipeline
- active listings
- buyer leads
- needs attention
- quick links
- recent notes

### Transactions
Track buyer and seller transactions from contract to closing.

Should eventually include:
- property address
- client names
- transaction type
- status
- purchase price
- closing date
- inspection deadline
- appraisal deadline
- financing deadline
- contingency deadlines
- EMD status
- documents
- notes
- linked contacts
- task checklist

### Buyers
Manage buyer clients, preferences, search criteria, notes, lenders, showing history, and transaction links.

### Sellers / Listings
Manage listing prep, listing status, showings, feedback, offers, seller documents, pricing notes, and marketing tasks.

### Contract Deadlines
Central deadline tracker for all active transactions.

Must be simple and highly visible.

Use plain language:
- Due Today
- Due Soon
- Overdue
- Complete

### Tasks
Simple task system tied to clients, properties, transactions, or general business items.

### Contacts
CRM-style contact database for buyers, sellers, agents, lenders, inspectors, attorneys, contractors, title companies, and vendors.

### Showings
Track showing appointments, property feedback, buyer notes, and follow-up items.

### Documents / Links
Central hub for important real estate websites, forms, uploaded PDFs, Google Drive links, RVAR resources, brokerage links, MLS links, and transaction files.

### Templates
Reusable language and forms for:
- addenda
- contingency removal
- repair responses
- offer summaries
- buyer emails
- seller updates
- inspection language
- closing instructions
- social posts

### Commission Tracker
Track expected and received commissions by transaction.

Should eventually include:
- gross commission
- split
- referral fees
- broker fees
- estimated taxes
- net commission
- payment status

### Mileage / Expenses
Track mileage, business expenses, categories, and reports.

### Settings
User management, roles, preferences, integrations, database settings, and app configuration.

## 10. User Roles

Initial roles:

### Admin
Full access. Intended for Tim.

### Partner
Simplified full-business access. Intended for Tater.

### Future Optional Roles
- assistant
- transaction coordinator
- read-only
- accountant

Do not overbuild these yet, but structure code so roles can be added later.

## 11. Data Strategy

Use Turso as the main database.

Design the database in phases.

Do not build every table at once unless needed.

Start with:
- users
- contacts
- transactions
- tasks
- deadlines
- notes
- links

Future tables may include:
- documents
- commissions
- expenses
- mileage
- templates
- showing feedback
- integrations
- audit logs

## 12. Integration Strategy

Future integrations may include:
- Google Calendar
- Gmail
- Google Drive
- MLS links
- RVAR forms
- Dotloop / SkySlope if available
- Vercel
- Turso
- AI tools
- PDF generation
- email reminders
- SMS reminders

Build the app modularly so integrations can be added later without rewriting the core dashboard.

## 13. Coding Standards

Use:
- TypeScript
- App Router
- reusable components
- feature-based folders
- server actions where appropriate
- Zod schemas for validation
- React Hook Form for forms
- TanStack Query where client-side data fetching is useful
- shadcn/ui components for consistency
- Lucide React icons

Avoid:
- hardcoded business logic scattered across pages
- giant files
- duplicate components
- overcomplicated UI
- premature optimization
- fake marketing pages

## 14. Folder Strategy

Use the existing structure:

src/app
src/components
src/components/layout
src/components/ui
src/components/dashboard
src/components/providers
src/features
src/hooks
src/lib
src/services
src/types
src/utils
src/styles

As features grow, create feature folders such as:

src/features/transactions
src/features/contacts
src/features/tasks
src/features/deadlines
src/features/commissions
src/features/documents
src/features/templates

## 15. Development Rules

Before building a major feature:
- check this PROJECT_MASTER_PLAN.md
- keep the user experience simple
- favor plain language
- make actions obvious
- make desktop useful and mobile usable
- avoid overbuilding
- preserve future expansion

Every major new feature should update this file if it changes the project direction.

## 16. Current Milestone

Milestone 1:
- GitHub repository created
- Next.js app scaffolded
- TypeScript, Tailwind, shadcn/ui, TanStack Query, Zod, React Hook Form installed
- App builds successfully
- Blank app shell running locally

Next milestone:
- Build responsive dashboard layout shell
- Add desktop sidebar
- Add mobile hamburger menu
- Add top header
- Add placeholder dashboard cards
- Add navigation structure
- Use mock data only
- Do not connect Turso yet

## 17. Future Milestone: Document Intake + AI Extraction

**Status: Planned — do not implement yet.**

This future milestone will allow users to upload or scan real estate documents, especially purchase agreements, and have AI extract important transaction data into the command center.

### Intended Capabilities

- PDF upload
- Mobile upload
- Mobile camera scan support
- Attach documents to transactions, contacts, properties, and workspaces
- AI extraction of key fields
- User review before saving extracted data
- Manual edits after saving
- Original document preserved and linked
- Extracted data should populate transaction fields, deadlines, contacts, notes, and checklist items where appropriate
- Changes should create activity timeline events

### Key Fields to Extract

- Property address
- Buyer names
- Seller names
- Purchase price
- Contract date
- Closing date
- Inspection period
- Financing deadline
- Appraisal deadline
- Earnest money amount
- Earnest money due date
- Title or closing company
- Lender
- Agents
- Contingency dates
- Special terms
- Commission details if available

### Implementation Notes

- This milestone should plug into Transaction Workspaces and the Global Activity Timeline architecture.
- Extraction must always require user confirmation before writing to the database.
- The source document must remain linked to the transaction record after extraction.

## Deployment

Database migrations are applied manually before deploy. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full checklist.
- Build only after core workspace, document storage, and activity timeline foundations are in place.
