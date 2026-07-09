import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, UseFormProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ZodTypeAny } from "zod";

export function createFormOptions<TFieldValues extends FieldValues>(
  schema: ZodTypeAny,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
): UseFormProps<TFieldValues> {
  return {
    ...options,
    resolver: zodResolver(
      schema as Parameters<typeof zodResolver>[0],
    ) as UseFormProps<TFieldValues>["resolver"],
  } as UseFormProps<TFieldValues>;
}

export function useValidatedForm<TFieldValues extends FieldValues>(
  schema: ZodTypeAny,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
) {
  return useForm<TFieldValues>(createFormOptions(schema, options));
}

export function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}
