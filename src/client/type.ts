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
