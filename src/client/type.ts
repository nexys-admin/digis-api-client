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

export enum Lang {
  en = 1,
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
  company?: Pick<Company, "uuid" | "name">;
}

interface InvoiceBase {
  uuid: string;
  currency: Currency;
  sender: string;
  key: string;
  statusId: InvoiceStatus;
  refNumberInt: number;
  langId: Lang;
  additionalInformation?: string;
  date: string;
  dateDue: string;
  logDateAdded: string;
  vat?: number;
  instance: { uuid: string };
  address: Address;
  project?: { id: number };
  id: string;
}

// this pattern is used in different interfaces
export interface Discount {
  discount: number;
  discountAbs: number;
}

export interface Invoice extends InvoiceBase, Partial<Discount> {
  items: InvoiceItem[];
  totalWVat: number;
  total: number;
  subtotal: number;
  refNumber: string;
  vatIncluded?: boolean;
  paymentUrl?: string;
  paymentProfile?: Pick<PaymentProfile, "id">;
  productAccount?: Pick<AccountingAccount, "id">;
}

export interface InvoiceListUnit extends InvoiceBase, Partial<Discount> {
  vatIncluded: null | boolean;
  paymentUrl: string | null;
  instance: {
    uuid: string;
  };
  address: Address;
  project: null | any; // You can replace `any` with a more specific type if you have one
  paymentProfile: {
    id: number;
    type: number;
    iban: string;
    bankingReferenceNumber: string | null;
    account: AccountingAccount;
  };
}

///

export interface InvoiceItem extends Partial<Discount> {
  id: number;
  name: string;
  description?: string;
  amount: number;
  price: number;
  currency: Currency;
  fxRate: number;
  logDateAdded: string;
  project?: { uuid: string };
}

export interface InvoiceItemInsert extends Partial<Discount> {
  label: string;
  quantity: number;
  rate: number;
  invoice?: { uuid: string };
  project?: {
    uuid: string;
  };
}

export interface InvoiceImportChecks {
  checkVat: boolean;
  checkTotal: boolean;
  checkVatDue: boolean;
  checkAll: boolean;
}

export interface InvoiceImport {
  client: {
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
  refNumberInt: number;
  type: string;
  dateIssued: string | null;
  datePaid: string | null;
  total: number;
  totalWVat: number;
  totalNoVat: number;
  vat: number;
  checks: InvoiceImportChecks;
}

export interface InvoiceWAmount extends InvoiceBase {
  //
  items: { sum: number; n: number };
  accountingEntries: AccountingEntry[];
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

export interface PaymentProfile {
  id: number;
  type: PaymentProfileType;
  iban: string;
  account: { id: number };
  company: { uuid: string };
  bankingReferenceNumber?: string;
}

export enum PaymentProfileType {
  Iban = 1,
  QrBill = 2,
}
