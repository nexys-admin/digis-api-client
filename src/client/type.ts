export enum Currency {
  CHF = 1,
  EUR = 2,
  USD = 3,
  GBP = 4,
  USDT = 5,
  USDC = 6,
  ETH = 7,
  BTC = 8,
  SOL = 9,
  EURT = 10,
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  instance: { uuid: string; name: string };
}

export interface ProfileInstance {
  uuid: string;
  email: string;
  instance: { uuid: string; name: string };
  UserAuthentication: {}[];
}

export interface ProfileMailSync {
  uuid: string;
  email: string;
  user: { uuid: string; instance: { uuid: string; name: string } };
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

export interface Instance {
  uuid: string;
  name: string;
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

export interface InvoiceUpdate extends Partial<Discount> {
  date?: string;
  dateDue?: string;
  additionalInformation?: string;
  sender?: string;
  currency?: number;
  vat?: number;
  vatIncluded?: boolean;
  paymentProfile?: { id: number };
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

export enum AccountFunctionType {
  bankAccount = 1,
  vat = 2,
  salesRevenue = 3,
  payable = 4,
  receivable = 5,
}

export enum AccountType {
  assets = 1,
  liability = 2,
  expenses = 3,
  revenue = 4,
  equity = 5,
}

export interface AccountingAccountListUnit {
  id: number;
  type: AccountType;
  number: number;
  name: string;
  currency: Currency;
  functionType?: AccountFunctionType;
}

// simpler version of account
export type AccountingAccount = Pick<
  AccountingAccountListUnit,
  "id" | "name" | "number"
>;

export interface AccountingEntryMeta {
  account: { id: number; number: number; name: string };
  company?: { uuid: string };
  invoice?: { uuid: string };
  payable?: { uuid: string };
  transactionGroup?: { id: number };
  externalReference?: string;
}

export interface AccountingEntryAccount extends AccountingEntryMeta {
  direction: 1 | -1;
  amount: number;
  originalAmount?: number;
}

export interface AccountingEntryAccountListUnit
  extends Partial<AccountingEntryMeta> {
  id: number;
  amount: number;
  currency: Currency;
  direction: 1 | -1;
  exchangeRate?: number;
  instance: { uuid: string };
  entry: Pick<AccountingEntry, "id" | "dateLedger" | "description">;
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

export interface AccountingEntryAccount2
  extends Partial<AccountingEntryAccountMeta> {
  account: AccountingAccount;
  id: number;
  amount: number;
  currency: Currency;
  direction: DebitCredit;
  exchangeRate?: number;
  externalReference: null;
}

export interface Entry {
  id: number;
  description: string;
  dateLedger: string;
  dateAdded: string;
  group?: { id: number };
  locked?: { id: number };
  AccountingEntryAccount: AccountingEntryAccount[];
}

export interface AccountingEntry {
  id: number;
  description: string;
  dateLedger: string;
  group?: { id: number };
  number?: number;
  entryAccounts: AccountingEntryAccount[];
}

export interface AccountingBalanceOut {
  account_id: number;
  account_type: AccountType;
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
  vat?: number;
  isExpense?: boolean;
  isCreditCard?: boolean;
}

export interface Company {
  uuid: string;
  name: string;
}

export interface PaymentProfile {
  id: number;
  type: PaymentProfileType;
  iban: string;
  bic?: string;
  account: { id: number };
  company: { uuid: string };
  bankingReferenceNumber?: string;
}

export enum PaymentProfileType {
  Expense = 0,
  Iban = 1,
  QrBill = 2,
  Ethereum = 3,
  Solana = 4,
  Arbitrum = 5,
  Polygon = 6,
  Goerli = 7,
  Sepolia = 8,
  Stripe = 10,
  Revolut = 11,
}

export interface File {
  uuid: string;
  name: string;
  contentType?: string;
  size?: number;

  isDefault: boolean;
  key: string;

  typeId: 1;

  company?: { uuid: string };
  payable: { uuid: string };
  mail: { uuid: string };
  invoice?: { uuid: string };

  logDateAdded: string;
  logUser: { uuid: string };
}

export enum AdditionalPropertyType {
  Text = 1,
  Email = 2,
  Phone = 3,
  Link = 4,
  Date = 5,
  Barcode = 6,
  ReferenceNumber = 7,
  Amount = 8,
  InternalLink = 9,
}

export interface AdditionalProperty {
  id: number;
  key: string;
  keyTypeId: AdditionalPropertyType;
  label: string;
}
