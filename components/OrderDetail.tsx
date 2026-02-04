'use client';
import { gql } from '@apollo/client';
import { approveOrder } from 'app/actions/approveOrder';
import { repeatOrder } from 'app/actions/repeatOrder';
import Currency from 'components/Currency';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { Order, OrderRow } from 'models/order';
import { Fragment, useCallback, useContext, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import {
  calculateTotalDiscounts,
  calculateTotalProducts,
  getProductDiscounts,
  getVatSelector,
} from 'services/discountService';
import { OrderStatus, OrderTags } from 'utils/constants';
import ConfirmationDialog from './ConfirmationDialog';
import FormattedDate from './FormattedDate';
import CartContent from './cart/CartContent';
import { SecondaryButon } from './elements/Button';
import { Heading2, Heading3 } from './elements/Heading';
import { Text } from './elements/Text';

interface OrderDetailProps {
  orderDetail: Order;
  hasApproveOrder?: boolean;
  hasPlaceOrder?: boolean;
}

function OrderDetail(props: OrderDetailProps) {
  const { orderDetail, hasApproveOrder, hasPlaceOrder } = props;
  const t = useTranslations();
  const cartContext = useContext(CartContext);
  const { showPricesIncludingVat } = cartContext.cart;
  const vatSelector = getVatSelector(showPricesIncludingVat);
  const website = useContext(WebsiteContext);
  const getCountryName = (code: string) => {
    return website.countries.find((country) => country.code === code)?.name;
  };
  const [error, setError] = useState('');
  const [order, setOrder] = useState(orderDetail);
  const totalDiscounts = Math.abs(
    calculateTotalDiscounts(order?.discountInfos || [], showPricesIncludingVat)
  );
  const productDiscountLines = getProductDiscounts(order?.discountInfos || []);
  const totalProductDiscounts = Math.abs(
    calculateTotalDiscounts(productDiscountLines, showPricesIncludingVat)
  );
  const totalOtherDiscounts = totalDiscounts - totalProductDiscounts;
  const productLineItems = order?.rows?.filter(
    (item) => item.rowType === 'PRODUCT'
  );
  const itemsSubtotal = calculateTotalProducts(
    productLineItems,
    showPricesIncludingVat
  );

  const reloadOrder = useCallback(async () => {
    const result = (
      await queryClient({
        query: GET_ORDER,
        variables: {
          id: orderDetail.id,
        },
      })
    ).node;
    setOrder(result);
  }, [orderDetail]);

  const approve = async (id: string) => {
    const result = await approveOrder(id);
    if (result.approveOrderForOrganization.boolean) {
      reloadOrder();
      return true;
    } else {
      const errors = result.approveOrderForOrganization.errors;
      let message = '';
      if (errors.length > 0) {
        message = errors[0].type
          ? t(`error.${errors[0].type}`)
          : errors[0].message;
      }
      setError(message);
      return false;
    }
  };

  const reorder = async (rows: OrderRow[]) => {
    try {
      const productLines = rows.filter(
        (row: OrderRow) => row.rowType === 'PRODUCT'
      );
      const cart = await repeatOrder(productLines);
      cartContext.setCart(cart);
      return true;
    } catch (ex: any) {
      setError(ex.message);
      return false;
    }
  };

  const print = () => {
    window.print();
  };

  const formatStatus = (status: string) => {
    return status === OrderStatus.Init
      ? t('orderhistory.status.waitingconfirmation')
      : t(`orderhistory.status.${status.toLowerCase()}`);
  };

  return (
    <Fragment>
      <div className="my-6 flex gap-4 print:hidden">
        {hasPlaceOrder && (
          <SecondaryButon
            reactive={true}
            rounded
            className="w-24 border py-1 text-sm xl:w-80 xl:py-4"
            onClick={() => reorder(order?.rows)}
            data-testid={`${order.orderNumber}__repeat-btn`}
          >
            {t('orderdetail.btn.repeat')}
          </SecondaryButon>
        )}
        {hasApproveOrder && (
          <SecondaryButon
            reactive={true}
            rounded
            disabled={!order?.tags?.includes(OrderTags.AwaitOrderApproval)}
            className="w-24 border py-1 text-sm xl:w-80 xl:py-4"
            onClick={() => approve(order?.id)}
            data-testid={`${order.orderNumber}__approve-btn`}
          >
            {t('orderdetail.btn.approve')}
          </SecondaryButon>
        )}
        <SecondaryButon
          rounded
          className="w-24 border py-1 text-sm xl:w-80 xl:py-4"
          onClick={() => print()}
          data-testid={`${order.orderNumber}__print-btn`}
        >
          {t('orderdetail.btn.print')}
        </SecondaryButon>
      </div>
      <Heading2 className="my-10">
        {t('orderdetail.order')} {order?.orderNumber}
      </Heading2>
      <div className="flex w-full flex-wrap lg:max-w-[800px]">
        <div className="mb-10 w-full lg:w-1/2">
          <Heading3 className="m-0 mb-2 font-bold">
            {t('orderdetail.order')}
          </Heading3>
          <DetailLine
            label={t('orderdetail.date')}
            value={
              <FormattedDate
                className="inline"
                date={new Date(order?.orderDate)}
                data-testid={`${order.orderNumber}__date`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.total')}
            value={
              <Currency
                className="inline"
                price={order?.grandTotal}
                data-testid={`${order.orderNumber}__total`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.status')}
            value={
              <Text inline data-testid={`${order.orderNumber}__status`}>
                {formatStatus(order?.status)}
              </Text>
            }
          />
        </div>
        <div className="mb-10 w-full lg:w-1/2">
          <Heading3 className="m-0 mb-2 font-bold">
            {t('orderdetail.shippingaddress')}
          </Heading3>
          <DetailLine
            value={
              <Text inline data-testid={`${order.orderNumber}__name`}>
                {`${order?.shippingAddress?.firstName} ${order?.shippingAddress?.lastName}`}
              </Text>
            }
          />
          <DetailLine
            value={
              <Text inline data-testid={`${order.orderNumber}__address`}>
                {order?.shippingAddress?.address1}
              </Text>
            }
          />
          <DetailLine
            value={
              <Text inline data-testid={`${order.orderNumber}__zipcode-city`}>
                {`${order?.shippingAddress?.zipCode} ${order?.shippingAddress?.city}`}
              </Text>
            }
          />
          <DetailLine
            value={
              <Text inline data-testid={`${order.orderNumber}__country`}>
                {getCountryName(order?.shippingAddress?.country || '')}
              </Text>
            }
          />
          <DetailLine
            label={t('orderdetail.email')}
            value={
              <Text inline data-testid={`${order.orderNumber}__email`}>
                {order?.shippingAddress?.email}
              </Text>
            }
          />
          <DetailLine
            label={t('orderdetail.phone')}
            value={
              <Text inline data-testid={`${order.orderNumber}__phone`}>
                {order?.shippingAddress?.phoneNumber}
              </Text>
            }
          />
        </div>
        <div className="mb-10 w-full lg:w-1/2">
          <Heading3 className="m-0 mb-2 font-bold">
            {t('orderdetail.ordersummary')}
          </Heading3>
          <DetailLine
            label={t('orderdetail.itemssubtotal')}
            value={
              <Currency
                className="inline"
                price={itemsSubtotal}
                data-testid={`${order.orderNumber}__itemssubtotal`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.fees')}
            value={
              <Currency
                className="inline"
                price={order?.[`totalFees${vatSelector}`] || 0}
                data-testid={`${order.orderNumber}__fees`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.delivery')}
            value={
              <Currency
                className="inline"
                price={order?.[`shippingCost${vatSelector}`] || 0}
                data-testid={`${order.orderNumber}__delivery`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.discount')}
            value={
              <Currency
                className="inline"
                price={totalOtherDiscounts}
                data-testid={`${order.orderNumber}__discount`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.vat')}
            value={
              <Currency
                className="inline"
                price={order?.totalVat}
                data-testid={`${order.orderNumber}__vat`}
              />
            }
          />
          <DetailLine
            label={t('orderdetail.total')}
            value={
              <Currency
                className="inline"
                price={order?.grandTotal}
                data-testid={`${order.orderNumber}__grandTotal`}
              />
            }
          />
        </div>
        <div className="mb-10 w-full lg:w-1/2">
          <Heading3 className="m-0 mb-2 font-bold">
            {t('orderdetail.items')}
          </Heading3>
          <CartContent
            rows={order?.rows}
            updatable={false}
            showCostDetails={false}
          />
        </div>
      </div>
      <ConfirmationDialog
        visible={!!error}
        title={error}
        onCancel={() => setError('')}
        btnCancelTitle="orderdetail.btn.cancel"
      />
    </Fragment>
  );
}

const DetailLine = ({
  label,
  value,
}: {
  label?: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="mb-2">
      {label && (
        <Text inline={true} className="mr-2 font-bold">
          {label}
        </Text>
      )}
      {value}
    </div>
  );
};

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    node(id: $id) {
      ...OrderDetail
    }
  }
`;

export default OrderDetail;
