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
  //... more status
}

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: { id: Country };
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
  number: number;
  id: number;
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
  account: { id: number; name: string; number: number };
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
  cum_amount: number;
  count_ea: number;
  count_e: number;
  date_snapshot: string;
}
