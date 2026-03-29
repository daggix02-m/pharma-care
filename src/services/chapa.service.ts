/**
 * Chapa Payment Service
 * API-ready payment simulation for Ethiopian payment methods
 * Toggle USE_MOCK_API to switch between simulation and real Chapa API
 */

const USE_MOCK_API = true;

const CHAPA_API_URL = "https://api.chapa.co/v1";

const SUPPORTED_PAYMENT_METHODS = [
  {
    id: "telebirr",
    name: "Telebirr",
    type: "mobile_money",
    icon: "📱",
    currency: "ETB",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "0912345678",
        required: true,
      },
    ],
  },
  {
    id: "cbe_birr",
    name: "CBE Birr",
    type: "mobile_money",
    icon: "🏦",
    currency: "ETB",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "0912345678",
        required: true,
      },
    ],
  },
  {
    id: "amole",
    name: "Amole",
    type: "mobile_money",
    icon: "💳",
    currency: "ETB",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "0912345678",
        required: true,
      },
    ],
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    type: "mobile_money",
    icon: "💰",
    currency: "ETB",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "0712345678",
        required: true,
      },
    ],
  },
  {
    id: "visa",
    name: "Visa",
    type: "card",
    icon: "💳",
    currency: "ETB",
    fields: [
      {
        name: "card_number",
        label: "Card Number",
        type: "text",
        placeholder: "4111 1111 1111 1111",
        required: true,
      },
      {
        name: "expiry",
        label: "Expiry Date",
        type: "text",
        placeholder: "MM/YY",
        required: true,
      },
      {
        name: "cvv",
        label: "CVV",
        type: "text",
        placeholder: "123",
        required: true,
      },
      {
        name: "cardholder_name",
        label: "Cardholder Name",
        type: "text",
        placeholder: "John Doe",
        required: true,
      },
    ],
  },
  {
    id: "mastercard",
    name: "Mastercard",
    type: "card",
    icon: "💳",
    currency: "ETB",
    fields: [
      {
        name: "card_number",
        label: "Card Number",
        type: "text",
        placeholder: "5500 0000 0000 0004",
        required: true,
      },
      {
        name: "expiry",
        label: "Expiry Date",
        type: "text",
        placeholder: "MM/YY",
        required: true,
      },
      {
        name: "cvv",
        label: "CVV",
        type: "text",
        placeholder: "123",
        required: true,
      },
      {
        name: "cardholder_name",
        label: "Cardholder Name",
        type: "text",
        placeholder: "John Doe",
        required: true,
      },
    ],
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    type: "bank",
    icon: "🏛️",
    currency: "ETB",
    fields: [
      {
        name: "bank_name",
        label: "Bank Name",
        type: "select",
        options: [
          "CBE",
          "Awash",
          "Dashen",
          "Bank of Abyssinia",
          "Wegagen",
          "Nib",
          "Coop",
          "Oromia",
          "Buna",
          "Enat",
        ],
        required: true,
      },
      {
        name: "account_number",
        label: "Account Number",
        type: "text",
        placeholder: "1000123456789",
        required: true,
      },
      {
        name: "transaction_id",
        label: "Transaction Reference",
        type: "text",
        placeholder: "TXN-XXXXXXXX",
        required: true,
      },
    ],
  },
];

function generateTransactionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CHPA-${timestamp}-${random}`;
}

function generateReferenceNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `REF-${timestamp}-${random}`;
}

async function mockPaymentProcess(
  amount: number,
  paymentMethod: string,
  paymentDetails: Record<string, string>,
) {
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 1000),
  );

  const method = SUPPORTED_PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  if (!method) {
    throw new Error("Invalid payment method");
  }

  const methodConfig = SUPPORTED_PAYMENT_METHODS.find(
    (m) => m.id === paymentMethod,
  );

  if (!methodConfig) {
    throw new Error("Invalid payment method");
  }

  for (const field of methodConfig.fields) {
    if (field.required && !paymentDetails[field.name]) {
      throw new Error(`${field.label} is required`);
    }

    if (paymentDetails[field.name]) {
      switch (field.name) {
        case "phone":
          if (!/^(09|07)\d{8}$/.test(paymentDetails.phone)) {
            throw new Error("Invalid phone number format");
          }
          break;
        case "card_number":
          const cleanCard = paymentDetails.card_number.replace(/\s/g, "");
          if (!/^\d{16}$/.test(cleanCard)) {
            throw new Error("Invalid card number");
          }
          break;
        case "expiry":
          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiry)) {
            throw new Error("Invalid expiry date (MM/YY)");
          }
          break;
        case "cvv":
          if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
            throw new Error("Invalid CVV");
          }
          break;
        case "account_number":
          if (!/^\d{10,14}$/.test(paymentDetails.account_number)) {
            throw new Error("Invalid account number");
          }
          break;
      }
    }
  }

  const transactionId = generateTransactionId();
  const referenceNumber = generateReferenceNumber();

  return {
    success: true,
    transactionId,
    referenceNumber,
    amount,
    currency: "ETB",
    paymentMethod: method.name,
    paymentType: method.type,
    status: "success",
    timestamp: Date.now(),
    paymentDetails,
  };
}

async function realChapaApiCall(
  endpoint: string,
  method: string,
  data: Record<string, unknown> = {},
) {
  try {
    const secretKey = import.meta.env.VITE_CHAPA_SECRET_KEY;
    const response = await fetch(`${CHAPA_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(secretKey ? { Authorization: `Bearer ${secretKey}` } : {}),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Chapa API Error:", error);
    throw error;
  }
}

export const chapaService = {
  getSupportedPaymentMethods() {
    return SUPPORTED_PAYMENT_METHODS;
  },

  getPaymentMethodById(id: string) {
    return SUPPORTED_PAYMENT_METHODS.find((m) => m.id === id);
  },

  validatePaymentDetails(
    paymentMethodId: string,
    details: Record<string, string>,
  ) {
    const method = this.getPaymentMethodById(paymentMethodId);

    if (!method) {
      return { valid: false, error: "Invalid payment method" };
    }

    for (const field of method.fields) {
      if (field.required && !details[field.name]) {
        return { valid: false, error: `${field.label} is required` };
      }

      if (details[field.name]) {
        switch (field.name) {
          case "phone":
            if (!/^(09|07)\d{8}$/.test(details.phone)) {
              return { valid: false, error: "Invalid phone number format" };
            }
            break;
          case "card_number":
            const cleanCard = details.card_number.replace(/\s/g, "");
            if (!/^\d{16}$/.test(cleanCard)) {
              return { valid: false, error: "Invalid card number" };
            }
            break;
          case "expiry":
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) {
              return { valid: false, error: "Invalid expiry date (MM/YY)" };
            }
            break;
          case "cvv":
            if (!/^\d{3,4}$/.test(details.cvv)) {
              return { valid: false, error: "Invalid CVV" };
            }
            break;
          case "account_number":
            if (!/^\d{10,14}$/.test(details.account_number)) {
              return { valid: false, error: "Invalid account number" };
            }
            break;
        }
      }
    }

    return { valid: true };
  },

  async initializePayment({
    amount,
    email,
    firstName,
    lastName,
    paymentMethod,
    paymentDetails,
  }: {
    amount: number;
    email: string;
    firstName: string;
    lastName: string;
    paymentMethod: string;
    paymentDetails: Record<string, string>;
  }) {
    if (USE_MOCK_API) {
      return await mockPaymentProcess(amount, paymentMethod, paymentDetails);
    }

    const txRef = generateTransactionId();

    const chapaData = {
      amount: amount.toString(),
      currency: "ETB",
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${window.location.origin}/payment/verify`,
      return_url: `${window.location.origin}/payment/success`,
      customization: {
        title: "PharmaCare Payment",
        description: "Medicine purchase payment",
      },
      meta: {
        payment_method: paymentMethod,
        ...paymentDetails,
      },
    };

    const response = await realChapaApiCall(
      "/transaction/initialize",
      "POST",
      chapaData,
    );
    return response;
  },

  async verifyPayment(transactionId: string) {
    if (USE_MOCK_API) {
      return {
        success: true,
        status: "success",
        transactionId,
        verifiedAt: Date.now(),
      };
    }

    const response = await realChapaApiCall(
      `/transaction/verify/${transactionId}`,
      "GET",
    );
    return response;
  },

  async checkPaymentStatus(transactionId: string) {
    if (USE_MOCK_API) {
      return {
        status: "success",
        transactionId,
        message: "Payment completed successfully",
      };
    }

    const response = await realChapaApiCall(
      `/transaction/${transactionId}`,
      "GET",
    );
    return response;
  },

  async processPayment({
    amount,
    paymentMethod,
    paymentDetails,
    customerInfo = {},
  }: {
    amount: number;
    paymentMethod: string;
    paymentDetails: Record<string, string>;
    customerInfo?: { email?: string; firstName?: string; lastName?: string };
  }) {
    const validation = this.validatePaymentDetails(
      paymentMethod,
      paymentDetails,
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return await this.initializePayment({
      amount,
      email: customerInfo.email || "customer@pharmacare.com",
      firstName: customerInfo.firstName || "Customer",
      lastName: customerInfo.lastName || "",
      paymentMethod,
      paymentDetails,
    });
  },

  formatAmount(amount: number) {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  },
};

export default chapaService;
