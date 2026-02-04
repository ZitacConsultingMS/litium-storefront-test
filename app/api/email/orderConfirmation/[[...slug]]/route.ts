import { gql } from '@apollo/client';
import { render } from '@react-email/render';
import EmailOrderConfirmation from 'components/emails/EmailOrderConfirmation';
import { NextResponse, type NextRequest } from 'next/server';
import Mail from 'nodemailer/lib/mailer';
import { queryServer } from 'services/dataService.server';
import { sendMail } from 'services/mailService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { getHost } from 'utils/headers';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug?: string[] }> }
) {
  const params = await props.params;
  const { data } = await request.json();
  if (!data.orderId) {
    console.error('orderId is missing');
    return NextResponse.json({ error: 'orderId is missing' }, { status: 400 });
  }

  const result = await getOrder(data.orderId, params);
  const { texts } = await getWebsite(params.slug?.join('/') ?? '/');

  if (!result?.order) {
    console.error('Order not found');
    return NextResponse.json({ error: 'Order not found' }, { status: 400 });
  }

  const myPagesPageUrl = `${await getHost()}${
    result?.channel?.website.fields.myPagesPage[0].item?.url
  }`;
  console.debug('Rendering order confirmation email...');
  const emailHtml = render(
    await EmailOrderConfirmation(result?.order, myPagesPageUrl, texts)
  );

  const mailOptions: Mail.Options = {
    to: `${result.order.customerDetails.email}`,
    subject: `Order confirmation`,
    html: await emailHtml,
  };

  try {
    console.debug('Sending order confirmation email...');
    await sendMail(mailOptions, params);
    return NextResponse.json({ message: 'Email sent' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

async function getOrder(orderId: string, params: any) {
  return await queryServer({
    query: GET_ORDER,
    url: params.slug?.join('/') ?? '/',
    variables: {
      orderId,
    },
  });
}

const GET_ORDER = gql`
  query GetOrder($orderId: String!) {
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
            }
          }
        }
      }
    }
    order(orderId: $orderId) {
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
  }
`;
