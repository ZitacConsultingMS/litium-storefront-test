import {
  Body,
  Button,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { OrderAddress } from 'models/address';
import { DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import { get as getCart } from 'services/cartService.server';
import {
  calculateProductRowDiscount,
  calculateShippingDiscounts,
  calculateTotalDiscounts,
  calculateTotalProducts,
  getMultipleDiscountInfoMap,
  getOrderDiscounts,
  getVatSelector,
  shouldShowOriginalPrice,
} from 'services/discountService';
import { getAbsoluteImageUrl } from 'services/imageService';
import { get as getWebsite } from 'services/websiteService.server';
import { StockBalance } from 'services/zitac/stockbalanceService';
import Currency from '../../Currency.server';

async function EmailOrderConfirmation(
  receipt: {
    rows: OrderRow[];
    discountInfos: DiscountInfo[];
    shippingAddress: OrderAddress;
    orderNumber: string;
    totalVat: number;
    grandTotal: number;
    customerDetails: {
      email: string;
      phone: string;
    };
  },
  myPagesPageUrl?: string,
  websiteTexts?: { key: string; value: string }[],
  contextPath?: string,
  stockDataMap?: Record<string, StockBalance | null>
) {
  const {
    rows,
    discountInfos,
    shippingAddress,
    grandTotal,
    totalVat,
    orderNumber,
    customerDetails,
  } = receipt;
  const cart = await getCart();
  const { showPricesIncludingVat: includingVat } = cart;
  const vatSelector = getVatSelector(includingVat);
  const productLineItems = rows.filter((item) => item.rowType === 'PRODUCT');
  const totalProductPrice = calculateTotalProducts(
    productLineItems,
    includingVat
  );
  const shippingFeeLine = rows.filter(
    (item) => item.rowType === 'SHIPPING_FEE'
  );
  const feeLines = rows.filter((item) => item.rowType === 'FEE');
  const taxLines = rows.filter((item) => item.rowType === 'TAX');
  const multipleDiscountInfoMap = getMultipleDiscountInfoMap(productLineItems);
  const translate = (key: string) =>
    websiteTexts?.filter((item) => item.key === key)[0]?.value || key;
  const website = await getWebsite(contextPath);
  const orderDiscountLines = getOrderDiscounts(discountInfos);
  const totalOrderDiscount = Math.abs(
    calculateTotalDiscounts(orderDiscountLines, includingVat)
  );
  const productsSubtotal = Math.max(0, totalProductPrice - totalOrderDiscount);

  return (
    <Html lang={website.languageCode}>
      <Head />
      <Tailwind>
        <Body className="mx-auto w-[40rem] max-w-full bg-white px-5 font-sans">
          {website.emailHeaderImage && (
            <Section className="mb-5 text-center">
              <Img
                src={getAbsoluteImageUrl(
                  website.emailHeaderImage,
                  website.imageServerUrl
                )}
                alt="Seasea"
                className="mx-auto block max-w-full"
                style={{
                  minWidth: '400px',
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                }}
              />
            </Section>
          )}
          <Heading as="h1">
            {translate('emailorderconfirmation.title')} {orderNumber}
          </Heading>
          <Text className="m-0 mt-2">
            {translate('emailorderconfirmation.sayhi')}{' '}
            {shippingAddress?.firstName},
          </Text>
          <Text className="m-0 mt-2">
            {translate('emailorderconfirmation.thankyou')}
          </Text>
          <Text className="mt-2" data-testid="order-confirmation__thankyou">
            {translate('orderconfirmation.yourordernumber')} {orderNumber}
          </Text>
          <Section className="mt-10">
            <Row>
              <Column className="pr-3 align-top" style={{ width: '18rem' }}>
                <Text className="m-0 font-bold">
                  {translate('emailorderconfirmation.deliveryaddress.title')}
                </Text>
                <Text className="m-0 mt-2">
                  {shippingAddress?.firstName} {shippingAddress?.lastName}
                </Text>
                <Text className="m-0 mt-2">{shippingAddress?.address1}</Text>
                <Text className="m-0 mt-2">{shippingAddress?.zipCode}</Text>
                <Text className="m-0 mt-2">{shippingAddress?.city}</Text>
                <Text className="m-0 mt-2">{shippingAddress?.country}</Text>
              </Column>
              <Column className="pl-3 align-top" style={{ width: '18rem' }}>
                <Text className="m-0 font-bold">
                  {translate('emailorderconfirmation.contactinfo.title')}
                </Text>
                <Text className="m-0 mt-2">{customerDetails?.email}</Text>
                <Text className="m-0 mt-2">{customerDetails?.phone}</Text>
              </Column>
            </Row>
          </Section>
          <Section className="mb-10 mt-10">
            <Text className="m-0 font-bold">
              {translate('emailorderconfirmation.ordernumber')} {orderNumber}
            </Text>
            {productLineItems.map((item) => {
              const props = {
                translate,
                asterisk: multipleDiscountInfoMap[item.articleNumber],
                stock: stockDataMap?.[item.articleNumber] ?? null,
                ...item,
              };
              return (
                <ProductLineItem
                  key={item.articleNumber}
                  culture={website.culture.code}
                  currency={cart.currency}
                  imageServerUrl={website.imageServerUrl}
                  includingVat={includingVat}
                  {...props}
                />
              );
            })}
            {orderDiscountLines?.map((item: DiscountInfo) => (
              <Row key={item.resultOrderRow.rowId}>
                <Column>
                  <Text className="m-0 mt-2 text-sm">
                    {item.resultOrderRow.description ||
                      translate('emailorderconfirmation.discounts.title')}
                  </Text>
                </Column>
                <Column align="right">
                  <Currency
                    className="text-red-600 m-0 mt-2 whitespace-nowrap text-sm"
                    price={item.resultOrderRow[`total${vatSelector}`]}
                    culture={website.culture.code}
                    currency={cart.currency}
                  />
                </Column>
              </Row>
            ))}
            {(shippingFeeLine?.length > 0 ||
              feeLines?.length > 0 ||
              !includingVat) && (
              <Row>
                <Column>
                  <Text className="m-0 mt-2 text-lg font-bold">
                    {translate('emailorderconfirmation.productsSubtotal.title')}
                  </Text>
                </Column>
                <Column align="right">
                  <Currency
                    className="m-0 mt-2 text-lg"
                    price={productsSubtotal}
                    culture={website.culture.code}
                    currency={cart.currency}
                  />
                </Column>
              </Row>
            )}
            {shippingFeeLine?.map((item: OrderRow) => {
              const shippingPrice = item[`total${vatSelector}`];
              const shippingDiscount = calculateShippingDiscounts(
                item,
                includingVat
              );

              return (
                <Row key={item.rowId}>
                  <Column>
                    <Text className="m-0 mt-2 text-sm">
                      {item.description ||
                        translate('emailorderconfirmation.shippingfee.title')}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Currency
                      className="m-0 mt-2 whitespace-nowrap text-sm"
                      price={Math.max(0, shippingPrice - shippingDiscount)}
                      culture={website.culture.code}
                      currency={cart.currency}
                    />
                    {shippingDiscount > 0 && (
                      <Currency
                        className="m-0 mt-2 whitespace-nowrap text-[10px] text-tertiary"
                        strikethrough
                        price={
                          shippingDiscount > shippingPrice
                            ? shippingPrice
                            : shippingDiscount
                        }
                        culture={website.culture.code}
                        currency={cart.currency}
                      />
                    )}
                  </Column>
                </Row>
              );
            })}
            {feeLines.map((item: OrderRow) => (
              <Row key={item.rowId}>
                <Column>
                  <Text className="m-0 mt-2 text-sm">
                    {item.description ||
                      translate('emailorderconfirmation.handlingfee.title')}
                  </Text>
                </Column>
                <Column align="right">
                  <Currency
                    className="m-0 mt-2 whitespace-nowrap text-sm"
                    price={item[`total${vatSelector}`]}
                    culture={website.culture.code}
                    currency={cart.currency}
                  />
                </Column>
              </Row>
            ))}
            {taxLines.map((item: OrderRow) => (
              <Row key={item.rowId}>
                <Column>
                  <Text className="m-0 mt-2 text-sm">
                    {item.description ||
                      translate('emailorderconfirmation.handlingtax.title')}
                  </Text>
                </Column>
                <Column align="right">
                  <Currency
                    className="m-0 mt-2 whitespace-nowrap text-sm"
                    price={item[`total${vatSelector}`]}
                    culture={website.culture.code}
                    currency={cart.currency}
                  />
                </Column>
              </Row>
            ))}
            {!includingVat && (
              <Row>
                <Column>
                  <Text className="m-0 mt-2 text-sm">
                    {translate('emailorderconfirmation.vat.title')}
                  </Text>
                </Column>
                <Column align="right">
                  <Currency
                    className="m-0 mt-2 whitespace-nowrap text-sm"
                    price={totalVat}
                    culture={website.culture.code}
                    currency={cart.currency}
                  />
                </Column>
              </Row>
            )}
          </Section>
          <Section className="my-2">
            <Row>
              <Column>
                <Text className="m-0 text-lg font-bold">
                  {translate('emailorderconfirmation.total.title')}
                </Text>
              </Column>
              <Column align="right">
                <Currency
                  className="m-0 text-lg font-bold"
                  price={grandTotal}
                  culture={website.culture.code}
                  currency={cart.currency}
                />
              </Column>
            </Row>
          </Section>
          <Section className="mt-5">
            <Text className="my-4 text-center">
              {translate('emailorderconfirmation.anyquestions')}
            </Text>
            <Row className="mt-5 text-center">
              <Button
                style={{ padding: '12px 6px' }}
                className="mx-auto block w-48 rounded-md bg-black text-center text-white"
                href={myPagesPageUrl ?? '/'}
              >
                {translate('emailorderconfirmation.mypages')}
              </Button>
            </Row>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EmailOrderConfirmation;

function ProductLineItem(props: any) {
  const {
    quantity,
    totalIncludingVat,
    totalExcludingVat,
    articleNumber,
    product,
    discountInfos,
    asterisk,
    translate,
    currency,
    culture,
    imageServerUrl,
    includingVat,
    stock,
  } = props;

  const itemTotalPrice = includingVat ? totalIncludingVat : totalExcludingVat;
  let discountedPrice = calculateProductRowDiscount(props, includingVat);
  const fieldGroups = product?.fieldGroups;
  const lagerGroup = fieldGroups?.find(
    (g: any) => g.fieldGroupId === 'LagerLeverans'
  );
  const etaField = lagerGroup?.fields?.find(
    (f: any) => f.field === 'eta_primary_stock'
  );
  const etaDate = etaField?.dateTimeValue;
  const estimatedDeliveryDate =
    etaDate && new Date(etaDate).getFullYear() >= 2000
      ? new Date(etaDate)
      : null;

  const stockQty = stock?.quantity ?? null;
  const isOutOfStock = stockQty === 0;

  return (
    <Section
      className="my-2 border-b border-gray-200 pb-4"
      style={{ width: '100%', tableLayout: 'fixed' }}
    >
      <Row style={{ width: '100%' }}>
        <Column
          className="pr-4 align-top"
          align="left"
          style={{
            width: '280px',
            verticalAlign: 'top',
            textAlign: 'left',
          }}
        >
          <Text
            className="m-0 truncate text-sm uppercase"
            style={{ textAlign: 'left' }}
          >
            {product?.name}
          </Text>
          <Text
            className="m-0 truncate text-[10px] text-gray-500"
            style={{ textAlign: 'left' }}
          >
            Art. nr {articleNumber}
          </Text>
          {stock && typeof stockQty === 'number' && (
            <Text className="m-0 mt-1 text-[11px] text-dark-gray">
              <span
                style={{
                  color: stockQty > 0 ? '#62D99B' : '#EF4444',
                  fontSize: '8px',
                  marginRight: '6px',
                  verticalAlign: 'middle',
                }}
              >
                ●
              </span>
              {stockQty > 0
                ? `${translate('zs.inStock')} ${stockQty} ${translate('zs.stockCount') || ''}`
                : translate('zs.outOfStock')}
            </Text>
          )}
          {isOutOfStock && (
            <Text className="m-0 mt-0.5 text-[11px] text-tertiary" style={{ marginTop: '2px' }}>
              {estimatedDeliveryDate ? (
                <>
                  {translate('cartlineitem.estimatedDelivery')}{' '}
                  {estimatedDeliveryDate.toLocaleDateString()}
                </>
              ) : (
                translate('cartlineitem.deliveryDateUnknown')
              )}
            </Text>
          )}
          {product.smallImages && product.smallImages.length > 0 && (
            <Text
              className="m-0 mt-2"
              style={{ textAlign: 'left', margin: 0, padding: 0 }}
            >
              <Img
                src={getAbsoluteImageUrl(
                  product.smallImages[0],
                  imageServerUrl
                )}
                alt={`img-${articleNumber}`}
                width={product.smallImages[0]?.dimension?.width || 80}
                height={product.smallImages[0]?.dimension?.height || 80}
                className="m-0 block"
                style={{
                  display: 'block',
                  margin: '8px 0 0 0',
                  padding: '8px',
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  objectFit: 'contain',
                }}
              />
            </Text>
          )}
        </Column>
        <Column
          className="pr-4 align-top"
          align="right"
          style={{
            width: '120px',
            verticalAlign: 'top',
            textAlign: 'right',
          }}
        >
          <Text className="m-0 text-right text-xs">
            {translate('emailorderconfirmation.quantity.title')} {quantity}
          </Text>
        </Column>
        <Column
          className="align-top"
          align="right"
          style={{
            width: '180px',
            verticalAlign: 'top',
            textAlign: 'right',
          }}
        >
          <Currency
            className="inline text-sm"
            price={discountedPrice}
            culture={culture}
            currency={currency}
          />
          {asterisk && <span className="text-xs">&nbsp;*</span>}
          {shouldShowOriginalPrice(discountInfos) && (
            <Currency
              className="text-[10px] text-gray-500"
              price={itemTotalPrice}
              strikethrough
              culture={culture}
              currency={currency}
            />
          )}
        </Column>
      </Row>
    </Section>
  );
}
