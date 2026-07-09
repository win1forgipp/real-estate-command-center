import type { AppActionDefinition, AppActionId } from "@/lib/app-actions/types";

function modalAction(
  config: Pick<
    AppActionDefinition,
    "id" | "label" | "aliases" | "surfaces" | "paletteKeywords" | "toastDescription"
  >,
): AppActionDefinition {
  return {
    status: "implemented",
    behavior: "modal",
    ...config,
  };
}

function placeholderAction(
  config: Pick<
    AppActionDefinition,
    "id" | "label" | "aliases" | "surfaces" | "paletteKeywords" | "toastDescription"
  >,
): AppActionDefinition {
  return {
    status: "placeholder",
    behavior: "toast",
    toastTitle: `${config.label} is coming soon.`,
    ...config,
  };
}

export const appActionRegistry: Record<AppActionId, AppActionDefinition> = {
  new_transaction: {
    id: "new_transaction",
    label: "New Transaction",
    status: "implemented",
    behavior: "modal",
    route: "/transactions?new=1",
    aliases: ["Add Transaction"],
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: [
      "new transaction",
      "add transaction",
      "create transaction",
      "deal",
    ],
  },
  upload_purchase_agreement: {
    id: "upload_purchase_agreement",
    label: "Upload Purchase Agreement",
    status: "implemented",
    behavior: "modal",
    route: "/transactions?new=1&iti=1",
    surfaces: ["workspace"],
    paletteKeywords: ["upload", "purchase agreement", "iti", "import"],
  },
  add_buyer: modalAction({
    id: "add_buyer",
    label: "Add Buyer",
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["buyer", "client"],
  }),
  add_listing: modalAction({
    id: "add_listing",
    label: "Add Listing",
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["listing", "seller"],
  }),
  add_task: modalAction({
    id: "add_task",
    label: "Add Task",
    surfaces: ["page_header", "empty_state", "command_palette", "workspace", "dashboard"],
    paletteKeywords: ["task", "follow-up"],
  }),
  add_note: placeholderAction({
    id: "add_note",
    label: "Add Note",
    surfaces: ["workspace", "command_palette"],
    paletteKeywords: ["note"],
  }),
  upload_document: placeholderAction({
    id: "upload_document",
    label: "Upload Document",
    surfaces: ["workspace"],
    paletteKeywords: ["document", "upload", "file"],
  }),
  add_contact: modalAction({
    id: "add_contact",
    label: "Add Contact",
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["contact", "crm"],
  }),
  add_showing: modalAction({
    id: "add_showing",
    label: "Schedule Showing",
    aliases: ["Add Showing"],
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["showing", "schedule", "appointment"],
  }),
  add_template: modalAction({
    id: "add_template",
    label: "Create Template",
    aliases: ["Add Template"],
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["template", "email", "addendum"],
  }),
  add_expense: modalAction({
    id: "add_expense",
    label: "Add Expense",
    aliases: ["Add Mileage"],
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["expense", "mileage"],
  }),
  add_link: modalAction({
    id: "add_link",
    label: "Add Link",
    surfaces: ["page_header", "empty_state", "workspace", "command_palette"],
    paletteKeywords: ["link", "document", "drive"],
  }),
  add_deadline: modalAction({
    id: "add_deadline",
    label: "Add Deadline",
    surfaces: ["page_header", "empty_state", "workspace", "command_palette"],
    paletteKeywords: ["deadline", "contract date"],
  }),
  add_commission: modalAction({
    id: "add_commission",
    label: "Add Commission",
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["commission", "payout"],
  }),
  import_deal: placeholderAction({
    id: "import_deal",
    label: "Import Deal",
    surfaces: ["page_header", "command_palette"],
    paletteKeywords: ["import", "deal"],
  }),
  edit_transaction: placeholderAction({
    id: "edit_transaction",
    label: "Edit",
    aliases: ["Edit Transaction"],
    surfaces: ["workspace"],
  }),
  view_deadlines: {
    id: "view_deadlines",
    label: "View Deadlines",
    status: "implemented",
    behavior: "route",
    route: "/deadlines",
    surfaces: ["dashboard", "command_palette"],
    paletteKeywords: ["deadlines", "contract dates"],
  },
  open_command_palette: {
    id: "open_command_palette",
    label: "Open Command Palette",
    status: "implemented",
    behavior: "callback",
    surfaces: ["command_palette"],
    paletteKeywords: ["command", "search", "palette"],
  },
  open_settings: modalAction({
    id: "open_settings",
    label: "Open Preferences",
    aliases: ["Open Settings"],
    surfaces: ["page_header", "empty_state", "command_palette"],
    paletteKeywords: ["settings", "preferences"],
  }),
  open_profile: modalAction({
    id: "open_profile",
    label: "Profile",
    surfaces: ["dashboard"],
    paletteKeywords: ["profile", "user"],
  }),
  open_help: modalAction({
    id: "open_help",
    label: "Help",
    surfaces: ["dashboard"],
    paletteKeywords: ["help", "support"],
  }),
  sign_out: modalAction({
    id: "sign_out",
    label: "Sign Out",
    aliases: ["Logout"],
    surfaces: ["dashboard"],
    paletteKeywords: ["sign out", "logout"],
  }),
  coming_soon: {
    id: "coming_soon",
    label: "Coming Soon",
    status: "placeholder",
    behavior: "toast",
    toastTitle: "This feature is coming soon.",
  },
};

const labelIndex = new Map<string, AppActionId>();

for (const action of Object.values(appActionRegistry)) {
  labelIndex.set(action.label.toLowerCase(), action.id);

  for (const alias of action.aliases ?? []) {
    labelIndex.set(alias.toLowerCase(), action.id);
  }
}

export function getAppAction(actionId: AppActionId): AppActionDefinition {
  return appActionRegistry[actionId];
}

export function getAllAppActions(): AppActionDefinition[] {
  return Object.values(appActionRegistry);
}

export function resolveActionId(labelOrId: string): AppActionId | null {
  if ((labelOrId as AppActionId) in appActionRegistry) {
    return labelOrId as AppActionId;
  }

  return labelIndex.get(labelOrId.toLowerCase()) ?? null;
}

export function getActionLabel(actionId: AppActionId): string {
  return getAppAction(actionId).label;
}

export function getPaletteActions(): AppActionDefinition[] {
  return getAllAppActions().filter((action) =>
    action.surfaces?.includes("command_palette"),
  );
}

export const NEW_TRANSACTION_LAUNCH_PATH = "/transactions?new=1";
