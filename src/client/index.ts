// API doc: https://nexys.stoplight.io/docs/digis-accounting-doc/

import { JsonRequestProps, jsonRequestGeneric } from "./utils";

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

  companyList = async () => this.jsonRequest({ path: "/company/list" });

  //
  addressList = async (data: { company: { uuid: string } }) => {
    const path = "/address/list";
    const method = "POST";
    return this.jsonRequest({ path, method, data });
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

  invoiceInsert = async (data: {
    address: { id: number };
    items: InvoiceItem[];
    refNumber?: string;
    refNumberInt?: number;
    status?: InvoiceStatus;
  }): Promise<{ uuid: string }> => {
    const path = "/invoice/insert";

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  invoiceInsertWithNewCompany = async (
    companyName: string,
    address: Address,
    items: InvoiceItem[]
  ) => {
    const { uuid } = await this.companyInsert(companyName);
    const { id: addressId } = await this.addressInsert(uuid, address);
    return this.invoiceInsert({ address: { id: addressId }, items });
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
