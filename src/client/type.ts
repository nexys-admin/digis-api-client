export enum Country {
  Switzerland = 1,
}

export enum InvoiceStatus {
  pending = 1,
  sent = 2,
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
  startDate: string;
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
