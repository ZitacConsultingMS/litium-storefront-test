import { FacetGroupItem, RangeFacetItem } from 'models/filter';

const mockRangeFactedItemsData: RangeFacetItem[] = [
  {
    min: 300,
    max: 3500,
    selectedMin: null,
    selectedMax: null,
  },
];

const mockFacetedFiltersData: FacetGroupItem[] = [
  {
    field: 'Color',
    name: 'Color',
    __typename: 'DistinctFacet',
    items: [
      {
        name: 'Black',
        count: 55,
        selected: false,
        value: 'Black',
      },
      {
        name: 'Green',
        count: 31,
        selected: false,
        value: 'Green',
      },
      {
        name: 'White',
        count: 22,
        selected: false,
        value: 'White',
      },
      {
        name: 'Blue',
        count: 9,
        selected: false,
        value: 'Blue',
      },
      {
        name: 'Grey',
        count: 9,
        selected: false,
        value: 'Grey',
      },
    ],
  },
  {
    field: 'Brand',
    name: 'Brand',
    __typename: 'DistinctFacet',
    items: [
      {
        name: 'Casall',
        count: 31,
        selected: false,
        value: 'Casall',
      },
      {
        name: 'Essential Casall',
        count: 9,
        selected: false,
        value: 'Essential Casall',
      },
      {
        name: 'Iconic Casall',
        count: 9,
        selected: false,
        value: 'Iconic Casall',
      },
      {
        name: 'Court Casall',
        count: 6,
        selected: false,
        value: 'Court Casall',
      },
    ],
  },
  {
    field: 'Size',
    name: 'Size',
    __typename: 'DistinctFacet',
    items: [
      {
        name: 'L',
        count: 18,
        selected: false,
        value: 'L',
      },
      {
        name: 'M',
        count: 18,
        selected: false,
        value: 'M',
      },
      {
        name: 'S',
        count: 18,
        selected: false,
        value: 'S',
      },
      {
        name: 'One size',
        count: 1,
        selected: false,
        value: 'One size',
      },
    ],
  },
  {
    field: '#Price',
    name: 'Price',
    __typename: 'RangeFacet',
    items: mockRangeFactedItemsData,
  },
];

export default mockFacetedFiltersData;
