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
export interface AccountingEntryMeta {
  account: { id: number };
  company?: { uuid: string };
  invoice?: { uuid: string };
  payable?: { uuid: string };
  transactionGroup?: { uuid: string };
  externalReference?: string;
}

export interface AccountingEntryAccount extends AccountingEntryMeta {
  direction: number; // 1 | -1
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
