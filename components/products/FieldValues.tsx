'use client';
import FormattedDate from 'components/FormattedDate';
import Link from 'components/Link';
import { HtmlText } from 'components/elements/HtmlText';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import Image from 'next/image';
import { useContext } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';

/**
 * Renders a product's field value.
 * @param field a field value.
 */
export function FieldValues(field: any) {
  const website = useContext(WebsiteContext);
  const t = useTranslations();

  // Field options
  if (!isEmpty(field.textOptionFieldValues)) {
    return field.textOptionFieldValues.map((item: any) => item.name).join('; ');
  }
  // Field value
  if (!isEmpty(field.stringValue)) {
    return <HtmlText innerHTML={field.stringValue} />;
  }
  // Media file
  if (!isEmpty(field.pointerMediaFileValue)) {
    return (
      <Link
        href={field.pointerMediaFileValue.item?.url}
        target="_blank"
        title={
          field.pointerMediaFileValue.item?.alt ||
          field.pointerMediaFileValue.item?.filename
        }
        data-testid="product-detail__field-file"
      >
        {field.pointerMediaFileValue.item?.filename}
      </Link>
    );
  }
  // Field link
  if (!isEmpty(field.linkFieldValue)) {
    return (
      <Link
        href={field.linkFieldValue.url}
        target="_blank"
        title={field.linkFieldValue.text}
        data-testid="product-detail__field-link"
      >
        {field.linkFieldValue.text}
      </Link>
    );
  }

  //Field image
  if (!isEmpty(field.pointerMediaImageValue)) {
    return (
      <Image
        src={getAbsoluteImageUrl(
          field.pointerMediaImageValue.item,
          website.imageServerUrl
        )}
        alt={field.pointerMediaImageValue.item?.filename}
        width={field.pointerMediaImageValue.item?.dimension?.width}
        height={field.pointerMediaImageValue.item?.dimension?.height}
        data-testid={'product-detail__field-image'}
      ></Image>
    );
  }

  if (!isEmpty(field.booleanValue))
    return t(`productdetail.field.boolean.${field.booleanValue}`);

  if (!isEmpty(field.longValue)) return field.longValue;

  if (!isEmpty(field.intValue)) return field.intValue;

  if (!isEmpty(field.intOptionFieldValues))
    return field.intOptionFieldValues.map((item: any) => item.name).join('; ');

  if (!isEmpty(field.decimalValue)) return field.decimalValue;

  if (!isEmpty(field.dateTimeValue))
    return <FormattedDate date={new Date(field.dateTimeValue)} />;
}

function isEmpty(value: any) {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero
    (value.hasOwnProperty('length') && value.length === 0) ||
    // is an Object and has no keys
    (value.constructor === Object && Object.keys(value).length === 0)
  );
}
