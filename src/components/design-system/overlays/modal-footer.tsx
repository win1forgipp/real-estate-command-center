/**
 * ModalFooter — the single shared footer shell for every overlay in this app.
 *
 * All modals, drawers, wizards, confirmation dialogs, and slide-overs MUST use
 * `ModalFooter` (and `ModalFooterActions` when rendering buttons). Do not add
 * custom padding, margin, or layout classes to individual dialog footers.
 *
 * Spacing, safe-area insets, and responsive button alignment are handled here.
 */
import { cn } from "@/lib/utils";

/** Base footer shell styles. Applied automatically — do not override per modal. */
export const modalFooterClassName =
  "mt-auto shrink-0 border-t border-border/70 bg-muted/30 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6";

type ModalFooterProps = React.ComponentProps<"div">;

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(modalFooterClassName, className)}
      {...props}
    />
  );
}

type ModalFooterActionsProps = {
  /** Secondary action (Back, Cancel). Aligned left on desktop. */
  secondaryAction?: React.ReactNode;
  /** Primary action (Continue, Save, Create). Aligned right on desktop. */
  primaryAction?: React.ReactNode;
  className?: string;
};

/**
 * ModalFooterActions — standard button row for overlay footers.
 *
 * Desktop: secondary left, primary right.
 * Mobile: full-width stacked buttons with 44px touch targets and safe-area padding
 * provided by the parent `ModalFooter`.
 */
export function ModalFooterActions({
  secondaryAction,
  primaryAction,
  className,
}: ModalFooterActionsProps) {
  if (!secondaryAction && !primaryAction) {
    return null;
  }

  return (
    <div
      data-slot="modal-footer-actions"
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {secondaryAction ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {secondaryAction}
        </div>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}
      {primaryAction ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
          {primaryAction}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use `ModalFooter` instead. Kept for transitional imports. */
export const OverlayFooter = ModalFooter;

/** @deprecated Use `modalFooterClassName` instead. */
export const overlayFooterClassName = modalFooterClassName;
