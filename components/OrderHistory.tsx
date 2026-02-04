'use client';
import { gql } from '@apollo/client';
import { approveOrder } from 'app/actions/approveOrder';
import { repeatOrder } from 'app/actions/repeatOrder';
import Link from 'components/Link';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { Order, OrderRow } from 'models/order';
import { PageInfo } from 'models/pageInfo';
import { Fragment, useCallback, useContext, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { OrderStatus, OrderTags, PaginationOptions } from 'utils/constants';
import ConfirmationDialog from './ConfirmationDialog';
import Currency from './Currency';
import DataView from './DataView';
import FormattedDate from './FormattedDate';
import Table, { IColumnType } from './Table';
import { Button } from './elements/Button';

interface OrderListProps {
  pageInfo: PageInfo;
  nodes: Order[];
  pageSize?: number;
  showOrganizationOrders?: boolean;
  hasApproveOrder?: boolean;
  hasPlaceOrder?: boolean;
}

function OrderHistory(props: OrderListProps) {
  const {
    showOrganizationOrders = false,
    hasApproveOrder = false,
    hasPlaceOrder = false,
    pageSize = PaginationOptions.OrderSize,
  } = props;
  const t = useTranslations();
  const cartContext = useContext(CartContext);
  const orderPageUrl = useContext(WebsiteContext)?.orderPageUrl || '';
  const [orders, setOrders] = useState([...props.nodes]);
  const [hasNextPage, setHasNextPage] = useState(props.pageInfo.hasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    const result = (
      await queryClient({
        query: showOrganizationOrders ? GET_ORDERS_ORGANIZATION : GET_ORDERS,
        variables: {
          first: pageSize,
          after: String(orders.length),
        },
      })
    ).me;
    const orderIncomming = showOrganizationOrders
      ? result.selectedOrganization.organization.orders
      : result.orders;
    setOrders([...orders, ...orderIncomming.nodes]);
    setHasNextPage(orderIncomming.pageInfo.hasNextPage);
    setIsLoading(false);
  }, [showOrganizationOrders, orders, pageSize]);

  const reloadOrdersOrganization = useCallback(async () => {
    const result = (
      await queryClient({
        query: GET_ORDERS_ORGANIZATION,
        variables: {
          first: orders.length,
          after: '0',
        },
      })
    ).me;
    const orderIncomming = result.selectedOrganization.organization.orders;
    setOrders([...orderIncomming.nodes]);
    setHasNextPage(orderIncomming.pageInfo.hasNextPage);
  }, [orders.length]);

  const approve = async (id: string) => {
    const result = await approveOrder(id);
    if (result.approveOrderForOrganization.boolean) {
      reloadOrdersOrganization();
    } else {
      const errors = result.approveOrderForOrganization.errors;
      let message = '';
      if (errors.length > 0) {
        message = errors[0].type
          ? t(`error.${errors[0].type}`)
          : errors[0].message;
      }
      setError(message);
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

  const formatStatus = (status: string) => {
    return status === OrderStatus.Init
      ? t('orderhistory.status.waitingconfirmation')
      : t(`orderhistory.status.${status.toLowerCase()}`);
  };

  let columns: IColumnType<Order>[] = [
    {
      key: 'orderDate',
      title: t('orderhistory.column.date'),
      render: ({ orderDate }) => (
        <FormattedDate date={new Date(orderDate)} className="min-w-max" />
      ),
    },
    {
      key: 'orderNumber',
      title: t('orderhistory.column.ordernumber'),
      render: ({ id, orderNumber }) => (
        <Link
          href={{ pathname: orderPageUrl, query: { orderId: id } }}
          className="text-hyperlink"
        >
          {orderNumber}
        </Link>
      ),
    },
    {
      key: 'status',
      title: t('orderhistory.column.status'),
      render: ({ status }) => formatStatus(status),
    },
    {
      key: 'grandTotal',
      title: t('orderhistory.column.total'),
      render: ({ grandTotal }) => <Currency price={grandTotal} />,
    },
  ];

  if (showOrganizationOrders) {
    columns.push({
      key: '_',
      title: '',
      render: ({ tags, id, rows }) => (
        <div className="flex">
          <Button
            className="mr-4 w-24 border p-1 text-sm"
            rounded
            disabled={
              !(hasApproveOrder && tags.includes(OrderTags.AwaitOrderApproval))
            }
            onClick={() => approve(id)}
            data-testid="order-history__approve-btn"
          >
            {t('orderhistory.btn.approve')}
          </Button>
          <Button
            className="h-full w-24 border p-1 text-sm"
            rounded
            disabled={!hasPlaceOrder}
            onClick={() => reorder(rows)}
            reactive={true}
          >
            {t('orderhistory.btn.repeat')}
          </Button>
        </div>
      ),
    });
  }

  const renderOrderRow = (item: Order) => (
    <Fragment>
      <div className="mb-3 flex flex-wrap rounded border py-2">
        <div className="w-1/2 px-3 py-2">
          <FormattedDate
            date={new Date(item.orderDate)}
            className="min-w-max"
          />
        </div>
        <div className="w-1/2 px-3 py-2">
          <Link
            href={{ pathname: orderPageUrl, query: { orderId: item.id } }}
            className="text-hyperlink"
          >
            {item.orderNumber}
          </Link>
        </div>
        <div className="w-1/2 px-3 py-2">{formatStatus(item.status)}</div>
        <div className="w-1/2 px-3 py-2">
          <Currency price={item.grandTotal} />
        </div>
        {showOrganizationOrders && (
          <Fragment>
            <div className="w-1/2 px-3 py-2 lg:w-auto">
              <Button
                className="w-24 border p-1 text-sm"
                rounded
                disabled={
                  !(
                    hasApproveOrder &&
                    item.tags.includes(OrderTags.AwaitOrderApproval)
                  )
                }
                onClick={() => approve(item.id)}
                data-testid="order-history__approve-btn"
              >
                {t('orderhistory.btn.approve')}
              </Button>
            </div>
            <div className="w-1/2 px-3 py-2 lg:w-auto">
              <Button
                reactive={true}
                className="h-full w-24 border p-1 text-sm"
                rounded
                disabled={!hasPlaceOrder}
                onClick={() => reorder(item.rows)}
              >
                {t('orderhistory.btn.repeat')}
              </Button>
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );

  return (
    <Fragment>
      <Table data={orders} columns={columns} className="hidden lg:table" />
      <DataView
        items={orders}
        renderItem={renderOrderRow}
        className="lg:hidden"
      />
      {hasNextPage && (
        <Button
          className="mt-10 border p-4 text-sm sm:w-80"
          fluid={true}
          rounded={true}
          disabled={isLoading}
          onClick={() => {
            handleLoadMore();
          }}
        >
          {isLoading
            ? t('orderhistory.btn.loading')
            : t('orderhistory.btn.loadmore')}
        </Button>
      )}
      <ConfirmationDialog
        visible={!!error}
        title={error}
        onCancel={() => setError('')}
        btnCancelTitle="orderhistory.btn.cancel"
      />
    </Fragment>
  );
}

const GET_ORDERS = gql`
  query GetOrders($first: Int, $after: String) {
    me {
      orders(first: $first, after: $after) {
        ...Order
      }
    }
  }
`;

const GET_ORDERS_ORGANIZATION = gql`
  query GetOrdersOrganization($first: Int, $after: String) {
    me {
      person {
        id
      }
      selectedOrganization {
        organization {
          id
          orders(first: $first, after: $after) {
            ...Order
          }
        }
        roleOperations {
          name
          roleOperationId
        }
      }
    }
  }
`;
export default OrderHistory;
