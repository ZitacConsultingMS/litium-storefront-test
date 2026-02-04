import { ProductItem } from 'models/(zitac)/products';

interface ProductTagsProductFieldValues {
  productTagsTag: {
    name: string;
    value: string;
  }[];
  productTagsFromDate: string | null;
  productTagsToDate: string | null;
}

interface ArtikelmedaljerTagsProps {
  fieldGroups?: ProductItem['fieldGroups'];
  className?: string;
}

/**
 * Filters product tags based on date range
 * Returns true if current date is within the tag's date range
 */
function isTagActive(tag: ProductTagsProductFieldValues): boolean {
  const now = Date.now();
  const from = tag.productTagsFromDate
    ? new Date(tag.productTagsFromDate).getTime()
    : Number.NEGATIVE_INFINITY;
  const to = tag.productTagsToDate
    ? new Date(tag.productTagsToDate).getTime()
    : Number.POSITIVE_INFINITY;
  const fromOk = isFinite(from) ? from <= now : true;
  const toOk = isFinite(to) ? now <= to : true;
  return fromOk && toOk;
}

/**
 * Displays product tags from the Artikelmedaljer field group
 */
function ArtikelmedaljerTags({
  fieldGroups,
  className = '',
}: ArtikelmedaljerTagsProps) {
  const artikelmedaljer = fieldGroups?.find(
    (group) => group.fieldGroupId === 'Artikelmedaljer'
  );
  const groupFields: any[] = (artikelmedaljer?.fields as any[]) || [];
  const productTags = groupFields
    .flatMap((f: any) => f?.productTagsProductFieldValues || [])
    .filter(Boolean) as ProductTagsProductFieldValues[];

  // Filter tags based on date range
  const activeProductTags = productTags.filter(isTagActive);

  if (activeProductTags.length === 0) {
    return null;
  }

  return (
    <div
      className={`absolute left-4 top-4 z-10 flex flex-wrap gap-1.5 ${className}`}
    >
      {activeProductTags.map(
        (tagEntry: ProductTagsProductFieldValues, index: number) =>
          tagEntry.productTagsTag.map((tag, tagIndex: number) => (
            <span
              key={`${index}-${tagIndex}`}
              className="af:bg-[#7CC8D0] af:text-af-bluegreen inline-flex items-center rounded-[3px] bg-seasea-blue px-2 py-1 text-xs text-white"
              data-testid={`artikelmedaljer-tag-${tag.value}`}
            >
              {tag.name}
            </span>
          ))
      )}
    </div>
  );
}

export default ArtikelmedaljerTags;

export function hasActiveArtikelmedaljer(
  fieldGroups?: ProductItem['fieldGroups']
): boolean {
  const group = fieldGroups?.find((g) => g.fieldGroupId === 'Artikelmedaljer');
  const tags = ((group?.fields as any[]) || [])
    .flatMap((f: any) => f?.productTagsProductFieldValues || [])
    .filter(Boolean) as ProductTagsProductFieldValues[];

  const now = Date.now();
  return tags.some((t) => {
    const from = t.productTagsFromDate
      ? Date.parse(t.productTagsFromDate)
      : Number.NEGATIVE_INFINITY;
    const to = t.productTagsToDate
      ? Date.parse(t.productTagsToDate)
      : Number.POSITIVE_INFINITY;
    return (t.productTagsTag?.length || 0) > 0 && from <= now && now <= to;
  });
}
