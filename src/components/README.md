# Real Estate Command Center — Component Library

Reusable UI building blocks for the Real Estate Command Center. Import from the design system barrel when building new features:

```tsx
import {
  PageContainer,
  PageHeader,
  DataTable,
  TextInput,
  notify,
} from "@/components/design-system";
```

Lower-level shadcn primitives live in `@/components/ui`. Feature-specific layout wrappers in `@/components/layout` and `@/components/dashboard` re-export design system components where existing pages already depend on them.

## Design principles

- Large tap targets (`min-h-11` on primary controls)
- Plain language labels
- Card-based sections with rounded corners and subtle borders
- Mobile-first layouts that stack vertically, then expand on desktop
- No business data wiring in this layer — pass props from feature modules later

---

## Buttons

| Component | Use when |
|-----------|----------|
| `PrimaryButton` | Main action on a page or dialog (Save, Add, Confirm) |
| `SecondaryButton` | Secondary actions (Cancel, Back, Filter) |
| `DestructiveButton` | Irreversible actions (Delete, Remove) |

All buttons use large sizing by default for Tater-friendly interaction.

```tsx
<PrimaryButton onClick={handleSave}>Save Transaction</PrimaryButton>
<SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
<DestructiveButton onClick={onDelete}>Delete</DestructiveButton>
```

---

## Layout

| Component | Use when |
|-----------|----------|
| `PageContainer` | Wrap every dashboard page body for consistent padding and max width |
| `PageHeader` | Page title, subtitle, and action buttons |
| `SectionHeader` | Subsection title inside a page |
| `CardGrid` | Responsive grid of cards (stats, modules, summaries) |

```tsx
<PageContainer>
  <PageHeader
    title="Transactions"
    subtitle="Track deals from contract to closing."
    primaryAction={{ label: "Add Transaction", onClick: openForm }}
    secondaryActions={[{ label: "Import", onClick: openImport }]}
  />
  <CardGrid>{/* cards */}</CardGrid>
</PageContainer>
```

---

## Cards

| Component | Use when |
|-----------|----------|
| `StatCard` | Single KPI or count (Active Deals, Due Today) |
| `InfoCard` | Explanatory content with icon and optional action |
| `DataCard` | Structured key/value or list content inside a card shell |

---

## Badges

| Component | Use when |
|-----------|----------|
| `StatusBadge` | Generic status pill with variant (`default`, `success`, `warning`, `danger`, `info`) |
| `PriorityBadge` | Task priority (`low`, `medium`, `high`, `urgent`) |
| `TransactionStatusBadge` | Pipeline stage for a transaction |
| `DeadlineBadge` | Contract deadline state (`due_today`, `due_soon`, `overdue`, `complete`) |

```tsx
<TransactionStatusBadge status="under_contract" />
<DeadlineBadge status="due_soon" />
```

---

## Feedback states

| Component | Use when |
|-----------|----------|
| `EmptyState` | No records yet; include icon, description, and one clear action |
| `LoadingState` | Data is fetching |
| `ErrorState` | Request failed; offer retry |

```tsx
<EmptyState
  icon={FileText}
  title="No transactions yet"
  description="Add your first deal to start tracking deadlines."
  actionLabel="Add Transaction"
  onAction={openForm}
  helpText="You can link contacts and tasks later."
/>
```

---

## Display helpers

| Component | Use when |
|-----------|----------|
| `UserAvatar` | Show initials or image for a user/contact |
| `PropertyAddress` | Formatted street, city, state, zip |
| `CurrencyDisplay` | Money values with consistent formatting |
| `DateDisplay` | Dates with optional relative labels |

---

## Search and filters

| Component | Use when |
|-----------|----------|
| `SearchInput` | Controlled text search field with icon |
| `FilterBar` | Row combining search, filter chips/controls, and actions |

```tsx
<FilterBar
  search={<SearchInput value={query} onChange={setQuery} placeholder="Search contacts..." />}
  filters={<PriorityBadge priority="high" />}
  actions={<SecondaryButton onClick={clearFilters}>Clear</SecondaryButton>}
/>
```

---

## Data table

`DataTable` is the standard list/table pattern for module pages.

**Supports:** sorting, search filtering, pagination, row selection, row actions, responsive card layout on mobile.

```tsx
const columns: DataTableColumn<TransactionRow>[] = [
  { id: "address", header: "Property", accessorKey: "address", sortable: true },
  { id: "status", header: "Status", cell: (row) => <TransactionStatusBadge status={row.status} /> },
];

<DataTable
  data={rows}
  columns={columns}
  selectable
  selectedIds={selectedIds}
  onSelectedIdsChange={setSelectedIds}
  rowActions={[
    { label: "Edit", onSelect: (row) => openEdit(row) },
    { label: "Delete", onSelect: (row) => confirmDelete(row), destructive: true },
  ]}
/>
```

**Requirements:**
- Each row must include a string `id`
- Use `accessorKey` for simple text sorting, or `cell` for custom renderers
- Set `hideOnMobile` on low-priority columns; mobile view shows a card per row

---

## Forms

All form controls wrap `FormField` for label, description, and error text.

| Component | Use when |
|-----------|----------|
| `TextInput` | Single-line text, email, number |
| `TextareaInput` | Multi-line notes |
| `DropdownInput` | Fixed option list (native select styling) |
| `ComboboxInput` | Searchable option list |
| `DatePickerInput` | Date selection |
| `CurrencyInput` | Dollar amounts |
| `PhoneInput` | Phone numbers |
| `CheckboxInput` | Boolean toggle with label |
| `SwitchInput` | On/off preference |
| `RadioInput` | Mutually exclusive choices |

### Validation helpers

Use Zod + React Hook Form via `@/lib/design-system/form-helpers`:

```tsx
import { z } from "zod";
import { useValidatedForm, getFieldErrorMessage } from "@/components/design-system";

const schema = z.object({
  address: z.string().min(1, "Address is required"),
});

const form = useValidatedForm(schema, { defaultValues: { address: "" } });

<TextInput
  label="Property address"
  error={getFieldErrorMessage(form.formState.errors.address)}
  {...form.register("address")}
/>
```

---

## Overlays

| Component | Use when |
|-----------|----------|
| `Modal` | General-purpose dialog with title, body, footer |
| `Drawer` | Slide-out panel (especially mobile detail views) |
| `ConfirmDialog` | Yes/no confirmation |
| `DeleteDialog` | Destructive confirmation with red delete button |

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Mark complete?"
  description="This deadline will move to Complete."
  onConfirm={handleComplete}
/>

<Drawer open={open} onOpenChange={setOpen} title="Task details" side="right">
  {/* detail content */}
</Drawer>
```

---

## Toast notifications

`ToasterProvider` is mounted in `AppProviders`. Use the `notify` helper anywhere:

```tsx
import { notify } from "@/components/design-system";

notify.success("Transaction saved");
notify.error("Could not save", "Check required fields and try again.");
notify.promise(saveDeal(), {
  loading: "Saving...",
  success: "Saved",
  error: "Save failed",
});
```

---

## Typography

Use typography tokens or helper components for consistent text hierarchy:

```tsx
import { typography, PageTitle, MutedText } from "@/components/design-system";

<h1 className={typography.pageTitle}>Dashboard</h1>
<PageTitle>Dashboard</PageTitle>
<MutedText>No items due today.</MutedText>
```

| Token / component | Role |
|-------------------|------|
| `typography.pageTitle` / `PageTitle` | Page heading |
| `typography.sectionTitle` / `SectionTitle` | Section heading |
| `typography.cardTitle` / `CardTitleText` | Card heading |
| `typography.body` / `BodyText` | Default body copy |
| `typography.bodyMuted` / `MutedText` | Secondary copy |
| `typography.label` | Form labels |
| `typography.caption` | Meta text, counts |
| `typography.eyebrow` | Small uppercase section labels |

---

## Spacing and layout tokens

From `@/lib/design-system/spacing`:

| Token | Use when |
|-------|----------|
| `spacing.page` | Page padding |
| `spacing.section` | Vertical gap between major sections |
| `spacing.stackSm` / `spacing.stackMd` | Vertical stacks inside a section |
| `spacing.inlineSm` / `spacing.inlineMd` | Horizontal gaps between controls |
| `spacing.card` | Inner card padding |
| `layout.pageMaxWidth` | Center content with max width |
| `layout.cardGrid` | Default responsive card grid |
| `layout.formGrid` | Two-column form layout on desktop |

---

## Icons

Use Lucide icons with standardized sizes via the `Icon` helper:

```tsx
import { Home } from "lucide-react";
import { Icon, iconSizes } from "@/components/design-system";

<Icon icon={Home} size="md" />
<Home className={iconSizes.sm} aria-hidden="true" />
```

Sizes: `xs`, `sm`, `md`, `lg`, `xl`.

---

## File structure

```
src/components/design-system/
  buttons/          Action buttons
  layout/           Page shell components
  cards/            Card variants
  badges/           Status and domain badges
  feedback/         Empty, loading, error
  displays/         Formatted data displays
  forms/            Form controls
  overlays/         Modal, drawer, dialogs
  search/           Search and filter bar
  tables/           DataTable
  notifications/    Toast provider and helpers
  index.ts          Barrel export
```

---

## Command Palette

The universal command palette is the global search and action launcher for the app.

```tsx
import {
  CommandPaletteProvider,
  CommandPaletteTrigger,
  useCommandPalette,
} from "@/components/command-palette";
```

| Piece | Use when |
|-------|----------|
| `CommandPaletteProvider` | Mount once in app providers (already wired) |
| `CommandPaletteTrigger` | Top bar search button with `⌘K` hint |
| `useCommandPalette` | Open/close programmatically from feature code |

**Supports:**
- `⌘K` / `Ctrl+K` keyboard shortcut
- Navigation to any module
- Quick actions from page configs
- Workspace-oriented mock record search
- Recent commands (persisted in localStorage)

Registry lives in `src/lib/command-palette/registry.ts`. Extend that file when adding new commands — do not hardcode palette items inside UI components.

---

## Transaction Progress Tracker

Reusable lifecycle tracker for Transaction Workspaces. Stage sequences are **not** hardcoded in the component — they come from transaction type definitions in `src/lib/transaction-progress/stage-definitions.ts`.

```tsx
import { TransactionProgressTracker } from "@/components/transaction-workspace";

<TransactionProgressTracker
  transactionType="residential_purchase"
  progress={[
    { stageId: "contract_signed", state: "completed", completedAt: "2026-06-18" },
    { stageId: "inspection_period", state: "active" },
  ]}
/>
```

**Stage states:** `not_started` (gray), `active` (blue), `completed` (green), `attention_required` (red)

**Supported transaction types:** `residential_purchase`, `residential_listing`, `commercial`, `land`, `investment`

Mock workspace demo: `/transactions/tx-oak-lane`

---

## What not to do

- Do not fetch database records inside design system components
- Do not add routes or change navigation from this layer
- Do not nest `Button` inside dropdown/popover triggers — apply `buttonVariants` on the trigger instead
- Prefer importing from `@/components/design-system` over duplicating styles in feature modules
