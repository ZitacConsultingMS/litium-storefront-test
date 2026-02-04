export interface DistinctFacetItem {
  name: string;
  count: number;
  selected: boolean;
  value: string;
}

export interface RangeFacetItem {
  min: number;
  max: number;
  selectedMin: number | null;
  selectedMax: number | null;
}

export interface FacetGroupItem {
  field: string;
  name: string;
  items: DistinctFacetItem[] | RangeFacetItem[];
  __typename: string;
}

export interface SortResultItem {
  selected: boolean;
  field: string;
  order: string;
  name: string;
}
