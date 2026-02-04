import { gql } from '@apollo/client';
import { trackHelloRetailConversion } from 'app/actions/trackHelloRetailConversion';
import OrderTracker from 'components/OrderTracker';
import PaymentWidget from 'components/checkout/payments/PaymentWidget';
import { Heading1 } from 'components/elements/Heading';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ORDER_ADDRESS_FRAGMENT } from 'operations/fragments/checkout';
import { IMAGE_FRAGMENT } from 'operations/fragments/image';
import { Fragment } from 'react';
import { mutateServer, queryServer } from 'services/dataService.server';
import { createMetadataFromUrl } from 'services/metadataService.server';
import { get as getCurrentUser } from 'services/userService.server';
import { Token } from 'utils/constants';
import { getHost } from 'utils/headers';
import { buildHelloRetailConversionPayload } from 'utils/helloRetailConversionTracking';
import { getIsB2B } from 'utils/isB2B';
import ClearCart from './ClearCart';

export default async function Page() {
  const result = await getReceipt();
  let isLogged = false;
  let customerId: string | undefined;

  // Only try to get user if there's a token
  const cookieStore = await cookies();
  const token = cookieStore.get(Token.Name)?.value;

  if (token) {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.person) {
        isLogged = true;
        customerId = currentUser.person.customerNumber;
      }
    } catch {
      isLogged = false;
    }
  }

  if (!result?.receipt) {
    return (
      <Heading1
        className="text-center"
        translationKey="orderconfirmationpage.order.notexisted"
      />
    );
  }

  const zsThemeID = result?.channel?.website?.fields?.zsThemeID ?? '';
  const isB2B = getIsB2B(zsThemeID);

  if (!isB2B && result?.receipt?.order) {
    try {
      let baseUrl: string | undefined;
      try {
        baseUrl = await getHost();
      } catch {
        baseUrl =
          process.env.NEXT_PUBLIC_WEBSITE_URL ||
          process.env.WEBSITE_URL ||
          undefined;
      }

      const conversionPayload = buildHelloRetailConversionPayload(
        result.receipt.order,
        { customerId, baseUrl }
      );

      if (conversionPayload.products.length > 0) {
        trackHelloRetailConversion(conversionPayload).catch((error) => {
          console.error(
            '[HelloRetail Conversion] Failed to track conversion:',
            error
          );
        });
      }
    } catch (error) {
      console.error('[HelloRetail Conversion] Error building payload:', error);
    }
  }

  await clearCart();
  if (result?.receipt?.htmlSnippet) {
    return (
      <Fragment>
        <ClearCart />
        <OrderTracker orderDetails={result?.receipt?.order} />
        <PaymentWidget responseString={result?.receipt?.htmlSnippet} />
      </Fragment>
    );
  }

  // Conditionally import the appropriate component
  const OrderConfirmation = isB2B
    ? (await import('components/zitac/OrderConfirmation.b2b')).default
    : (await import('components/zitac/OrderConfirmation.b2c')).default;

  return (
    <div className="mx-auto w-full px-5 md:w-[50rem]">
      <ClearCart />
      <OrderTracker orderDetails={result?.receipt?.order} />
      <OrderConfirmation
        receipt={result?.receipt?.order}
        myPagesPageUrl={
          result.channel.website.fields.myPagesPage[0]?.item?.url ?? '/'
        }
        orderHistoryPageUrl={
          result.channel.website.fields.orderHistoryPage[0]?.item?.url ?? '/'
        }
        isLogged={isLogged}
      />
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  return await createMetadataFromUrl(params.slug?.join('/'));
}

async function getReceipt() {
  return await queryServer({
    query: GET_RECEIPT,
  });
}

const GET_RECEIPT = gql`
  ${ORDER_ADDRESS_FRAGMENT}
  ${IMAGE_FRAGMENT}
  query GetReceipt {
    channel {
      ... on DefaultChannelFieldTemplateChannel {
        id
        url
        website {
          ... on AcceleratorWebsiteWebsite {
            id
            fields {
              zsThemeID
              myPagesPage {
                item {
                  url
                  id
                }
              }
              orderHistoryPage {
                item {
                  url
                }
              }
            }
          }
        }
      }
    }
    receipt {
      order {
        customerDetails {
          email
          phone
        }
        orderNumber
        shippingAddress {
          ...OrderAddress
        }
        discountInfos {
          discountType
          resultOrderRow {
            totalIncludingVat
            totalExcludingVat
            description
            rowId
          }
        }
        grandTotal
        totalVat
        rows {
          rowType
          rowId
          articleNumber
          quantity
          totalIncludingVat
          totalExcludingVat
          description
          product {
            ... on IContentItem {
              id
              url
            }
            ... on IProductItem {
              name
              smallImages: images(max: { height: 80, width: 80 }) {
                ...Image
              }
            }
            ... on AllAttributesInListProduct {
              fieldGroups(
                filter: { id: { value: "LagerLeverans", operator: "eq" } }
              ) {
                fieldGroupId
                fields {
                  field
                  ... on DateTimeValue {
                    dateTimeValue
                  }
                }
              }
            }
          }
          discountInfos {
            discountType
            resultOrderRow {
              totalIncludingVat
              totalExcludingVat
            }
          }
        }
      }
      htmlSnippet
    }
  }
`;

async function clearCart() {
  await mutateServer({
    mutation: CLEAR_CART,
  });
}

const CLEAR_CART = gql`
  mutation clearCart {
    clearCart {
      cart {
        __typename
      }
    }
  }
`;
