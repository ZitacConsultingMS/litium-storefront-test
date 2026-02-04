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
  websiteTexts?: { key: string; value: string }[]
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
  const website = await getWebsite();
  const orderDiscountLines = getOrderDiscounts(discountInfos);
  const totalOrderDiscount = Math.abs(
    calculateTotalDiscounts(orderDiscountLines, includingVat)
  );
  const productsSubtotal = Math.max(0, totalProductPrice - totalOrderDiscount);

  return (
    <Html lang={website.languageCode}>
      <Head />
      <Tailwind>
        <Body className="mx-auto w-full bg-white px-5 font-sans md:w-[50rem]">
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
          <Section className="mt-10 flex flex-col gap-12 md:flex-row">
            <Section>
              <Text className="m-0 font-bold">
                {translate('emailorderconfirmation.deliveryaddress.title')}
              </Text>
              <Text className="m-0 mt-2">
                {shippingAddress?.firstName} {shippingAddress?.lastName}
              </Text>
              <Text className="m-0 mt-1">{shippingAddress?.address1}</Text>
              <Text className="m-0 mt-1">{shippingAddress?.zipCode}</Text>
              <Text className="m-0 mt-1">{shippingAddress?.city}</Text>
              <Text className="m-0 mt-1">{shippingAddress?.country}</Text>
            </Section>
            <Section>
              <Text className="m-0 font-bold">
                {translate('emailorderconfirmation.contactinfo.title')}
              </Text>
              <Text className="m-0 mt-2">{customerDetails?.email}</Text>
              <Text className="m-0 mt-1">{customerDetails?.phone}</Text>
            </Section>
          </Section>
          <Section className="mb-10 mt-10">
            <Text className="m-0 font-bold">
              {translate('emailorderconfirmation.ordernumber')} {orderNumber}
            </Text>
            {productLineItems.map((item) => {
              const props = {
                translate,
                asterisk: multipleDiscountInfoMap[item.articleNumber],
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
                    className="text-red-600 m-0 mt-2 text-sm whitespace-nowrap"
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
                  <Text className="m-0 mt-2 font-bold text-lg">
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
                      className="m-0 mt-2 text-sm whitespace-nowrap"
                      price={Math.max(0, shippingPrice - shippingDiscount)}
                      culture={website.culture.code}
                      currency={cart.currency}
                    />
                    {shippingDiscount > 0 && (
                      <Currency
                        className="m-0 mt-2 text-[10px] text-tertiary whitespace-nowrap"
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
                    className="m-0 mt-2 text-sm whitespace-nowrap"
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
                    className="m-0 mt-2 text-sm whitespace-nowrap"
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
                    className="m-0 mt-2 text-sm whitespace-nowrap"
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
            <Text className="m-0">
              {translate('emailorderconfirmation.anyquestions')}
            </Text>
            <Row className="mt-5 text-center">
              <Button
                style={{ padding: '10px 0px' }}
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
  } = props;

  const itemTotalPrice = includingVat ? totalIncludingVat : totalExcludingVat;
  let discountedPrice = calculateProductRowDiscount(props, includingVat);

  return (
    <Section className="my-2">
      <Section className="ml-2 flex-1">
        <Row className="mb-2">
          <Column style={{ width: '176px' }}>
            <Text className="m-0 truncate text-sm uppercase">
              {product?.name}
            </Text>
            <Text className="m-0 truncate text-[10px] text-gray-500">
              Art. nr {articleNumber}
            </Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-right text-xs">
              {translate('emailorderconfirmation.quantity.title')} {quantity}
            </Text>
          </Column>
          <Column align="right">
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
      <Section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px',
        }}
      >
        <Section
          style={{
            height: '80px',
            width: '80px',
            flexShrink: 0,
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            padding: '8px',
          }}
        >
          {product.smallImages && product.smallImages.length > 0 && (
            <Img
              src={getAbsoluteImageUrl(product.smallImages[0], imageServerUrl)}
              alt={`img-${articleNumber}`}
              width={product.smallImages[0]?.dimension?.width}
              height={product.smallImages[0]?.dimension?.height}
              style={{ margin: '0 auto', display: 'block' }}
            />
          )}
        </Section>
      </Section>
    </Section>
  );
}
