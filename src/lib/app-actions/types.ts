export type AppActionId =
  | "new_transaction"
  | "upload_purchase_agreement"
  | "add_buyer"
  | "add_listing"
  | "add_task"
  | "add_note"
  | "upload_document"
  | "add_contact"
  | "add_showing"
  | "add_template"
  | "add_expense"
  | "add_link"
  | "add_deadline"
  | "add_commission"
  | "import_deal"
  | "edit_transaction"
  | "view_deadlines"
  | "open_command_palette"
  | "open_settings"
  | "coming_soon";

export type AppActionStatus = "implemented" | "placeholder" | "disabled";

export type AppActionBehavior =
  | "route"
  | "modal"
  | "drawer"
  | "toast"
  | "callback";

export type AppActionSurface =
  | "page_header"
  | "empty_state"
  | "command_palette"
  | "workspace"
  | "dashboard";

export type AppActionDefinition = {
  id: AppActionId;
  label: string;
  status: AppActionStatus;
  behavior: AppActionBehavior;
  route?: string;
  toastTitle?: string;
  toastDescription?: string;
  disabledReason?: string;
  aliases?: string[];
  surfaces?: AppActionSurface[];
  paletteKeywords?: string[];
};

export type AppActionContext = {
  navigate: (href: string) => void;
  openCommandPalette?: () => void;
  callbacks?: Partial<Record<AppActionId, () => void>>;
};

export type AppActionAuditEntry = {
  id: AppActionId;
  label: string;
  status: AppActionStatus;
  behavior: AppActionBehavior;
  route?: string;
  aliases: string[];
  surfaces: AppActionSurface[];
};

export const APP_ACTION_IDS = [
  "new_transaction",
  "upload_purchase_agreement",
  "add_buyer",
  "add_listing",
  "add_task",
  "add_note",
  "upload_document",
  "add_contact",
  "add_showing",
  "add_template",
  "add_expense",
  "add_link",
  "add_deadline",
  "add_commission",
  "import_deal",
  "edit_transaction",
  "view_deadlines",
  "open_command_palette",
  "open_settings",
  "coming_soon",
] as const satisfies readonly AppActionId[];

export function isAppActionId(value: string): value is AppActionId {
  return (APP_ACTION_IDS as readonly string[]).includes(value);
}
