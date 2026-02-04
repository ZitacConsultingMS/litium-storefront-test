export const PaginationOptions = {
  PageSize: 50,
  OrderSize: 10, // Number of items per page
};

export const DiscountType = {
  DiscountedProductPrice: 'DiscountedProductPrice',
  ProductDiscount: 'ProductDiscount',
  BuyXGetCheapestDiscount: 'BuyXGetCheapestDiscount',
  MixAndMatch: 'MixAndMatch',
  FreeGift: 'FreeGift',
  BuyXGetMostExpensiveDiscount: 'BuyXGetMostExpensiveDiscount',
  OrderDiscount: 'OrderDiscount',
  FreeDelivery: 'FreeDelivery',
};

export const ShippingIntegrationType = {
  Inline: 'INLINE',
  DeliveryCheckout: 'DELIVERY_CHECKOUT',
  DeliveryOptions: 'DELIVERY_OPTIONS',
  PaymentCheckout: 'PAYMENT_CHECKOUT',
};

export const PaymentIntegrationType = {
  IframeCheckout: 'IFRAME_CHECKOUT',
  PaymentWidgets: 'PAYMENT_WIDGETS',
  DirectPayment: 'DIRECT_PAYMENT',
  HostedPaymentPage: 'HOSTED_PAYMENT_PAGE',
  PaymentApp: 'PAYMENT_APP',
  PaymentLink: 'PAYMENT_LINK',
  QuickCheckoutButton: 'QUICK_CHECKOUT_BUTTON',
  GiftCard: 'GIFT_CARD',
};

export const Token = {
  Name: '.AspNetCore.Identity.Application',
};

export const CookieKeys = {
  ChannelId: 'channel-id',
};

export const HeaderKeys = {
  OriginalUrl: 'x-original-url',
  ContextUrl: 'x-litium-storefront-context-url',
};

export const RoleType = {
  PlaceOrder: '_placeOrders',
  ReadOrder: '_readOrders',
  ReadOrganization: '_readOrganization',
  ApproveOrder: '_approveOrders',
};

export const OrderTags = {
  AwaitOrderApproval: '_awaitOrderApproval',
};

export const OrderStatus = {
  Init: 'Init',
};
