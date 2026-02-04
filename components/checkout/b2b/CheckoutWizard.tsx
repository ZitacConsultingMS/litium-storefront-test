'use client';

import { gql } from '@apollo/client';
import { Checkbox } from 'components/elements/Checkbox';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import { Button } from 'components/elements/zitac/Button';
import ErrorText, { ErrorField } from 'components/form/ErrorText';
import { CartContext } from 'contexts/cartContext';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import {
  Checkout,
  CheckoutOption,
  OrderCustomerDetails,
} from 'models/checkout';
import { usePathname, useRouter } from 'next/navigation';
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoadingFallback } from 'components/blocks/ZsLoadingFallback';
import { get } from 'services/cartService.client';
import {
  createCheckoutSession,
  placeOrder,
  updateAddresses,
  updateBillingAddress,
  updateCheckoutAdditionalInfo,
  updateCheckoutOptions,
  updateShippingWidget,
  validateCart,
} from 'services/checkoutService.client';
import { queryClient } from 'services/dataService.client';
import { calculateTotalFees } from 'services/discountService';
import {
  PaymentIntegrationType,
  ShippingIntegrationType,
} from 'utils/constants';
import { withErrorCatch } from 'utils/withErrorCatch';
import AddressSummary from '../AddressSummary';
import DeliveryOptions from '../DeliveryOptions';
import PaymentOptions from '../PaymentOptions';
import PaymentWidget from '../payments/PaymentWidget';
import ShipmentWidget from '../shipments/ShipmentWidget';
import AddressForm from '../zitac/AddressForm';
import DeliverySummary from '../zitac/DeliverySummary';
import TotalSummary from '../zitac/TotalSummary';
import B2BReferenceFields from './B2BReferenceFields';
import CheckoutBlockedB2B from './CheckoutBlockedB2B';

const STEP_DELIVERY_ADDRESS = 0;
const STEP_DELIVERY_OPTION = 1;
const STEP_PAYMENT = 2;

// Query to get person and user addresses
const GET_B2B_CHECKOUT_USER = gql`
  query GetB2BCheckoutUser {
    me {
      selectedOrganization {
        organization {
          ... on OrganizationTemplateOrganization {
            fields {
              blockedForOrderB2b
            }
          }
        }
      }
      person {
        id
        organizations {
          nodes {
            organization {
              ... on OrganizationTemplateOrganization {
                fields {
                  blockedForOrderB2b
                }
              }
            }
          }
        }
        ... on B2BPersonTemplatePerson {
          fields {
            _firstName
            _lastName
            _email
          }
        }
        addresses {
          id
          address1
          city
          country
          zipCode
          phoneNumber
        }
      }
    }
  }
`;

/**
 * Renders checkout steps in sequence for B2B customers.
 * When orderReferens/erReferens are passed (e.g. from page above cart), they are used in createCheckoutSession and not rendered here.
 */
function CheckoutWizard(props: {
  state?: Checkout;
  initialAddress?: OrderAddress;
  orderReferens?: string;
  erReferens?: string;
}) {
  const t = useTranslations();
  const {
    checkoutPageUrl,
    receiptPageUrl,
    termsAndConditionsUrl,
    homePageUrl,
  } = useContext(WebsiteContext);
  const cartContext = useContext(CartContext);
  const { showPricesIncludingVat } = cartContext.cart;
  const { rows } = cartContext.cart;
  const hasCartChanged = cartContext.hasCartChanged;

  const getCart = useCallback(async () => {
    const cart = await get();
    cartContext.setCart(cart);
  }, [cartContext]);

  // Pre-populate checkout state with B2B user info if provided
  const getInitialCheckoutState = useCallback(() => {
    if (props.state) {
      return props.state;
    }
    if (props.initialAddress) {
      return {
        ...DefaultCheckoutState,
        shippingAddress: props.initialAddress,
        billingAddress: props.initialAddress,
      };
    }
    return DefaultCheckoutState;
  }, [props.state, props.initialAddress]);

  const [checkout, setCheckout] = useState<Checkout>(getInitialCheckoutState());
  const {
    shippingAddress,
    shippingOptions,
    billingAddress,
    paymentHtmlSnippet,
    shipmentHtmlSnippet,
  } = checkout;
  const shippingFeeLine = rows.filter(
    (item) => item.rowType === 'SHIPPING_FEE'
  );
  const totalShippingFees = calculateTotalFees(
    shippingFeeLine,
    showPricesIncludingVat
  );

  //new for nshift/payment filtering
  const [paymentOptions, setPaymentOptions] = useState<CheckoutOption[]>(
    filterPayment(checkout.paymentOptions)
  );

  // Helper function to select default shipping option based on integration type
  const selectDefaultShippingOption = useCallback(
    async (
      shippingOptions: CheckoutOption[],
      targetIntegrationType?: string
    ) => {
      let filteredOptions: CheckoutOption[];

      if (targetIntegrationType === ShippingIntegrationType.PaymentCheckout) {
        filteredOptions = shippingOptions.filter(
          (item) =>
            item.integrationType === ShippingIntegrationType.PaymentCheckout
        );
      } else if (
        targetIntegrationType === ShippingIntegrationType.DeliveryCheckout
      ) {
        filteredOptions = shippingOptions.filter(
          (item) =>
            item.integrationType === ShippingIntegrationType.DeliveryCheckout
        );
      } else {
        filteredOptions = shippingOptions.filter(
          (item) =>
            item.integrationType !== ShippingIntegrationType.PaymentCheckout
        );
      }

      if (filteredOptions.length > 0) {
        await saveShippingOptions(filteredOptions[0].id);
        await getCart();
      }
    },
    [getCart]
  );

  useEffect(() => {
    setPaymentOptions(filterPayment(checkout.paymentOptions));
  }, [checkout.paymentOptions]);

  const saveBillingAddress = async (billingAddress: OrderAddress) => {
    const result = await updateBillingAddress(billingAddress);
    setCheckout(result);
  };
  const savePaymentOptions = async (id: string) => {
    const checkoutOption = {
      paymentOptionId: id,
    };
    const result = await updateCheckoutOptions(checkoutOption);
    setCheckout(result);
  };
  const saveShippingOptions = async (id: string) => {
    setIsUpdatingShipping(true);
    try {
      const checkoutOption = {
        shippingOptionId: id,
      };
      const result = await updateCheckoutOptions(checkoutOption);
      setCheckout(result);
    } finally {
      setIsUpdatingShipping(false);
    }
  };
  const saveShippingWidget = async (id: string) => {
    setIsUpdatingShipping(true);
    try {
      const result = await updateShippingWidget(id);
      setCheckout(result);
    } finally {
      setIsUpdatingShipping(false);
    }
  };
  const confirmOrder = async () => {
    const result = await placeOrder();
    if (result.placeOrder?.errors) {
      throw result.placeOrder.errors;
    }
    return result;
  };
  const saveAddresses = useCallback(
    async ({
      shippingAddress,
      billingAddress,
      customerDetails,
    }: {
      shippingAddress: OrderAddress;
      billingAddress: OrderAddress;
      customerDetails: OrderCustomerDetails;
    }) => {
      let result = await updateAddresses({
        shippingAddress,
        billingAddress,
        customerDetails,
      });
      // Re-apply order-head refs so updateAddresses doesn't wipe them
      const additionalInfo = [
        { key: 'CustomerRef', value: erReferensRef.current ?? '' },
        { key: 'CustomerOrderNo', value: orderReferensRef.current ?? '' },
      ];
      if (additionalInfo.length > 0) {
        result = await updateCheckoutAdditionalInfo(additionalInfo);
      }
      setCheckout(result);
    },
    []
  );
  const {
    initialStep,
    showAddress,
    showDelivery,
    showPaymentOptions,
    showSummary,
  } = getDisplayLogic(paymentOptions, shippingOptions);

  // For B2B, if we have initial address, skip address step and go to delivery options
  const getInitialStep = useCallback(() => {
    if (props.initialAddress && initialStep === STEP_DELIVERY_ADDRESS) {
      return STEP_DELIVERY_OPTION;
    }
    return initialStep || 0;
  }, [props.initialAddress, initialStep]);

  const [step, setStep] = useState(getInitialStep());
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [hasAltAddress, setHasAltAddress] = useState(false);
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [placeOrderErrors, setPlaceOrderErrors] = useState<ErrorField[]>([]);
  const [sessionErrors, setSessionErrors] = useState<ErrorField[]>([]);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [selectedShipmentWidget, setSelectedShipmentWidget] = useState('');
  const [selectedShipmentName, setSelectedShipmentName] = useState('');
  const [widgetSnippet, setWidgetSnippet] = useState<string>('');
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  // Order header reference fields (sent in createCheckoutSession additionalInfo)
  const [orderReferens, setOrderReferens] = useState('');
  const [erReferens, setErReferens] = useState('');
  const orderReferensRef = useRef('');
  const erReferensRef = useRef('');
  orderReferensRef.current =
    props.orderReferens !== undefined ? props.orderReferens : orderReferens;
  erReferensRef.current =
    props.erReferens !== undefined ? props.erReferens : erReferens;
  const referensFromProps = props.orderReferens !== undefined;
  const referensFilled = referensFromProps
    ? Boolean(props.orderReferens?.trim() && props.erReferens?.trim())
    : Boolean(orderReferens.trim() && erReferens.trim());

  // When user clicks Continue from step 0 we recreate session with refs and restore addresses
  const [sessionCreationTrigger, setSessionCreationTrigger] = useState(0);
  const previousAddressesRef = useRef<{
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    customerDetails: OrderCustomerDetails;
  } | null>(null);
  const shouldAdvanceStepRef = useRef(false);

  const selectedDeliveryOption = getSelectedOption(shippingOptions);
  const selectedPaymentOption = getSelectedOption(paymentOptions);
  const selectedDeliveryName =
    selectedDeliveryOption?.integrationType ===
      ShippingIntegrationType.DeliveryCheckout ||
    selectedDeliveryOption?.integrationType ===
      ShippingIntegrationType.DeliveryOptions
      ? (shippingFeeLine?.length > 0 && shippingFeeLine[0].description) ||
        selectedDeliveryOption?.name
      : selectedDeliveryOption?.name;
  const router = useRouter();
  const pathname = usePathname();
  const createSession = useCallback(async () => {
    const host = window.location.origin;
    const orderConfirmedUrlWithQuery = homePageUrl
      ? `${host}/api/email/orderConfirmation${pathname}?url=${encodeURIComponent(homePageUrl)}`
      : `${host}/api/email/orderConfirmation${pathname}`;
    const additionalInfo = [
      { key: 'CustomerRef', value: erReferensRef.current ?? '' },
      { key: 'CustomerOrderNo', value: orderReferensRef.current ?? '' },
    ];
    const checkoutState = await createCheckoutSession(
      {
        checkoutPageUrl: `${host}${checkoutPageUrl}`,
        cancelPageUrl: `${host}${checkoutPageUrl}`,
        receiptPageUrl: `${host}${receiptPageUrl}`,
        termUrl: `${host}${termsAndConditionsUrl}`,
        allowSeparateShippingAddress: true,
        disablePaymentShippingOptions: false,
        additionalInfo,
      },
      {
        orderConfirmedUrl: orderConfirmedUrlWithQuery,
      }
    );
    const checkoutWithRefs =
      additionalInfo.length > 0
        ? await updateCheckoutAdditionalInfo(additionalInfo)
        : checkoutState;
    setCheckout(checkoutWithRefs);
    return checkoutWithRefs;
  }, [
    checkoutPageUrl,
    receiptPageUrl,
    pathname,
    termsAndConditionsUrl,
    homePageUrl,
  ]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [isBlockedForOrderB2b, setIsBlockedForOrderB2b] = useState(false);
  const blockedRef = useRef(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  // True only after session + B2B prefill attempt have finished (avoids brief "no address" flash)
  const [isAddressLoadComplete, setIsAddressLoadComplete] = useState(false);

  // Create checkout session on load or when cart changes, then prefill B2B user
  // address so we never overwrite prefilled data with an empty session (race fix).
  useEffect(() => {
    let cancelled = false;
    setPrefillError(null);
    if (!blockedRef.current) {
      setIsAddressLoadComplete(false);
    }

    const setBlockedAndComplete = () => {
      blockedRef.current = true;
      setIsBlockedForOrderB2b(true);
      setIsAuthenticated(true);
      if (!cancelled) setIsAddressLoadComplete(true);
    };

    const run = async () => {
      try {
        setHasTriedFetch(true);
        const result: any = await queryClient({ query: GET_B2B_CHECKOUT_USER });
        if (cancelled) return;

        const me = result?.me;
        const isBlocked = (v: unknown) => v === true || v === 'true';
        const blocked =
          isBlocked(
            me?.selectedOrganization?.organization?.fields?.blockedForOrderB2b
          ) ||
          (me?.person?.organizations?.nodes ?? []).some((n: any) =>
            isBlocked(n?.organization?.fields?.blockedForOrderB2b)
          );

        if (blocked) {
          setBlockedAndComplete();
          return;
        }
        blockedRef.current = false;
        setIsBlockedForOrderB2b(false);

        let checkoutState: Checkout;
        try {
          checkoutState = await createSession();
        } catch (sessionError) {
          if (!cancelled) setIsAddressLoadComplete(true);
          throw sessionError;
        }
        if (cancelled) return;

        // Recreate-session path: user clicked Continue from step 0 with refs – apply new session, optionally restore addresses, advance step.
        if (previousAddressesRef.current) {
          const prev = previousAddressesRef.current;
          previousAddressesRef.current = null;
          if (!cancelled) setCheckout(checkoutState);
          if (!checkoutState.shippingAddress?.address1) {
            try {
              let restored = await updateAddresses(prev);
              const additionalInfo = [
                { key: 'CustomerRef', value: erReferensRef.current ?? '' },
                { key: 'CustomerOrderNo', value: orderReferensRef.current ?? '' },
              ];
              if (additionalInfo.length > 0) {
                restored = await updateCheckoutAdditionalInfo(additionalInfo);
              }
              if (!cancelled) setCheckout(restored);
            } catch (restoreError) {
              if (!cancelled) setIsAddressLoadComplete(true);
              throw restoreError;
            }
          }
          if (shouldAdvanceStepRef.current) {
            shouldAdvanceStepRef.current = false;
            setStep(STEP_DELIVERY_OPTION);
          }
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        if (checkoutState.shippingAddress?.address1) {
          setIsAuthenticated(true);
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        // Recreate-session path: user clicked Continue from step 0 with refs – restore addresses and advance step
        if (previousAddressesRef.current) {
          const prev = previousAddressesRef.current;
          previousAddressesRef.current = null;
          try {
            let restored = await updateAddresses(prev);
            const additionalInfo = [
              { key: 'CustomerRef', value: erReferensRef.current ?? '' },
              { key: 'CustomerOrderNo', value: orderReferensRef.current ?? '' },
            ];
            if (additionalInfo.length > 0) {
              restored = await updateCheckoutAdditionalInfo(additionalInfo);
            }
            if (!cancelled) setCheckout(restored);
          } catch (restoreError) {
            if (!cancelled) setIsAddressLoadComplete(true);
            throw restoreError;
          }
          if (shouldAdvanceStepRef.current) {
            shouldAdvanceStepRef.current = false;
            setStep(STEP_DELIVERY_OPTION);
          }
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        // If session already has address, skip B2B prefill
        if (checkoutState.shippingAddress?.address1) {
          setIsAuthenticated(true);
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        const person = me?.person;
        if (!person) {
          setIsAuthenticated(false);
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        const addresses = person.addresses ?? [];
        if (!Array.isArray(addresses) || addresses.length === 0) {
          setIsAuthenticated(true);
          if (!cancelled) setIsAddressLoadComplete(true);
          return;
        }

        setIsAuthenticated(true);

        const fields = person.fields ?? {};
        const firstAddress = addresses[0];

        const addr: OrderAddress = {
          firstName: fields._firstName || '',
          lastName: fields._lastName || '',
          email: fields._email || '',
          phoneNumber: firstAddress.phoneNumber || '',
          organizationName: '',
          address1: firstAddress.address1 || '',
          zipCode: firstAddress.zipCode || '',
          city: firstAddress.city || '',
          country: firstAddress.country || '',
        };

        const customerDetails: OrderCustomerDetails = {
          firstName: addr.firstName,
          lastName: addr.lastName,
          email: addr.email,
          phone: addr.phoneNumber,
          customerType: 'ORGANIZATION',
        };

        await saveAddresses({
          shippingAddress: addr,
          billingAddress: addr,
          customerDetails,
        });
        if (!cancelled) setIsAddressLoadComplete(true);
      } catch (error: any) {
        setHasTriedFetch(true);
        const errors = Array.isArray(error)
          ? error
          : (error?.graphQLErrors ?? []);
        const isAuthError = errors.some(
          (e: any) =>
            e.extensions?.code === 'AUTH_NOT_AUTHORIZED' ||
            e.message?.includes('not authorized')
        );
        if (isAuthError) {
          setIsAuthenticated(false);
        } else {
          const message =
            errors[0]?.message ?? error?.message ?? 'Something went wrong';
          if (!cancelled) setPrefillError(message);
        }
        if (!cancelled) setIsAddressLoadComplete(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [rows, createSession, saveAddresses, sessionCreationTrigger]);

  // Initial cart validation
  useEffect(() => {
    withErrorCatch(async () => {
      const result = await validateCart();
      if (result.validateCart?.validationError) {
        throw result.validateCart.validationError;
      }
      return result;
    }, setPlaceOrderErrors);
  }, []);

  useEffect(() => {
    if (hasCartChanged) {
      if (
        selectedDeliveryOption &&
        selectedDeliveryOption.integrationType ===
          ShippingIntegrationType.DeliveryCheckout
      ) {
        setSelectedShipmentWidget('');
        setIsUpdatingShipping(true);
        saveShippingOptions(selectedDeliveryOption.id).finally(() => {
          getCart().finally(() => {
            setIsUpdatingShipping(false);
          });
          if (step === STEP_PAYMENT) {
            setStep(STEP_DELIVERY_OPTION);
          }
        });
      }
      // Clear place order errors when cart content changes
      setPlaceOrderErrors([]);

      cartContext.setHasCartChanged(false);
    }
  }, [getCart, selectedDeliveryOption, hasCartChanged, step, cartContext]);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (
      shippingOptions.length &&
      shippingOptions.every((item) => item.selected === false)
    ) {
      if (
        hasIntegrationType(
          paymentOptions,
          PaymentIntegrationType.IframeCheckout
        ) &&
        hasIntegrationType(
          shippingOptions,
          ShippingIntegrationType.PaymentCheckout
        )
      ) {
        selectDefaultShippingOption(
          shippingOptions,
          ShippingIntegrationType.PaymentCheckout
        );
      } else if (step === STEP_DELIVERY_OPTION) {
        if (
          hasIntegrationType(
            shippingOptions,
            ShippingIntegrationType.DeliveryCheckout
          )
        ) {
          selectDefaultShippingOption(
            shippingOptions,
            ShippingIntegrationType.DeliveryCheckout
          );
        } else {
          selectDefaultShippingOption(shippingOptions);
        }
      }
    }
  }, [
    getCart,
    paymentOptions,
    shippingOptions,
    step,
    selectDefaultShippingOption,
  ]);

  const isPickupInStore = (s?: string) => {
    const lower = (s ?? '').toLocaleLowerCase('sv-SE').trim();
    return lower.includes('hämta i butik') || lower.includes('hamta i butik');
  };

  const isPickup = isPickupInStore(selectedShipmentName);

  // Prefer DirectPayment for pickup, IframeCheckout for delivery
  // But fall back to available options if preferred type is not available
  const desiredPaymentIntegrationType = isPickup
    ? PaymentIntegrationType.DirectPayment
    : PaymentIntegrationType.IframeCheckout;

  const filteredPaymentOptionsForUI = useMemo(() => {
    const all = paymentOptions ?? [];
    const preferred = all.filter(
      (o) => o.integrationType === desiredPaymentIntegrationType
    );
    // If preferred type is not available, fall back to the other type
    if (preferred.length === 0) {
      const fallbackType =
        desiredPaymentIntegrationType === PaymentIntegrationType.DirectPayment
          ? PaymentIntegrationType.IframeCheckout
          : PaymentIntegrationType.DirectPayment;
      return all.filter((o) => o.integrationType === fallbackType);
    }
    return preferred;
  }, [paymentOptions, desiredPaymentIntegrationType]);

  // Get the actual payment option ID from the filtered options
  const desiredPaymentId = filteredPaymentOptionsForUI[0]?.id;

  const selectedPaymentOptionForUI = filteredPaymentOptionsForUI[0] ?? null;

  // Set widget snippet only once per payment step to prevent double rendering
  useEffect(() => {
    if (step === STEP_PAYMENT) {
      if (paymentHtmlSnippet && !widgetSnippet) {
        setWidgetSnippet(paymentHtmlSnippet);
      }
    } else {
      // Reset when leaving payment step
      setWidgetSnippet('');
    }
  }, [step, paymentHtmlSnippet, widgetSnippet]);

  // Auto-select payment and shipping options when on payment step if none are selected
  useEffect(() => {
    // Auto-select payment option when entering payment step if none is selected
    if (
      step === STEP_PAYMENT &&
      paymentOptions.length > 0 &&
      paymentOptions.every((item) => item.selected === false)
    ) {
      // Try to get the desired payment ID, or fall back to the first available option
      const paymentIdToSelect =
        desiredPaymentId ||
        filteredPaymentOptionsForUI[0]?.id ||
        paymentOptions[0]?.id;
      if (paymentIdToSelect) {
        savePaymentOptions(paymentIdToSelect).finally(() => {
          getCart();
        });
      }
    }

    // Ensure shipping option is selected when on payment step
    if (
      step === STEP_PAYMENT &&
      shippingOptions.length > 0 &&
      selectedDeliveryOption &&
      !selectedDeliveryOption.selected
    ) {
      saveShippingOptions(selectedDeliveryOption.id).finally(() => {
        getCart();
      });
    }
  }, [
    step,
    paymentOptions,
    shippingOptions,
    selectedDeliveryOption,
    desiredPaymentId,
    filteredPaymentOptionsForUI,
    getCart,
  ]);

  type ShippingMsg = {
    type: 'litium-connect-shipping';
    event: 'optionChanging';
    data?: { value?: string; name?: string };
  };

  const listenMessageHandler = useCallback(
    (event: MessageEvent<ShippingMsg>) => {
      if (
        event.data?.type !== 'litium-connect-shipping' ||
        event.data?.event !== 'optionChanging'
      )
        return;

      const value = event.data.data?.value ?? '';
      const name = (event.data.data?.name ?? '').trim();

      setSelectedShipmentWidget(value);
      setSelectedShipmentName(name);
    },
    []
  );
  const decidePaymentIdForCurrentShipping = useCallback(() => {
    const integrationType = isPickupInStore(selectedShipmentName)
      ? PaymentIntegrationType.DirectPayment
      : PaymentIntegrationType.IframeCheckout;
    const option = paymentOptions.find(
      (o) => o.integrationType === integrationType
    );
    return option?.id;
  }, [selectedShipmentName, paymentOptions]);

  useEffect(() => {
    window.addEventListener('message', listenMessageHandler);
    return () => window.removeEventListener('message', listenMessageHandler);
  }, [listenMessageHandler]);

  const handlePaymentWidgetLoaded = useCallback(() => {
    setIsWidgetReady(true);
  }, []);

  const showBlocked = blockedRef.current || isBlockedForOrderB2b;
  if (showBlocked) {
    return <CheckoutBlockedB2B homePageUrl={homePageUrl} />;
  }

  if (prefillError) {
    return (
      <div data-testid="checkout-prefill-error" className="min-h-[200px]">
        <Heading2 className="mb-5 text-2xl">
          {t('checkoutwizard.b2b.prefill.error.title') ||
            'Unable to load checkout'}
        </Heading2>
        <p className="mb-5 text-base">{prefillError}</p>
        <Button
          type="link"
          url={homePageUrl || '/'}
          className="button rounded px-9"
          title={t('commons.backtohomepage') || 'Back to homepage'}
        />
      </div>
    );
  }

  switch (step) {
    case STEP_DELIVERY_ADDRESS: {
      const step1Content = !isAddressLoadComplete ? (
        <>
          {sessionErrors.length > 0 && (
            <ErrorText errors={sessionErrors} className="mb-5" />
          )}
          <Heading2 className="mb-5 text-2xl">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <LoadingFallback />
            <Text className="text-gray-500">
              {t('checkoutwizard.b2b.loading') || 'Loading...'}
            </Text>
          </div>
        </>
      ) : isAuthenticated === false ? (
        <>
          {sessionErrors.length > 0 && (
            <ErrorText errors={sessionErrors} className="mb-5" />
          )}
          <Heading2 className="mb-5 text-2xl">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          <Text className="mb-5">
            {t('checkoutwizard.b2b.login.required') ||
              'Please log in to continue with your B2B checkout.'}
          </Text>
          <Button
            type="link"
            url={`${homePageUrl || ''}/login?redirectUrl=${encodeURIComponent(
              typeof window !== 'undefined'
                ? window.location.pathname
                : checkoutPageUrl
            )}`}
            className="button rounded px-9"
            title={t('checkoutwizard.b2b.login.button') || 'Log in'}
          />
        </>
      ) : checkout.shippingAddress.address1 ? (
        <>
          {sessionErrors.length > 0 && (
            <ErrorText errors={sessionErrors} className="mb-5" />
          )}
          <Heading2 className="mb-5 text-2xl">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          {!referensFromProps && (
            <B2BReferenceFields
              orderReferens={orderReferens}
              erReferens={erReferens}
              onOrderReferensChange={setOrderReferens}
              onErReferensChange={setErReferens}
            />
          )}
          <AddressSummary
            value={shippingAddress}
            showEdit={false}
            className="mb-8"
          />
          {!referensFilled && (
            <Text className="text-red-600 mb-4 text-sm">
              {t('checkoutwizard.b2b.referens.required') ||
                'Fyll i Orderreferens och Er referens ovan för att fortsätta.'}
            </Text>
          )}
          <Button
            rounded
            className="w-full p-2"
            onClick={() => {
              previousAddressesRef.current = {
                shippingAddress,
                billingAddress,
                customerDetails: {
                  firstName: shippingAddress.firstName,
                  lastName: shippingAddress.lastName,
                  email: shippingAddress.email,
                  phone: shippingAddress.phoneNumber,
                  customerType: 'ORGANIZATION',
                },
              };
              shouldAdvanceStepRef.current = true;
              setSessionCreationTrigger((n) => n + 1);
            }}
            data-testid="checkout-wizard__address-continue"
            disabled={!referensFilled}
          >
            {t('checkoutwizard.deliveryoption.button.continue')}
          </Button>
        </>
      ) : (
        <>
          {sessionErrors.length > 0 && (
            <ErrorText errors={sessionErrors} className="mb-5" />
          )}
          <Heading2 className="mb-5 text-2xl">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          <Text className="mb-5 text-base">
            {t('checkoutwizard.b2b.no.address') ||
              'No organization address found. Please contact support.'}
          </Text>
        </>
      );

      return (
        <div data-testid="STEP_DELIVERY_ADDRESS" className="min-h-[200px]">
          {step1Content}
        </div>
      );
    }
    case STEP_DELIVERY_OPTION:
      return (
        <div data-testid="STEP_DELIVERY_OPTION">
          <Heading2 className="mb-5">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          {showAddress && (
            <div data-testid="checkout-wizard__delivery-address-summary">
              <AddressSummary
                value={shippingAddress}
                showEdit={false}
                className="mb-8"
              />
            </div>
          )}
          <Heading2 className="mb-5">
            {t('checkoutwizard.deliveryoption.title')}
          </Heading2>
          {!hasIntegrationType(
            shippingOptions,
            ShippingIntegrationType.DeliveryCheckout
          ) && (
            <div data-testid="checkout-wizard__delivery-option">
              <DeliveryOptions
                value={shippingOptions}
                selectedOption={selectedDeliveryOption}
                onChange={async (id: string) => {
                  withErrorCatch(async () => {
                    await saveShippingOptions(id);
                    await getCart();
                  }, setErrors);
                }}
                errors={errors}
              />
            </div>
          )}
          {shipmentHtmlSnippet && (
            <div data-testid="checkout-wizard__widget">
              <ShipmentWidget
                responseString={shipmentHtmlSnippet}
                rows={rows}
              />
            </div>
          )}
          <Button
            rounded
            className="w-full p-2"
            onClick={async () => {
              if (
                selectedDeliveryOption.integrationType ===
                ShippingIntegrationType.DeliveryCheckout
              ) {
                if (!selectedShipmentWidget) {
                  return;
                }
              }
              setIsUpdatingShipping(true);
              try {
                setStep(STEP_PAYMENT);
                if (
                  selectedDeliveryOption.integrationType ===
                  ShippingIntegrationType.DeliveryCheckout
                ) {
                  await saveShippingWidget(selectedShipmentWidget);
                }

                // Ensure shipping option is selected
                if (
                  !selectedDeliveryOption ||
                  !selectedDeliveryOption.selected
                ) {
                  await saveShippingOptions(selectedDeliveryOption.id);
                  await getCart();
                }
              } finally {
                setIsUpdatingShipping(false);
              }

              // set payment to match the shipping mode
              const all = checkout.paymentOptions ?? [];
              const currentPaymentId = all.find((p) => p.selected)?.id;
              // Always select payment option if none is selected, or if it doesn't match desired type
              if (
                desiredPaymentId &&
                (!currentPaymentId || currentPaymentId !== desiredPaymentId)
              ) {
                await savePaymentOptions(desiredPaymentId);
                await getCart();
              }
            }}
            data-testid="checkout-wizard__delivery-option-continue"
            disabled={
              isUpdatingShipping ||
              (selectedDeliveryOption.integrationType ===
                ShippingIntegrationType.DeliveryCheckout &&
                !selectedShipmentWidget)
            }
          >
            {t('checkoutwizard.deliveryoption.button.continue')}
          </Button>
        </div>
      );
    case STEP_PAYMENT:
      return (
        <div data-testid="STEP_PAYMENT">
          {showDelivery && (
            <div data-testid="checkout-wizard__delivery-summary">
              <DeliverySummary
                shippingAddress={checkout.shippingAddress}
                selectedDeliveryOption={{
                  ...selectedDeliveryOption,
                  price: totalShippingFees,
                  name: selectedDeliveryName,
                }}
                onEdit={() => {
                  if (
                    selectedDeliveryOption.integrationType ===
                    ShippingIntegrationType.DeliveryCheckout
                  ) {
                    // trigger reset shipping options
                    cartContext.setHasCartChanged(true);
                  } else {
                    setStep(STEP_DELIVERY_OPTION);
                  }
                }}
                showAddress={showAddress}
              />
            </div>
          )}
          {showAddress && (
            <Fragment>
              <Heading2>{t('checkoutwizard.payment.title')}</Heading2>
              <div className="mb-5">
                <Checkbox
                  id="checkoutWizardCheckbox"
                  checked={useSameAddress}
                  onChange={() => setUseSameAddress(!useSameAddress)}
                  data-testid="checkout-wizard__checkbox"
                >
                  <Text inline={true} className="text-sm">
                    {t('checkoutwizard.payment.billingaddress')}
                  </Text>
                </Checkbox>
              </div>
            </Fragment>
          )}
          {!useSameAddress && !hasAltAddress && (
            <div data-testid="checkout-wizard__billing-address-form">
              <AddressForm
                value={billingAddress}
                onSubmit={(address: OrderAddress) =>
                  saveBillingAddress(address).finally(() => {
                    setHasAltAddress(true);
                  })
                }
              />
            </div>
          )}
          {!useSameAddress && hasAltAddress && (
            <div data-testid="checkout-wizard__billing-address-summary">
              <AddressSummary
                value={billingAddress}
                onEdit={() => setHasAltAddress(false)}
                className="mb-8"
              />
            </div>
          )}
          {(useSameAddress || hasAltAddress) && (
            <Fragment>
              {showPaymentOptions && filteredPaymentOptionsForUI.length > 0 && (
                <div data-testid="checkout-wizard__payment-option">
                  <PaymentOptions
                    // Only the single allowed option is passed to the component
                    value={filteredPaymentOptionsForUI}
                    selectedOption={
                      selectedPaymentOptionForUI ??
                      filteredPaymentOptionsForUI[0]
                    }
                    onChange={async (id: string) => {
                      await savePaymentOptions(id);
                    }}
                    errors={errors}
                  />
                </div>
              )}

              {/* render Svea widget only if NOT pickup and selected is Svea (iframe) */}
              {!isPickup &&
                selectedPaymentOptionForUI?.integrationType ===
                  PaymentIntegrationType.IframeCheckout &&
                !!widgetSnippet && (
                  <div data-testid="checkout-wizard__widget">
                    <PaymentWidget
                      key={`pay-${selectedPaymentOptionForUI.id}`}
                      responseString={widgetSnippet}
                      rows={rows}
                    />
                  </div>
                )}

              {!paymentHtmlSnippet &&
                showSummary &&
                paymentOptions.length > 0 &&
                paymentOptions.some((option) => option.selected) && (
                  <div data-testid="checkout-wizard__total-summary">
                    <TotalSummary
                      errors={placeOrderErrors}
                      onClick={async () => {
                        withErrorCatch(async () => {
                          // Ensure payment option is selected before placing order
                          const allPaymentOptions =
                            checkout.paymentOptions ?? [];
                          const currentSelectedPayment = allPaymentOptions.find(
                            (p) => p.selected
                          );
                          if (!currentSelectedPayment) {
                            // Try to get the desired payment ID, or fall back to the first available option
                            const paymentIdToSelect =
                              desiredPaymentId ||
                              filteredPaymentOptionsForUI[0]?.id ||
                              allPaymentOptions[0]?.id;
                            if (paymentIdToSelect) {
                              await savePaymentOptions(paymentIdToSelect);
                              await getCart();
                            }
                          }
                          // Also ensure shipping option is selected
                          if (
                            selectedDeliveryOption &&
                            !selectedDeliveryOption.selected
                          ) {
                            await saveShippingOptions(
                              selectedDeliveryOption.id
                            );
                            await getCart();
                          }
                          await confirmOrder();
                          const timestamp = Date.now();
                          router.push(`${receiptPageUrl}?q=${timestamp}`);
                        }, setPlaceOrderErrors);
                      }}
                    />
                  </div>
                )}
            </Fragment>
          )}
        </div>
      );
    default:
      return <Fragment></Fragment>;
  }
}

const hasIntegrationType = (
  options: CheckoutOption[],
  integrationType: string
) => {
  return options.some((item) => item.integrationType === integrationType);
};

const getDisplayLogic = (
  paymentOptions: CheckoutOption[],
  shippingOptions: CheckoutOption[]
) => {
  if (!paymentOptions.length && !shippingOptions.length) {
    return {
      initialStep: 'Empty',
      showAddress: false,
      showDelivery: false,
      showPaymentOptions: false,
      showSummary: false,
    };
  }
  if (
    hasIntegrationType(paymentOptions, PaymentIntegrationType.IframeCheckout) &&
    hasIntegrationType(shippingOptions, ShippingIntegrationType.PaymentCheckout)
  ) {
    return {
      initialStep: STEP_PAYMENT,
      showAddress: false,
      showDelivery: false,
      showPaymentOptions: false,
      showSummary: false,
    };
  }
  if (
    hasIntegrationType(paymentOptions, PaymentIntegrationType.IframeCheckout) &&
    hasIntegrationType(shippingOptions, ShippingIntegrationType.Inline)
  ) {
    return {
      initialStep: STEP_DELIVERY_OPTION,
      showAddress: false,
      showDelivery: true,
      showPaymentOptions: true,
      showSummary: false,
    };
  }
  return {
    initialStep: STEP_DELIVERY_ADDRESS,
    showAddress: true,
    showDelivery: true,
    showPaymentOptions: true,
    showSummary: true,
  };
};

const getSelectedOption = (options: CheckoutOption[]): CheckoutOption => {
  return options.find((option) => option.selected) || options[0];
};

const filterPayment = (paymentOptions: CheckoutOption[]) => {
  // Allow both DirectPayment (betala i butik) and IframeCheckout(Svea) options
  return paymentOptions.filter(
    (item) =>
      item.integrationType === PaymentIntegrationType.IframeCheckout ||
      item.integrationType === PaymentIntegrationType.DirectPayment
  );
};

const DefaultCheckoutState = {
  shippingAddress: {
    address1: '',
    firstName: '',
    lastName: '',
    zipCode: '',
    city: '',
    country: '',
    organizationName: '',
    email: '',
    phoneNumber: '',
  },
  billingAddress: {
    address1: '',
    firstName: '',
    lastName: '',
    zipCode: '',
    city: '',
    country: '',
    organizationName: '',
    email: '',
    phoneNumber: '',
  },
  shippingOptions: [],
  paymentOptions: [],
  paymentHtmlSnippet: '',
  shipmentHtmlSnippet: '',
  checkoutFlowInfo: {
    receiptPageUrl: '',
    termUrl: '',
  },
};

// B2B Checkout Wizard
export default CheckoutWizard;
