export const spacing = {
  page: "px-4 py-5 md:px-6 md:py-6",
  section: "space-y-6",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  inlineSm: "gap-2",
  inlineMd: "gap-4",
  card: "p-5 md:p-6",
} as const;

export const layout = {
  pageMaxWidth: "mx-auto w-full max-w-7xl",
  cardGrid:
    "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  formGrid: "grid grid-cols-1 gap-4 md:grid-cols-2",
} as const;
