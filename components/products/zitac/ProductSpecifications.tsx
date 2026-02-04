'use client';
import BrandLink from 'components/zitac/BrandLink';
import { FieldGroup } from 'models/field';
import React from 'react';
import { Article } from 'services/zitac/customArticleService';

interface ProductSpecificationsProps {
  articleDetails?: Article | null;
  articleLoading?: boolean;
  allFieldGroups?: FieldGroup[]; // From GraphQL - for names
}

type DetailItem = {
  label: string;
  value: string | React.ReactNode;
  linkUrl?: string | null;
};

// Fallback field name map (only for fields not in CMS)
const FIELD_NAME_MAP: Record<string, string> = {
  article_ean: 'EAN',
  article_weight_kg: 'Förpackningens vikt',
  article_model: 'Modell',
  article_color: 'Färg',
  article_size: 'Storlek',
};

// Fields to exclude from display (these are shown manually or shouldn't be displayed)
const EXCLUDED_FIELDS = new Set([
  'erp_status',
  'article_supplier_art_nr',
  'supplier_art_nr',
  'supplier_art_number',
  'product_family_v2',
  'erp_unit',
  'erp_gross_weight',
  'article_ean',
  'brandName',
  'brandImage',
  'show_supplier_art_number',
  'name',
  '_name',
  'url',
  '_url',
  'erp_status_info',
  'new_start',
  'new_end',
  'bullets',
  'description',
  '_description',
  'seo_title',
  '_seoTitle',
  'seo_description',
  '_seoDescription',
  'keyword',
  'detail',
  'h1',
  'keywords',
  'technical_specifications',
  'info',
  'ean', // Duplicate of article_ean
  'zsHelloRetail_Recom_Box_Id_Product_Title',
  'zsHelloRetail_Recom_Box_Id_Product',
  'erp_country_id',
  'erp_supplier_article_number',
  'erp_vat_id',
  'erp_article_number',
  'erp_integration_changed',
  'erp_integration_price_changed',
  'beskrivning',
  'ghs_code',
  'product_documents',
  'filterfield_color',
  'filterfield_type',
  'filterfield_measurement',
  'clp_code',
  'description_short',
  'type_custom',
  'eta_primary_stock',
  'substance',
  'created',
  'mediaurl_link',
  'shipping_mark_nshift',
]);

// Build field name map from GraphQL field groups (Swedish names from CMS)
const buildFieldNameMap = (
  allFieldGroups?: FieldGroup[]
): Record<string, string> => {
  const nameMap: Record<string, string> = { ...FIELD_NAME_MAP };

  if (!allFieldGroups) return nameMap;

  allFieldGroups.forEach((group) => {
    group.fields?.forEach((field: any) => {
      // Use field.field first (matches API field IDs), fallback to field.id
      // The API uses field.field as the identifier (e.g., "color_custom")
      const fieldId = field.field || field.id;
      if (fieldId && field.name) {
        nameMap[fieldId] = field.name;
      }
    });
  });

  return nameMap;
};

const isEmpty = (v: unknown): boolean =>
  v == null ||
  (Array.isArray(v) || typeof v === 'string'
    ? v.length === 0
    : Object.keys(v).length === 0);

const getFieldValue = (
  key: string,
  article: Article | null | undefined
): string | null => {
  if (!article) return null;
  const tryKey = (k: string) => {
    const val = article.fields?.[k];
    return val != null && String(val).trim() ? String(val) : null;
  };
  return (
    tryKey(key) ||
    tryKey(key.replace('article_', '')) ||
    tryKey(key.toLowerCase()) ||
    article.fieldsWithTextOptions?.[key]
      ?.map((o) => o.description || o.code)
      .join(', ') ||
    null
  );
};

const addItem = (
  items: DetailItem[],
  label: string,
  value: string | null | undefined,
  linkUrl?: string | null
) => {
  if (value == null || value === '') return;
  const strValue = String(value).trim();
  if (strValue) {
    items.push({ label, value, linkUrl: linkUrl || null });
  }
};

const getErpStatus = (status: string | null): string | null => {
  if (!status) return null;
  const statusNum = typeof status === 'string' ? parseFloat(status) : status;
  if (isNaN(statusNum)) return null;
  const statusMap: Record<number, string> = {
    20: 'Aktiv artikel',
    50: 'Utgående artikel',
  };
  return statusMap[statusNum] || null;
};

export default function ProductSpecifications({
  articleDetails,
  articleLoading,
  allFieldGroups,
}: ProductSpecificationsProps) {
  if (articleLoading) {
    return (
      <div className="rounded-xl bg-medium-gray p-6">
        <h3 className="mb-4 text-xl">Detaljer</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-border py-3">
              <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articleDetails) return null;

  // Build field name map from CMS (GraphQL field groups)
  const fieldNameMap = buildFieldNameMap(allFieldGroups);

  const items: DetailItem[] = [];
  const brandImage = articleDetails.fieldsWithTextOptions?.brandImage?.[0];
  const brandName =
    articleDetails.fieldsWithTextOptions?.brandName?.[0]?.description ||
    brandImage?.description;

  // Standard fields (manually added with specific formatting)
  addItem(items, 'EAN', getFieldValue('article_ean', articleDetails));

  if (brandName) {
    items.push({
      label: 'Varumärke',
      value: brandName,
      linkUrl: brandImage?.linkUrl || null,
    });
  }

  const productFamily =
    articleDetails.fieldsWithTextOptions?.product_family_v2?.[0];
  addItem(
    items,
    'Produktfamilj',
    productFamily?.description || productFamily?.code
  );

  const erpStatus = getErpStatus(getFieldValue('erp_status', articleDetails));
  if (erpStatus) items.push({ label: 'ERP Status', value: erpStatus });

  if (
    ['true', '1', 'yes'].includes(
      getFieldValue('show_supplier_art_number', articleDetails) || ''
    )
  ) {
    const supplier =
      getFieldValue('article_supplier_art_nr', articleDetails) ||
      getFieldValue('supplier_art_nr', articleDetails) ||
      getFieldValue('supplier_art_number', articleDetails);
    addItem(items, 'ERP Leverantörens artikelnummer', supplier);
  }

  addItem(items, 'ERP Enhet', getFieldValue('erp_unit', articleDetails));
  addItem(
    items,
    'ERP Gross weight',
    getFieldValue('erp_gross_weight', articleDetails)
  );

  // Track which fields we've already added manually
  const processedFieldIds = new Set<string>([
    'article_ean',
    'erp_status',
    'erp_unit',
    'erp_gross_weight',
    'article_supplier_art_nr',
    'supplier_art_nr',
    'supplier_art_number',
    'product_family_v2',
    'brandName',
    'brandImage',
    'show_supplier_art_number',
  ]);

  // Process all fields from articleDetails.fields
  if (articleDetails.fields) {
    Object.entries(articleDetails.fields).forEach(([fieldId, value]) => {
      if (processedFieldIds.has(fieldId) || EXCLUDED_FIELDS.has(fieldId)) {
        return;
      }

      // Special handling for Volume: hide if null, undefined, or 0.00
      if (fieldId.toLowerCase() === 'volume') {
        if (
          value == null ||
          value === '' ||
          value === '0' ||
          value === '0.00' ||
          value === 0 ||
          value === 0.0
        ) {
          return;
        }
      }

      if (value != null && !isEmpty(value)) {
        const stringValue = String(value).trim();
        if (stringValue) {
          processedFieldIds.add(fieldId);
          items.push({
            label: fieldNameMap[fieldId] || fieldId,
            value: stringValue,
          });
        }
      }
    });
  }

  // Process all fields from articleDetails.fieldsWithTextOptions
  if (articleDetails.fieldsWithTextOptions) {
    Object.entries(articleDetails.fieldsWithTextOptions).forEach(
      ([fieldId, options]) => {
        if (processedFieldIds.has(fieldId) || EXCLUDED_FIELDS.has(fieldId)) {
          return;
        }

        if (options && Array.isArray(options) && options.length > 0) {
          const value = options
            .map((o) => o.description || o.code)
            .filter(Boolean)
            .join(', ');

          if (value) {
            processedFieldIds.add(fieldId);
            items.push({
              label: fieldNameMap[fieldId] || fieldId,
              value,
            });
          }
        }
      }
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-medium-gray p-6">
      <h3 className="mb-4 text-xl">Detaljer</h3>
      <dl className="space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <dt className="mb-1 text-sm font-medium text-dark-gray">
              {item.label}
            </dt>
            <dd className="text-base">
              {item.linkUrl && item.label === 'Varumärke' ? (
                <BrandLink
                  linkUrl={item.linkUrl}
                  className="text-base decoration-1 underline-offset-4 transition-colors hover:underline"
                >
                  {item.value}
                </BrandLink>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
