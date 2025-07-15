interface Cashfree {
    new(config: { mode: string }): {
        checkout: (options: {
            paymentSessionId: string;
            redirect: boolean;
            returnUrl: string;
        }) => Promise<void>;
    };
}

interface Window {
    Cashfree: Cashfree | undefined;
}