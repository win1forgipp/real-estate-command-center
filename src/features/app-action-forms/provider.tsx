"use client";

import { useCallback, useEffect, useState } from "react";
import type { z } from "zod";

import { notify } from "@/components/design-system/notifications/toast";
import { useValidatedForm } from "@/lib/design-system/form-helpers";
import { subscribeToAppActionEvent } from "@/lib/app-actions";
import type { AppActionId } from "@/lib/app-actions/types";
import {
  createBuyerAction,
  createContactAction,
  createDeadlineAction,
  createLinkAction,
  createListingAction,
  createShowingAction,
  createTaskAction,
  getFormOptionsAction,
  updateCommissionAction,
  type FormOptionsData,
} from "@/features/app-action-forms/actions";
import {
  ActionFormFooter,
  ActionFormModal,
} from "@/features/app-action-forms/action-form-modal";
import {
  BuyerFormFields,
  CommissionFormFields,
  ContactFormFields,
  DeadlineFormFields,
  InfoPanel,
  LinkFormFields,
  ListingFormFields,
  MileageFormFields,
  PreferencesFormFields,
  ShowingFormFields,
  TaskFormFields,
  TemplateFormFields,
} from "@/features/app-action-forms/form-fields";
import {
  buyerFormSchema,
  commissionFormSchema,
  contactFormSchema,
  deadlineFormSchema,
  linkFormSchema,
  listingFormSchema,
  mileageFormSchema,
  parseCurrencyField,
  preferencesFormSchema,
  showingFormSchema,
  taskFormSchema,
  templateFormSchema,
} from "@/features/app-action-forms/schemas";

const FORM_ACTION_IDS: AppActionId[] = [
  "add_buyer",
  "add_listing",
  "add_contact",
  "add_showing",
  "add_deadline",
  "add_task",
  "add_link",
  "add_template",
  "add_commission",
  "add_expense",
  "open_settings",
  "open_profile",
  "open_help",
  "sign_out",
];

const TEMPLATE_STORAGE_KEY = "rec-command-center-templates";
const MILEAGE_STORAGE_KEY = "rec-command-center-mileage";

function saveLocalEntry(key: string, entry: Record<string, unknown>) {
  const current = JSON.parse(localStorage.getItem(key) || "[]") as unknown[];
  current.push({ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(current));
}

export function AppActionFormsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openActionId, setOpenActionId] = useState<AppActionId | null>(null);
  const [formOptions, setFormOptions] = useState<FormOptionsData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = useCallback(() => setOpenActionId(null), []);

  useEffect(() => {
    const unsubscribers = FORM_ACTION_IDS.map((actionId) =>
      subscribeToAppActionEvent(actionId, () => setOpenActionId(actionId)),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!openActionId) {
      return;
    }

    if (
      formOptions ||
      openActionId === "open_profile" ||
      openActionId === "open_help" ||
      openActionId === "sign_out"
    ) {
      return;
    }

    void getFormOptionsAction().then(setFormOptions);
  }, [formOptions, openActionId]);

  const buyerForm = useValidatedForm<z.infer<typeof buyerFormSchema>>(buyerFormSchema, {
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });
  const listingForm = useValidatedForm<z.infer<typeof listingFormSchema>>(listingFormSchema, {
    defaultValues: {
      propertyAddress: "",
      city: "",
      state: "",
      zip: "",
      sellerName: "",
      listingStatus: "active",
    },
  });
  const contactForm = useValidatedForm<z.infer<typeof contactFormSchema>>(contactFormSchema, {
    defaultValues: {
      contactType: "other",
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      notes: "",
    },
  });
  const showingForm = useValidatedForm<z.infer<typeof showingFormSchema>>(showingFormSchema, {
    defaultValues: {
      propertyAddress: "",
      contactId: "",
      buyerLabel: "",
      showingDate: "",
      showingTime: "",
      notes: "",
    },
  });
  const deadlineForm = useValidatedForm<z.infer<typeof deadlineFormSchema>>(deadlineFormSchema, {
    defaultValues: {
      transactionId: "",
      deadlineType: "inspection",
      dueDate: "",
      notes: "",
    },
  });
  const taskForm = useValidatedForm<z.infer<typeof taskFormSchema>>(taskFormSchema, {
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      transactionId: "",
    },
  });
  const linkForm = useValidatedForm<z.infer<typeof linkFormSchema>>(linkFormSchema, {
    defaultValues: {
      title: "",
      url: "",
      linkType: "other",
      transactionId: "",
    },
  });
  const templateForm = useValidatedForm<z.infer<typeof templateFormSchema>>(templateFormSchema, {
    defaultValues: { title: "", category: "", body: "" },
  });
  const commissionForm = useValidatedForm<z.infer<typeof commissionFormSchema>>(commissionFormSchema, {
    defaultValues: {
      transactionId: "",
      commissionExpected: "",
      commissionReceived: "",
    },
  });
  const mileageForm = useValidatedForm<z.infer<typeof mileageFormSchema>>(mileageFormSchema, {
    defaultValues: {
      tripDate: "",
      startLocation: "",
      endLocation: "",
      miles: "",
      purpose: "",
    },
  });
  const preferencesForm = useValidatedForm<z.infer<typeof preferencesFormSchema>>(preferencesFormSchema, {
    defaultValues: {
      displayName: "",
      emailNotifications: true,
      dailyDigest: false,
    },
  });

  const submitBuyer = buyerForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createBuyerAction(values);
      notify.success("Buyer saved", "The buyer contact was added.");
      buyerForm.reset();
      close();
    } catch {
      notify.error("Could not save buyer");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitListing = listingForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createListingAction(values);
      notify.success("Listing saved", "Seller contact and listing transaction were created.");
      listingForm.reset();
      close();
    } catch {
      notify.error("Could not save listing");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitContact = contactForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createContactAction(values);
      notify.success("Contact saved", "The contact was added.");
      contactForm.reset();
      close();
    } catch {
      notify.error("Could not save contact");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitShowing = showingForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const contactLabel = formOptions?.contacts.find((c) => c.value === values.contactId)?.label;
      await createShowingAction({
        ...values,
        contactId: values.contactId || undefined,
        buyerLabel: values.buyerLabel || contactLabel,
      });
      notify.success("Showing scheduled", "Saved as a task for now.");
      showingForm.reset();
      close();
    } catch {
      notify.error("Could not schedule showing");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitDeadline = deadlineForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createDeadlineAction(values);
      notify.success("Deadline saved", "The contract deadline was added.");
      deadlineForm.reset();
      close();
    } catch {
      notify.error("Could not save deadline");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitTask = taskForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createTaskAction({
        ...values,
        transactionId: values.transactionId || undefined,
      });
      notify.success("Task saved", "The task was added.");
      taskForm.reset();
      close();
    } catch {
      notify.error("Could not save task");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitLink = linkForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await createLinkAction({
        ...values,
        transactionId: values.transactionId || undefined,
      });
      notify.success("Link saved", "The document link was added.");
      linkForm.reset();
      close();
    } catch {
      notify.error("Could not save link");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitTemplate = templateForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      saveLocalEntry(TEMPLATE_STORAGE_KEY, values);
      notify.success(
        "Template saved locally",
        "Database persistence is pending. Your template is stored in this browser.",
      );
      templateForm.reset();
      close();
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitCommission = commissionForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await updateCommissionAction({
        transactionId: values.transactionId,
        commissionExpected: parseCurrencyField(values.commissionExpected),
        commissionReceived: parseCurrencyField(values.commissionReceived),
      });
      notify.success("Commission updated", "Transaction commission fields were saved.");
      commissionForm.reset();
      close();
    } catch {
      notify.error("Could not save commission");
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitMileage = mileageForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      saveLocalEntry(MILEAGE_STORAGE_KEY, values);
      notify.success(
        "Mileage saved locally",
        "Database persistence is pending. Your entry is stored in this browser.",
      );
      mileageForm.reset();
      close();
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitPreferences = preferencesForm.handleSubmit(async () => {
    notify.success(
      "Preferences preview saved",
      "Account preferences will sync once authentication is added.",
    );
    close();
  });

  const options = formOptions ?? { transactions: [], contacts: [] };

  return (
    <>
      {children}

      <ActionFormModal
        open={openActionId === "add_buyer"}
        onOpenChange={(open) => !open && close()}
        title="Add Buyer"
        description="Save a buyer contact to your CRM list."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitBuyer}
            isSubmitting={isSubmitting}
          />
        }
      >
        <BuyerFormFields form={buyerForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_listing"}
        onOpenChange={(open) => !open && close()}
        title="Add Listing"
        description="Create a seller contact and listing transaction placeholder."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitListing}
            isSubmitting={isSubmitting}
          />
        }
      >
        <ListingFormFields form={listingForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_contact"}
        onOpenChange={(open) => !open && close()}
        title="Add Contact"
        description="Add a contact to your CRM."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitContact}
            isSubmitting={isSubmitting}
          />
        }
      >
        <ContactFormFields form={contactForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_showing"}
        onOpenChange={(open) => !open && close()}
        title="Schedule Showing"
        description="Schedule a showing and save it as a task for now."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitShowing}
            submitLabel="Schedule"
            isSubmitting={isSubmitting}
          />
        }
      >
        <ShowingFormFields form={showingForm} options={options} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_deadline"}
        onOpenChange={(open) => !open && close()}
        title="Add Deadline"
        description="Add a contract deadline to a transaction."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitDeadline}
            isSubmitting={isSubmitting}
          />
        }
      >
        <DeadlineFormFields form={deadlineForm} options={options} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_task"}
        onOpenChange={(open) => !open && close()}
        title="Add Task"
        description="Create a follow-up task."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitTask}
            isSubmitting={isSubmitting}
          />
        }
      >
        <TaskFormFields form={taskForm} options={options} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_link"}
        onOpenChange={(open) => !open && close()}
        title="Add Link"
        description="Save a document or resource link."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitLink}
            isSubmitting={isSubmitting}
          />
        }
      >
        <LinkFormFields form={linkForm} options={options} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_template"}
        onOpenChange={(open) => !open && close()}
        title="Create Template"
        description="Save reusable language for emails and documents."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitTemplate}
            submitLabel="Save Template"
            isSubmitting={isSubmitting}
          />
        }
      >
        <TemplateFormFields form={templateForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_commission"}
        onOpenChange={(open) => !open && close()}
        title="Add Commission"
        description="Update expected and received commission on a transaction."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitCommission}
            isSubmitting={isSubmitting}
          />
        }
      >
        <CommissionFormFields form={commissionForm} options={options} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "add_expense"}
        onOpenChange={(open) => !open && close()}
        title="Add Mileage"
        description="Log a mileage entry for your records."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitMileage}
            isSubmitting={isSubmitting}
          />
        }
      >
        <MileageFormFields form={mileageForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "open_settings"}
        onOpenChange={(open) => !open && close()}
        title="Preferences"
        description="Preview your app preferences."
        footer={
          <ActionFormFooter
            onCancel={close}
            onSubmit={submitPreferences}
            submitLabel="Save Preferences"
            isSubmitting={isSubmitting}
          />
        }
      >
        <PreferencesFormFields form={preferencesForm} />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "open_profile"}
        onOpenChange={(open) => !open && close()}
        title="Profile"
        description="Your account profile preview."
        footer={<ActionFormFooter onCancel={close} onSubmit={close} submitLabel="Close" />}
      >
        <InfoPanel
          title="Profile preview"
          body="User profiles and authentication are not enabled yet. This menu confirms the user box is interactive."
        />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "open_help"}
        onOpenChange={(open) => !open && close()}
        title="Help"
        description="Quick help for the Command Center."
        footer={<ActionFormFooter onCancel={close} onSubmit={close} submitLabel="Close" />}
      >
        <InfoPanel
          title="Need help?"
          body="Use the command palette (Cmd+K) to jump to modules and actions. Core create buttons now open forms instead of placeholder toasts."
        />
      </ActionFormModal>

      <ActionFormModal
        open={openActionId === "sign_out"}
        onOpenChange={(open) => !open && close()}
        title="Sign Out"
        description="Authentication is not enabled yet."
        footer={<ActionFormFooter onCancel={close} onSubmit={close} submitLabel="Close" />}
      >
        <InfoPanel
          title="Sign out placeholder"
          body="Sign out will be available once authentication is added. No session changes were made."
        />
      </ActionFormModal>
    </>
  );
}
