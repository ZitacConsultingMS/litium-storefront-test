import { gql } from '@apollo/client';
import { render } from '@react-email/render';
import { NextResponse, type NextRequest } from 'next/server';
import Mail from 'nodemailer/lib/mailer';
import { ORDER_ADDRESS_FRAGMENT } from 'operations/fragments/checkout';
import { IMAGE_FRAGMENT } from 'operations/fragments/image';
import { queryServer } from 'services/dataService.server';
import { sendMail } from 'services/mailService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { getStockBalance, StockBalance } from 'services/zitac/stockbalanceService';
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

  // Extract the url query parameter to identify which website the request comes from
  const urlParam = request.nextUrl.searchParams.get('url');
  let contextPath = params.slug?.join('/') ?? '/';

  if (urlParam) {
    // If urlParam is a full URL (starts with http:// or https://), extract the path
    // Otherwise, use it as-is (it's already a relative path)
    if (urlParam.startsWith('http://') || urlParam.startsWith('https://')) {
      try {
        const urlObj = new URL(urlParam);
        contextPath = urlObj.pathname;
      } catch {
        // If parsing fails, fall back to using the original param
        contextPath = urlParam;
      }
    } else {
      // It's already a relative path, use it directly
      contextPath = urlParam;
    }
  }

  const result = await getOrder(data.orderId, { slug: contextPath.split('/').filter(Boolean) });
  const website = await getWebsite(contextPath);

  if (!result?.order) {
    console.error('Order not found');
    return NextResponse.json({ error: 'Order not found' }, { status: 400 });
  }

  const myPagesPageUrl = `${await getHost()}${result?.channel?.website.fields.myPagesPage[0].item?.url
    }`;

  // Determine B2B vs B2C based on website identification
  // B2B site contains '/af' in the path
  const isB2B = contextPath.includes('/af') || website.homePageUrl.includes('/af');

  // Fetch stock data for all products in the order
  const stockDataMap: Record<string, StockBalance | null> = {};
  const productLineItems = result.order.rows.filter(
    (item: any) => item.rowType === 'PRODUCT'
  );

  // Check if pickup in store is selected (B2C only)
  const shippingFeeLine = result.order.rows.filter(
    (item: any) => item.rowType === 'SHIPPING_FEE'
  );
  const selectedShipmentDescription = shippingFeeLine[0]?.description || '';
  const isPickupInStore = (() => {
    const lower = (selectedShipmentDescription ?? '').toLocaleLowerCase('sv-SE').trim();
    return lower.includes('hämta i butik') || lower.includes('hamta i butik');
  })();

  // Fetch stock if B2B, or if B2C and not pickup in store
  if (isB2B || !isPickupInStore) {
    // Fetch stock for all products in parallel
    const stockPromises = productLineItems.map(async (item: any) => {
      try {
        const stockData = await getStockBalance(item.articleNumber);
        // Find the stock from "huvudlager" (main warehouse), same as in CartLineItemOrderConfirmation
        const huvudlagerStock = stockData.find((s) =>
          s.name.toLowerCase().includes('huvudlager')
        );
        return { articleNumber: item.articleNumber, stock: huvudlagerStock || null };
      } catch (error) {
        console.error(`[Email Order Confirmation] Failed to fetch stock for ${item.articleNumber}:`, error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error(`[Email Order Confirmation] Error message: ${error.message}`);
          console.error(`[Email Order Confirmation] Error stack: ${error.stack}`);
        }
        return { articleNumber: item.articleNumber, stock: null };
      }
    });

    const stockResults = await Promise.all(stockPromises);
    stockResults.forEach(({ articleNumber, stock }) => {
      stockDataMap[articleNumber] = stock;
    });
  }

  // Dynamically import the appropriate component based on website identification
  const EmailOrderConfirmation = isB2B
    ? (await import('components/emails/zitac/EmailOrderConfirmation.b2b')).default
    : (await import('components/emails/zitac/EmailOrderConfirmation.b2c')).default;

  console.debug('Rendering order confirmation email...');
  const emailHtml = render(
    await EmailOrderConfirmation(
      result?.order,
      myPagesPageUrl,
      website.texts,
      contextPath,
      stockDataMap
    )
  );

  // Build Trustpilot structured data snippet (only for B2C)
  // let finalEmailHtml = await emailHtml;
  // if (!isB2B) {
  //   const order = result.order;
  //   const productLineItems = order.rows.filter((item: any) => item.rowType === 'PRODUCT');
  //   const productSkus = productLineItems.map((item: any) => item.articleNumber);
  //   const recipientName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim();
  //   const recipientEmail = order.customerDetails?.email || '';
  //   const referenceId = order.orderNumber;

  //   const trustpilotData = {
  //     recipientName,
  //     recipientEmail,
  //     referenceId,
  //     productSkus,
  //   };

  //   const trustpilotScript = `<script type="application/json+trustpilot">${JSON.stringify(trustpilotData)}</script>`;
  //   // Inject Trustpilot script before closing body tag
  //   finalEmailHtml = finalEmailHtml.replace('</body>', `${trustpilotScript}</body>`);
  // }

  // Use emailHtml directly
  const finalEmailHtml = await emailHtml;

  const mailOptions: Mail.Options = {
    to: `${result.order.customerDetails.email}`,
    subject: `Order confirmation`,
    html: finalEmailHtml,
  };

  try {
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
  ${ORDER_ADDRESS_FRAGMENT}
  ${IMAGE_FRAGMENT}
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
          ... on IContentItem {
            id
          }
          ... on IProductItem {
            name
            smallImages: images(max: { height: 80, width: 80 }) {
              ...Image
            }
          }
          ... on AllAttributesInListProduct {
            fieldGroups(filter: { id: { value: "LagerLeverans", operator: "eq" } }) {
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
  }
`;
