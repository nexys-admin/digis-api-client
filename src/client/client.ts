// API doc: https://nexys.stoplight.io/docs/digis-accounting-doc/

import { JsonRequestProps, jsonRequestGeneric } from "./utils";

import * as T from "./type";

interface ClientOptions {
  url?: string; // prefix url used for all reuquests
  token?: string; // if token is given, request will contain headers.authorization
  displayRequestStatusLog?: boolean;
}

class Client {
  jsonRequest: <A, B>(props: JsonRequestProps<B>) => Promise<A>;

  constructor(options: ClientOptions = {}) {
    // get url from optioms, set defauot is unset
    const { url = "https://app.digis.ch/api", displayRequestStatusLog } =
      options;

    const headers: { [k: string]: string } = {
      "content-type": "application/json",
    };

    if (options.token && typeof options.token) {
      headers["authorization"] = "bearer " + options.token;
    }

    this.jsonRequest = jsonRequestGeneric(url, headers, {
      displayRequestStatusLog,
    });
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

  // accounting module
  accountingAccountList = async (): Promise<T.AccountingAccount[]> => {
    const path = "/accounting/account/list";

    return this.jsonRequest({ path });
  };

  accountingAccountsMap = async () => {
    const list = await this.accountingAccountList();
    return new Map(list.map(({ number, id }) => [number, id]));
  };

  accountingEntryAccountList = async (filters: T.EntryAccountProps) =>
    this.jsonRequest({
      path: "/accounting/entry/account/list",
      method: "POST",
      data: { filters },
    });

  accountingEntryGroupInsert = async (
    data: Omit<T.AccountingEntryGroup, "id">
  ) =>
    this.jsonRequest({
      path: "/accounting/group/insert",
      method: "POST",
      data,
    });

  accountingEntryGroupList = async () =>
    this.jsonRequest({
      path: "/accounting/group/list",
    });

  accountingBalance = async (
    data: T.AccountingBalanceProps
  ): Promise<
    {
      account_id: number;
      account_number: number;
      account_name: string;
      currency_id: number;
      cum_amount: number;
      count_ea: number;
      count_e: number;
    }[]
  > =>
    this.jsonRequest({ path: "/accounting/balance/get", method: "POST", data });

  accountingBalanceEntryCheck = async () =>
    this.jsonRequest({ path: "/accounting/balance/check" });

  //
  accountingEntryInsert = (
    data: T.EntryInput
  ): Promise<{ entry: { id: number } }> => {
    return this.jsonRequest({
      path: "/accounting/entry/insert",
      method: "POST",
      data,
    });
  };

  accountingEntryupdate = (id: number, entry: T.EntryInput) => {
    const { entryAccounts, dateLedger, description } = entry;

    const dataToUpdate = {
      entryAccounts,
      dateLedger,
      description,
    };

    return this.jsonRequest({
      path: "/accounting/entry/update",
      method: "POST",
      data: {
        id,
        data: dataToUpdate,
      },
    });
  };

  accountingEntryDetail = (id: number): Promise<T.Entry> =>
    this.jsonRequest({
      path: "/accounting/entry/detail",
      method: "POST",
      data: { id },
    });

  accountingEntryDeleteById = (id: number) =>
    this.jsonRequest({
      path: "/accounting/entry/delete",
      method: "POST",
      data: { id },
    });
}

export default Client;
