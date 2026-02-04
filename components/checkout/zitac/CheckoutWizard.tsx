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
  useState,
} from 'react';

import Link from 'components/Link';
import { get } from 'services/cartService.client';
import {
  createCheckoutSession,
  placeOrder,
  updateAddresses,
  updateBillingAddress,
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
import TotalSummary from '../zitac/TotalSummary';
import AddressForm from './AddressForm';
import DeliverySummary from './DeliverySummary';

const STEP_DELIVERY_ADDRESS = 0;
const STEP_DELIVERY_OPTION = 1;
const STEP_PAYMENT = 2;

// Query to get B2C person and addresses for checkout prefill
const GET_B2C_CHECKOUT_USER = gql`
  query GetB2CCheckoutUser {
    me {
      person {
        id
        ... on B2CPersonTemplatePerson {
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
 * Renders checkout steps in sequence.
 */
function CheckoutWizard(props: { state?: Checkout }) {
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

  const [checkout, setCheckout] = useState<Checkout>(
    props.state ?? DefaultCheckoutState
  );
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

  //orginal payment options from checkout
  // const [paymentOptions, setPaymentOptions] = useState<CheckoutOption[]>(
  //   filterPayment(checkout.paymentOptions)
  // );
  // useEffect(() => {
  //   setPaymentOptions(filterPayment(checkout.paymentOptions));
  // }, [checkout.paymentOptions]);

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
      const result = await updateAddresses({
        shippingAddress,
        billingAddress,
        customerDetails,
      });
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
  const [step, setStep] = useState(initialStep || 0);
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
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

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
    const checkoutState = await createCheckoutSession(
      {
        checkoutPageUrl: `${host}${checkoutPageUrl}`,
        cancelPageUrl: `${host}${checkoutPageUrl}`,
        receiptPageUrl: `${host}${receiptPageUrl}`,
        termUrl: `${host}${termsAndConditionsUrl}`,
        allowSeparateShippingAddress: true,
        disablePaymentShippingOptions: false,
      },
      {
        orderConfirmedUrl: orderConfirmedUrlWithQuery,
      }
    );
    setCheckout(checkoutState);
    return checkoutState;
  }, [
    checkoutPageUrl,
    receiptPageUrl,
    pathname,
    termsAndConditionsUrl,
    homePageUrl,
  ]);

  // create new checkout session onload or when cart content is changed
  // so payment widget got the latest data.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        let checkoutState: Checkout;
        try {
          checkoutState = await createSession();
        } catch (sessionError) {
          throw sessionError;
        }
        if (cancelled) return;

        const result = await queryClient({ query: GET_B2C_CHECKOUT_USER });
        if (cancelled) return;

        const me = (result as any)?.me;
        const person = me?.person;

        if (!person) {
          return;
        }

        const current =
          checkoutState.shippingAddress ?? DefaultCheckoutState.shippingAddress;
        const fields = person.fields ?? {};
        const addresses = person.addresses ?? [];
        const firstAddress =
          Array.isArray(addresses) && addresses.length > 0
            ? addresses[0]
            : null;

        // Prefer non-empty values from person/address, otherwise keep current session value
        const addr: OrderAddress = {
          firstName:
            (fields._firstName ?? '').trim() || current.firstName || '',
          lastName: (fields._lastName ?? '').trim() || current.lastName || '',
          email: (fields._email ?? '').trim() || current.email || '',
          phoneNumber:
            (firstAddress?.phoneNumber ?? '').trim() ||
            current.phoneNumber ||
            '',
          organizationName: current.organizationName || '',
          address1:
            (firstAddress?.address1 ?? '').trim() || current.address1 || '',
          zipCode:
            (firstAddress?.zipCode ?? '').trim() || current.zipCode || '',
          city: (firstAddress?.city ?? '').trim() || current.city || '',
          country:
            (firstAddress?.country ?? '').trim() || current.country || '',
        };

        const customerDetails: OrderCustomerDetails = {
          firstName: addr.firstName,
          lastName: addr.lastName,
          email: addr.email,
          phone: addr.phoneNumber,
          customerType: 'PERSON',
        };

        await saveAddresses({
          shippingAddress: addr,
          billingAddress: addr,
          customerDetails,
        });
      } catch (error: any) {
        const isAuthError = error?.graphQLErrors?.some(
          (e: any) =>
            e.extensions?.code === 'AUTH_NOT_AUTHORIZED' ||
            e.message?.includes('not authorized')
        );
        if (!isAuthError) {
          // eslint-disable-next-line no-console
          console.error('B2C checkout: failed to prefill address', error);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [rows, createSession, saveAddresses]);

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
    // if (
    //   paymentOptions.length &&
    //   paymentOptions.every((item) => item.selected === false) &&
    //   step === STEP_PAYMENT
    // ) {
    //   savePaymentOptions(paymentOptions[0].id).finally(getCart);
    // }

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

  /* NSHIFT Listen message from shipment widget */
  /*
    const PAYMENT_ID_IN_STORE =
    'UGF5bWVudE9wdGlvbgpkT3B0aW9uSWQ9ZGlyZWN0cGF5bWVudCUzQURpcmVjdFBheQ=='; // "Betala i butik" (DIRECT_PAYMENT)
  const PAYMENT_ID_SVEA =
    'UGF5bWVudE9wdGlvbgpkT3B0aW9uSWQ9c3ZlYXBheW1lbnQlM0FTRSUyMENoZWNrb3V0'; // "Svea payment" (IFRAME_CHECKOUT)
    */

  const isPickupInStore = (s?: string) => {
    const lower = (s ?? '').toLocaleLowerCase('sv-SE').trim();
    return lower.includes('hämta i butik') || lower.includes('hamta i butik');
  };

  const isPickup = isPickupInStore(selectedShipmentName);

  // Find payment option by integrationType instead of hardcoded IDs

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

  //debug output of payment options
  useEffect(() => {
    window.__dumpPayments = () => {
      console.table(
        (checkout.paymentOptions ?? []).map((o) => ({
          id: o.id,
          name: o.name,
          integrationType: o.integrationType,
          selected: o.selected,
        }))
      );
    };
    return () => {
      try {
        delete (window as any).__dumpPayments;
      } catch {}
    };
  }, [checkout.paymentOptions]);
  // end debug output

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

      //console.log(`[Shipping] message received, target name="${name}"`);
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

  switch (step) {
    case STEP_DELIVERY_ADDRESS:
      return (
        <div data-testid="STEP_DELIVERY_ADDRESS">
          {sessionErrors.length > 0 && (
            <ErrorText errors={sessionErrors} className="mb-5" />
          )}
          <Heading2 className="mb-5 text-2xl">
            {t('checkoutwizard.deliveryaddress.title')}
          </Heading2>
          <AddressForm
            value={shippingAddress}
            onSubmit={async (address: OrderAddress) => {
              const customerDetails: OrderCustomerDetails = {
                firstName: address.firstName,
                lastName: address.lastName,
                email: address.email,
                phone: address.phoneNumber,
                customerType: 'PERSON',
              };
              await saveAddresses({
                shippingAddress: address,
                billingAddress: address,
                customerDetails,
              });
              setStep(STEP_DELIVERY_OPTION);
            }}
          />
        </div>
      );
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
                onEdit={() => setStep(STEP_DELIVERY_ADDRESS)}
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
          <div className="mb-5 flex justify-center">
            <Checkbox
              id="order-confirmation-checkbox-delivery-step"
              checked={policiesAccepted}
              onChange={(e) => setPoliciesAccepted(e.target.checked)}
              data-testid="checkout-wizard__policy-confirmation-checkbox"
            >
              <Text inline={true} className="whitespace-normal text-sm">
                {t('totalsummary.checkbox.confirm')}{' '}
                <Link href="/kopvillkor" className="underline">
                  {t('totalsummary.checkbox.termsLink')}
                </Link>{' '}
                {t('totalsummary.checkbox.and')}{' '}
                <Link href="/privacy" className="underline">
                  {t('totalsummary.checkbox.privacyLink')}
                </Link>
              </Text>
            </Checkbox>
          </div>
          <Button
            rounded
            className="w-full border border-secondary-2 p-2"
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
              !policiesAccepted ||
              isUpdatingShipping ||
              (selectedDeliveryOption.integrationType ===
                ShippingIntegrationType.DeliveryCheckout &&
                !selectedShipmentWidget)
            }
          >
            {t('checkoutwizard.deliveryoption.button.continue')}
          </Button>
          {/* <Button
            rounded={true}
            className="w-full p-2"
            onClick={() => {
              if (
                selectedDeliveryOption.integrationType ===
                ShippingIntegrationType.DeliveryCheckout
              ) {
                saveShippingWidget(selectedShipmentWidget).finally(getCart);
              }
              setStep(STEP_PAYMENT);
            }}
            data-testid="checkout-wizard__delivery-option-continue"
            disabled={
              selectedDeliveryOption.integrationType ===
                ShippingIntegrationType.DeliveryCheckout &&
              !selectedShipmentWidget
            }
          >
            {t('checkoutwizard.deliveryoption.button.continue')}
          </Button> */}
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
              {/* {showPaymentOptions && (
                <div data-testid="checkout-wizard__payment-option">
                  <PaymentOptions
                    value={paymentOptions}
                    selectedOption={selectedPaymentOption}
                    onChange={async (id: string) => {
                      withErrorCatch(async () => {
                        await savePaymentOptions(id);
                        getCart();
                      }, setErrors);
                    }}
                    errors={!showSummary ? errors : []}
                  />
                </div>
              )} */}
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
              {/* {paymentHtmlSnippet && (
                <div data-testid="checkout-wizard__widget">
                  <PaymentWidget
                    responseString={paymentHtmlSnippet}
                    rows={rows}
                   onLoad={handlePaymentWidgetLoaded}
                  />
                  {isWidgetReady &&
                    placeOrderErrors &&
                    placeOrderErrors.length > 0 && (
                      <ErrorText
                        errors={placeOrderErrors}
                        className="mt-3 text-left"
                      />
                    )}
                      </div>
              )} */}

              {!paymentHtmlSnippet &&
                showSummary &&
                paymentOptions.length > 0 &&
                paymentOptions.some((option) => option.selected) && (
                  <div data-testid="checkout-wizard__total-summary">
                    <TotalSummary
                      errors={placeOrderErrors}
                      policiesAccepted={policiesAccepted}
                      showPolicyCheckbox={false}
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
  /*
    if (
    hasIntegrationType(paymentOptions, PaymentIntegrationType.IframeCheckout)
  ) {
    return [
      paymentOptions.filter(
        (item) => item.integrationType === PaymentIntegrationType.IframeCheckout
      )[0],
    ];
  }
  return paymentOptions;
  */
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

export default CheckoutWizard;
