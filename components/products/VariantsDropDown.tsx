'use client';
import clsx from 'clsx';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { DisplayFieldGroup } from 'models/field';
import { ProductWithVariantsListProduct } from 'models/products';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';

interface VariantsTableProps {
  variants: ProductWithVariantsListProduct[];
  className?: string;
}

export default function VariantsDropdown({
  variants,
  className,
}: VariantsTableProps) {
  const t = useTranslations();
  const websiteContext = useContext(WebsiteContext);
  const router = useRouter();
  const pathname = usePathname();

  const normalizePath = (u?: string) => {
    if (!u) return '';
    try {
      // Absolute URL? Parse and extract pathname
      if (u.startsWith('http')) {
        const url = new URL(u);
        return decodeURIComponent(url.pathname).replace(/\/+$/, '');
      }
    } catch {
      // TODO: log error?
    }
    // Relative path → strip query/hash and trailing slash
    return decodeURIComponent(
      u.split('?')[0].split('#')[0].replace(/\/+$/, '')
    );
  };

  const initialSelectedId = useMemo(() => {
    const current = normalizePath(pathname || '');

    const match = variants.find(
      (v) => normalizePath(v.url) === normalizePath(pathname)
    );

    return match?.articleNumber ?? variants[0]?.articleNumber;
  }, [pathname, variants]);

  const [quantities, setQuantities] = useState<Record<string, number>>(
    variants.reduce(
      (acc, v) => {
        acc[v.articleNumber] = 1;
        return acc;
      },
      {} as Record<string, number>
    )
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);
  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const selected = useMemo(
    () => variants.find((v) => v.articleNumber === selectedId) ?? variants[0],
    [selectedId, variants]
  );

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!variants || variants.length === 0) return null;

  const handleQuantityChange = (articleNumber: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [articleNumber]: value }));
  };

  // Helper: take the first display field group
  const baseFields = selected?.displayFieldGroups?.length
    ? selected.displayFieldGroups[0].fields
    : [];

  // Helper: get field by id from any display group
  function findFieldById(data: DisplayFieldGroup[] | undefined, id: string) {
    for (const group of data ?? []) {
      for (const field of group.fields ?? []) {
        if (field.id === id) return field;
      }
    }
    return null;
  }
  // Helper: format price
  const formatPrice = (amount?: number) =>
    typeof amount === 'number'
      ? new Intl.NumberFormat('sv-SE', {
          style: 'currency',
          currency: 'SEK',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Math.round(amount))
      : '';

  //Saxat från  FieldValues.tsx (fick det ej att funka med import)
  const FieldValues = (field: any) => {
    // Field options
    if (!isEmpty(field.textOptionFieldValues)) {
      return field.textOptionFieldValues
        .map((item: any) => item.name)
        .join('; ');
    }
    // Field value
    if (!isEmpty(field.stringValue)) {
      return field.stringValue;
    }
    // Media file
    if (!isEmpty(field.longValue)) return field.longValue;

    if (!isEmpty(field.intValue)) return field.intValue;

    if (!isEmpty(field.intOptionFieldValues))
      return field.intOptionFieldValues
        .map((item: any) => item.name)
        .join('; ');

    if (!isEmpty(field.decimalValue)) return field.decimalValue;
  };

  const isEmpty = (value: any) => {
    return (
      // null or undefined
      value == null ||
      // has length and it's zero
      (value.hasOwnProperty('length') && value.length === 0) ||
      // is an Object and has no keys
      (value.constructor === Object && Object.keys(value).length === 0)
    );
  };

  // attribute view for a variant
  const renderVariantAttributes = (v: ProductWithVariantsListProduct) => {
    if (!baseFields?.length) return null;

    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {baseFields.map((f: any) => {
          const fv = findFieldById(v.displayFieldGroups, f.id);
          if (!fv) return null;

          if (isEmpty(FieldValues(fv))) return null;

          // only render if fv contains any non-empty value
          return (
            <div key={f.id} className="flex items-center gap-1 text-sm">
              <span className="font-medium">{f.name}:</span>
              <span>
                <FieldValues {...fv} />
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getVariantLabel = (v: ProductWithVariantsListProduct) => {
    if (v.name && v.articleNumber) return `${v.name} (${v.articleNumber})`;
    if (v.name) return v.name;
    return v.articleNumber ?? v.id;
  };

  const onSelectVariant = (v: ProductWithVariantsListProduct) => {
    setSelectedId(v.id);
    setIsOpen(false);
    if (v.url) router.push(v.url); // navigate to the variant’s URL
  };

  return (
    <div className={clsx('mb-6 mt-4 w-full md:mb-8 lg:mb-11', className)}>
      {/* Custom dropdown */}
      <div className="relative mb-4" ref={dropdownRef}>
        <label className="text-md mb-1 block font-medium">
          {t('productdetail.select.variant') ?? 'Select variant'}
        </label>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded border px-3 py-2 text-left"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium">{getVariantLabel(selected)}</span>
            {/* show selected attributes inline */}
            {renderVariantAttributes(selected)}
          </div>

          {/* Arrow icon */}
          <svg
            className={clsx(
              'ml-2 h-5 w-5 shrink-0 transition-transform duration-200',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 w-full overflow-auto rounded border bg-white p-1 shadow"
          >
            {variants.map((v) => {
              const isActive = v.articleNumber === selectedId;

              // pick discounted if valid, else unit
              const unit = v?.price?.unitPriceIncludingVat;
              const disc = v?.price?.discountPriceIncludingVat;
              const hasDiscount =
                typeof disc === 'number' &&
                typeof unit === 'number' &&
                disc < unit;

              return (
                <li
                  key={v.articleNumber}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelectVariant(v)}
                  className={clsx(
                    'flex cursor-pointer items-start gap-3 rounded px-3 py-2 hover:bg-gray-50',
                    isActive && 'bg-gray-100'
                  )}
                >
                  {/* Left: checkmark + image + labels */}
                  <div className="flex min-w-0 items-start gap-3">
                    <svg
                      className={clsx(
                        'mt-1 h-4 w-4 shrink-0',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 11.586l6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {v?.images?.[0] && (
                      <Image
                        src={getAbsoluteImageUrl(
                          v.images[0],
                          websiteContext.imageServerUrl
                        )}
                        alt={v.name || ''}
                        width={32}
                        height={46}
                        className="shrink-0 rounded"
                      />
                    )}

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {getVariantLabel(v)}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {renderVariantAttributes(v)}
                      </div>
                    </div>
                  </div>

                  {/* Right: price */}
                  <div className="ml-auto shrink-0 text-right">
                    {hasDiscount ? (
                      <>
                        <div className="font-semibold text-rose-600">
                          {formatPrice(disc!)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(unit!)}
                        </div>
                      </>
                    ) : (
                      <div className="font-semibold">{formatPrice(unit)}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const Row = ({ children, className }: any) => {
  return (
    <div className={clsx('flex items-center justify-between py-1', className)}>
      {children}
    </div>
  );
};
