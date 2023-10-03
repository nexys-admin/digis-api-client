// API doc: https://nexys.stoplight.io/docs/digis-accounting-doc/

import { JsonRequestProps, jsonRequestGeneric } from "./utils";

import * as T from "./type";

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
    address: T.Address
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
    items: T.InvoiceItem[];
    refNumber?: string;
    refNumberInt?: number;
    status?: T.InvoiceStatus;
  }): Promise<{ uuid: string }> => {
    const path = "/invoice/insert";

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  invoiceInsertWithNewCompany = async (
    companyName: string,
    address: T.Address,
    items: T.InvoiceItem[]
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

  invoiceList = async (): Promise<T.Invoice[]> =>
    this.jsonRequest({ path: "/invoice/list" });
}

export default Client;
