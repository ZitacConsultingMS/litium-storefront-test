'use client';
import clsx from 'clsx';
import BuyButton from 'components/BuyButton';
import Currency from 'components/Currency';
import DataView from 'components/DataView';
import Table, { IColumnType } from 'components/Table';
import QuantityInput from 'components/cart/QuantityInput';
import { Text } from 'components/elements/Text';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { DisplayFieldGroup } from 'models/field';
import { ProductWithVariantsListProduct } from 'models/products';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { getVatSelector } from 'services/discountService';
import { getAbsoluteImageUrl } from 'services/imageService';
import { FieldValues } from './FieldValues';

interface VariantsTableProps {
  variants: ProductWithVariantsListProduct[];
  className?: string;
}

export default function VariantsTable({
  variants,
  className,
}: VariantsTableProps) {
  const { showPricesIncludingVat } = useContext(CartContext).cart;
  const vatSelector = getVatSelector(showPricesIncludingVat);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    variants.reduce(
      (acc, variant) => {
        acc[variant.id] = 1; // Default quantity
        return acc;
      },
      {} as Record<string, number>
    )
  );
  const t = useTranslations();
  const handleQuantityChange = (articleNumber: string, value: number) => {
    setQuantities({ ...quantities, [articleNumber]: value });
  };
  const fields =
    variants.length && variants[0].displayFieldGroups.length
      ? variants[0].displayFieldGroups[0].fields
      : [];
  const websiteContext = useContext(WebsiteContext);
  const columns: IColumnType<ProductWithVariantsListProduct>[] = [
    {
      key: '',
      title: '',
      render: (prop: any) => (
        <Image
          src={getAbsoluteImageUrl(
            prop.images[0],
            websiteContext.imageServerUrl
          )}
          alt={prop.images[0].alt || prop.images[0].filename || ''}
          width={40}
          height={57}
        ></Image>
      ),
      width: '75px',
    },
    {
      key: 'articleNumber',
      title: t('productdetail.column.articlenumber'),
      render: ({ articleNumber }) => <Text>{articleNumber}</Text>,
    },
    {
      key: 'stockStatus',
      title: t('productdetail.column.stock'),
      render: ({ stockStatus }) => <Text>{stockStatus.inStockQuantity}</Text>,
    },
    {
      key: 'price',
      title: t('productdetail.column.price'),
      render: ({ price, articleNumber }) => (
        <Currency
          price={price[`unitPrice${vatSelector}`]}
          data-testid={`variants-table__desktop-price-${articleNumber}`}
        />
      ),
    },
    {
      key: 'articleNumber',
      title: '',
      render: ({ articleNumber }) => (
        <QuantityInput
          value={1}
          onChange={(value) => handleQuantityChange(articleNumber, value)}
          className="rounded"
        />
      ),
    },
    {
      key: '',
      title: '',
      render: ({ stockStatus, articleNumber }) => (
        <BuyButton
          articleNumber={articleNumber}
          className="rounded px-3 py-1 text-sm"
          disabled={stockStatus.inStockQuantity === 0}
          label="productdetail.button.add"
          successLabel="productdetail.button.add.success"
          quantity={quantities[articleNumber]}
        />
      ),
      width: '180px',
    },
  ];
  columns.splice(
    2,
    0,
    ...fields.map((field) => ({
      key: 'displayFieldGroups',
      title: field.name,
      render: ({ displayFieldGroups }: any) => {
        const fieldValue = findFieldById(displayFieldGroups, field.id);
        return <FieldValues {...fieldValue} />;
      },
    }))
  );
  const renderVariantRow = (item: any) => {
    return (
      <div className="mb-3 rounded border px-4 py-3">
        <Row className="w-full pb-4">
          <Image
            src={getAbsoluteImageUrl(
              item.images[0],
              websiteContext.imageServerUrl
            )}
            alt={item.images[0].alt || item.images[0].filename || ''}
            width={56}
            height={80}
          ></Image>
        </Row>
        <Row>
          <Text className="w-1/3 font-bold">
            {t('productdetail.column.articlenumber')}
          </Text>
          <Text className="text-right">{item.articleNumber}</Text>
        </Row>
        {fields.map((field) => (
          <Row key={field.id}>
            <Text className="font-bold">{field.name}</Text>
            <div className="text-right">
              <FieldValues {...field} />
            </div>
          </Row>
        ))}
        <Row>
          <Text className="font-bold">{t('productdetail.column.stock')}</Text>
          <Text className="text-right">{item.stockStatus.inStockQuantity}</Text>
        </Row>
        <Row className="pb-4">
          <Text className="font-bold">{t('productdetail.column.price')}</Text>
          <Currency
            className="text-right"
            price={item.price[`unitPrice${vatSelector}`]}
            data-testid={`variants-table__mobile-price-${item.articleNumber}`}
          />
        </Row>
        <Row>
          <QuantityInput
            value={1}
            onChange={(value) =>
              handleQuantityChange(item.articleNumber, value)
            }
            className="rounded"
          />
          <BuyButton
            articleNumber={item.articleNumber}
            className="rounded px-3 py-1 text-sm"
            disabled={item.stockStatus.inStockQuantity === 0}
            label="productdetail.button.add"
            successLabel="productdetail.button.add.success"
            quantity={quantities[item.articleNumber]}
          />
        </Row>
      </div>
    );
  };
  return (
    <div className={clsx('mb-6 md:mb-8 lg:mb-11', className)}>
      <Table data={variants} columns={columns} className={'hidden md:block'} />
      <DataView
        items={variants}
        renderItem={renderVariantRow}
        className="md:hidden"
      ></DataView>
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

function findFieldById(data: DisplayFieldGroup[], id: string) {
  for (const group of data) {
    for (const field of group.fields) {
      if (field.id === id) {
        return field;
      }
    }
  }
  return null;
}
