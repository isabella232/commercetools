// https://docs.commercetools.com/api/projects/payments#payment
export type CTPayment = {
  id: string;
  version: number;
  key?: string;
  amountPlanned: CTMoney;
  paymentMethodInfo?: {
    paymentInterface?: string;
    method?: string;
  };
  paymentStatus: {
    interfaceCode?: string;
    interfaceText?: string;
    state?: Object;
  };
  transactions?: CTTransaction[];
  custom?: {
    fields: {
      mollieOrderStatus?: string;
      createOrderRequest?: string;
      createOrderResponse?: string;
    };
  };
};

export type CTTransaction = {
  id: string;
  amount: CTMoney;
  interactionId?: string;
  timestamp?: string;
  state: CTTransactionState;
};

export type CTTransactionDraft = {
  type: CTTransactionType;
  amount: CTMoney;
  timestamp?: string;
  interactionId?: string;
  state?: CTTransactionState;
};

export type CTMoney = {
  centAmount: number;
  currencyCode: string;
};

// https://docs.commercetools.com/api/projects/payments#transactionstate
export enum CTTransactionState {
  Initial = 'Initial',
  Pending = 'Pending',
  Success = 'Success',
  Failure = 'Failure',
}

// https://docs.commercetools.com/api/projects/payments#transactiontype
export enum CTTransactionType {
  Authorization = 'Authorization',
  CancelAuthorization = 'CancelAuthorization',
  Charge = 'Charge',
  Refund = 'Refund',
  Chargeback = 'Chargeback',
}
