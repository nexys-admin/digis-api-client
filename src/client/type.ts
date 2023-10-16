export enum Currency {
  CHF = 1,
  USD = 2,
  EUR = 3,
  GBP = 4,
  USDT = 5,
  SOL = 6,
  USDC = 7,
}

export enum DebitCredit {
  debit = 1,
  credit = -1,
}

export enum Country {
  Switzerland = 1,
}

export enum InvoiceStatus {
  pending = 1,
  sent = 2,
  paid = 3,
  denied = 4,
}

export interface Address {
  id: number;
  street: string;
  city: string;
  zip: string;
  country: { id: Country };
}

export interface InvoiceListUnit {
  uuid: string;
  currency: number;
  sender: string;
  key: string;
  statusId: InvoiceStatus;
  refNumberInt: number;
  langId: number;
  additionalInformation: string;
  date: string;
  dateDue: string | null;
  logDateAdded: string;
  vat: number;
  vatIncluded: null | boolean;
  discount: null | number;
  discountAbs: null | number;
  paymentUrl: string | null;
  instance: {
    uuid: string;
  };
  address: {
    id: number;
    street: string;
    zip: string;
    city: string;
    company: {
      uuid: string;
      name: string;
    };
  };
  project: null | any; // You can replace `any` with a more specific type if you have one
  paymentProfile: {
    id: number;
    type: number;
    iban: string;
    bankingReferenceNumber: string | null;
    account: AccountingAccount;
  };
}

export interface InvoiceItem {
  label: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  items: InvoiceItem[];
}

// accounting
export interface AccountingAccount {
  id: number;
  number: number;
  name: string;
}

export interface AccountingEntryMeta {
  account: { id: number };
  company?: { uuid: string };
  invoice?: { uuid: string };
  payable?: { uuid: string };
  transactionGroup?: { uuid: string };
  externalReference?: string;
}

export interface AccountingEntryAccount extends AccountingEntryMeta {
  direction: 1 | -1;
  amount: number;
  originalAmount?: number;
}

export interface AccountingEntry {
  description: string;
  dateLedger: string;
  group?: { id: number };
  number?: number;
  entryAccounts: AccountingEntryAccount[];
}

export interface AccountingEntryGroup {
  id: number;
  description?: string;
}

export interface AccountingBalanceProps {
  endDate: string;
  startDate?: string;
  accountIds?: number[];
  onlyNonZero?: boolean;
  onlyWithAtLeastOneTx?: boolean;
  excludeTransactionIds?: number[];
  excludeGroupIds?: number[];
}

export interface EntryAccountProps {
  transactionGroup?: { id: number };
  account?: { id: number };
  entry?: { id: number };
  payable?: { uuid: string };
  invoice?: { uuid: string };
}

export interface EntryInput {
  number: number;
  dateLedger: string;
  description?: string;
  entryAccounts: {
    account: { id: number };
    amount: number;
    direction: number;
  }[];
}

export interface AccountingEntryAccountMeta {
  invoice: { uuid: string; refNumberInt: number };
  payable: { uuid: string };
  transactionGroup: { id: number };
  company: { uuid: string; name: string };
}

export interface AccountingEntryAccount2å
  extends Partial<AccountingEntryAccountMeta> {
  account: AccountingAccount;
  id: number;
  amount: number;
  currency: Currency;
  direction: DebitCredit;
  exchangeRate: 1;
  externalReference: null;
}

export interface Entry {
  id: number;
  number: number;
  dateLedger: string;
  description?: string;
  AccountingEntryAccount: AccountingEntryAccount[];
}

export interface AccountingBalanceOut {
  account_id: number;
  account_number: number;
  account_name: string;
  account_currency_id: number;
  sum_base: number;
  sum_base_trade: number;
  sum_native: number;
  sum_native_net: number;
  sum_native_trade: number;
  count_ea: number;
  count_e: number;
  date_snapshot: string;
}

export interface Transaction {
  uuid: string;
  bank: AccountingAccount;
  companyFinance: { account: AccountingAccount; iban: string; bic?: string };
  company: { uuid: string; name: string };
  date: string;
  amount: string;
}

export enum TransactionGroupStatus {
  pending = 1,
  paid = 2,
  denied = 3,
}

export interface TransactionGroupListUnit {
  total: number;
  n: number;
  id: number;
  status: TransactionGroupStatus;
  logDateAdded: string;
  instance: {
    uuid: string;
  };
}

export interface TransactionGroup {
  id: number;
  logDateAdded: string;
  status: TransactionGroupStatus;
  Payable: Transaction[];
}

export interface Payable {
  uuid: string;
  amount: string;
  currency: number;
  date: string;
  company?: {
    uuid: string;
    name: string;
  };
  referenceNumber?: string;
  transactionGroup?: { id: number };
  bank?: { id: number; name: string; number: number };
  companyFinance?: {
    account: { id: number; name: string; number: number };
    iban?: string;
    bic?: string;
  };
}

export interface Company {
  uuid: string;
  name: string;
}

/*export interface Address {
  id: string;
  street: string;
  city: string;
  zip: string;
  country: { name: string };
}*/

export interface PaymentProfile {
  company: { uuid: string };
  account: { id: number };
  iban: string;
  type: PaymentProfileType;
}

export enum PaymentProfileType {
  Iban = 1,
  QrBill = 2,
}
