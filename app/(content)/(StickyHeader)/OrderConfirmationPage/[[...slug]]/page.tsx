import { gql } from '@apollo/client';
import OrderConfirmation from 'components/OrderConfirmation';
import OrderTracker from 'components/OrderTracker';
import PaymentWidget from 'components/checkout/payments/PaymentWidget';
import { Heading1 } from 'components/elements/Heading';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { mutateServer, queryServer } from 'services/dataService.server';
import { createMetadataFromUrl } from 'services/metadataService.server';
import { get as getCurrentUser } from 'services/userService.server';
import ClearCart from './ClearCart';

export default async function Page() {
  const result = await getReceipt();
  let isLogged = false;
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.person) {
      isLogged = true;
    }
  } catch (error: any) {
    isLogged = false;
  }

  if (!result?.receipt) {
    return (
      <Heading1
        className="text-center"
        translationKey="orderconfirmationpage.order.notexisted"
      />
    );
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

  return (
    <div className="mx-auto w-full px-5 md:w-[30rem]">
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
  query GetReceipt {
    channel {
      ... on DefaultChannelFieldTemplateChannel {
        id
        website {
          ... on AcceleratorWebsiteWebsite {
            id
            fields {
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
            id
            name
            smallImages: images(max: { height: 80, width: 80 }) {
              ...Image
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
