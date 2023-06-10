// API doc: https://nexys.stoplight.io/docs/digis-accounting-doc/

import { JsonRequestProps, jsonRequestGeneric } from "./utils";

export enum Country {
  Switzerland = 1,
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

class Client {
  jsonRequest: <A, B>(props: JsonRequestProps<B>) => Promise<A>;

  constructor(
    token: string,
    url: string = "https://app.digis.ch/api" // "http://localhost:3001";
  ) {
    const headers = {
      authorization: "bearer " + token,
      "content-type": "application/json",
    };

    this.jsonRequest = jsonRequestGeneric(url, headers);
  }

  viewAPIVersion = async () => this.jsonRequest({ path: "/meta/version" });
  getProfile = async () => this.jsonRequest({ path: "/profile" });
  companyInsert = async (name: string): Promise<{ uuid: string }> => {
    const path = "/company/insert";
    const data = { name };

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  addressInsert = async (
    companyId: string,
    address: Address
  ): Promise<{ id: number }> => {
    const path = "/address/insert";
    const data = {
      company: { uuid: companyId },
      ...address,
    };

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  invoiceInsert = async (
    addressId: number,
    items: InvoiceItem[]
  ): Promise<{ uuid: string }> => {
    const path = "/invoice/insert";
    const data = {
      address: { id: addressId },
      items,
    };

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  invoiceInsertWithNewCompany = async (
    companyName: string,
    address: Address,
    items: InvoiceItem[]
  ) => {
    const { uuid } = await this.companyInsert(companyName);
    const { id: addressId } = await this.addressInsert(uuid, address);
    return this.invoiceInsert(addressId, items);
  };

  invoiceDetail = async (id: string) =>
    this.jsonRequest({ path: "/invoice/detail", method: "POST", data: { id } });

  invoiceDelete = async (uuid: string) =>
    this.jsonRequest({
      path: "/invoice/delete",
      method: "POST",
      data: { uuid },
    });

  invoiceList = async (): Promise<Invoice[]> =>
    this.jsonRequest({ path: "/invoice/list" });
}

export default Client;
