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

## 4. Tech Stack

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

## 5. Core Navigation

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

## 6. Core Modules

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

## 7. User Roles

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

## 8. Data Strategy

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

## 9. Integration Strategy

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

## 10. Coding Standards

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

## 11. Folder Strategy

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

## 12. Development Rules

Before building a major feature:
- check this PROJECT_MASTER_PLAN.md
- keep the user experience simple
- favor plain language
- make actions obvious
- make desktop useful and mobile usable
- avoid overbuilding
- preserve future expansion

Every major new feature should update this file if it changes the project direction.

## 13. Current Milestone

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
