export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'corriente' | 'ahorros';
  ownerName: string;
  ownerId: string; // Cédula o RNC
  bankLogo?: string;
}

export interface StoreSettings {
  general: {
    storeName: string;
    slogan: string;
    contactEmail: string;
    supportPhone: string;
    logoLight?: string;
    logoDark?: string;
    bankAccounts: BankAccount[];
  };
  inventory: {
    autoDisableNoStock: boolean;
    hideOutOfStock: boolean;
  };
  payments: {
    azulActive: boolean;
    cardnetActive: boolean;
    paypalActive: boolean;
    transferActive: boolean;
  };
  shipping: {
    zones: Array<{
      id: string;
      name: string;
      time: string;
      cost: number;
      freeFrom: number;
    }>;
  };
  notifications: {
    orderEmails: boolean;
    stockAlerts: boolean;
    newCustomers: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiration: number;
    failedAttemptsLimit: number;
  };
  email: {
    provider: 'smtp' | 'mailgun' | 'ses';
    fromName: string;
    fromEmail: string;
    smtpHost?: string;
    smtpPort?: number;
    marketingNewsletter: boolean;
  };
}
