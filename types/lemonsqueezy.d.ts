declare module 'lemonsqueezy-js' {
  interface CheckoutOptions {
    onSuccess?: (data: { orderId: string }) => void;
    onClose?: () => void;
  }

  interface LemonSqueezy {
    setup: (config: { clientKey: string }) => void;
    openCheckout: (options: {
      storeId: string;
      variantId: string;
      checkoutOptions?: CheckoutOptions;
    }) => void;
  }

  export const lemonsqueezy: LemonSqueezy;
} 