export type PrejudiceCategory =
  | "RACISMO"
  | "MACHISMO"
  | "HOMOFOBIA"
  | "GORDOFOBIA"
  | "CAPACITISMO"
  | "XENOFOBIA"
  | "RELIGIAO"
  | "ETARISMO"
  | "CLASSISMO"
  | "POLITICA";

export type CategoryScore = {
  category: PrejudiceCategory;
  count: number;
  percentage: number;
};

export type PrejudiceStats = {
  categories: CategoryScore[];
  totalTaggedCardsSubmitted: number;
};
