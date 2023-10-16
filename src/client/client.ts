// API doc: https://nexys.stoplight.io/docs/digis-accounting-doc/

import {
  JsonRequestProps,
  jsonRequestGeneric,
  mapToDigisInvoice,
} from "./utils";

import * as T from "./type";

interface ClientOptions {
  url?: string; // prefix url used for all reuquests
  token?: string; // if token is given, request will contain headers.authorization
  displayRequestStatusLog?: boolean;
}

class Client {
  jsonRequest: <A, B>(props: JsonRequestProps<B>) => Promise<A>;

  constructor(options: ClientOptions = {}) {
    // get url from optioms, default url is for frontend
    const { url = "/api", displayRequestStatusLog } = options;

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

  companyInsert = async (
    data: Pick<T.Company, "name">
  ): Promise<{ uuid: string }> =>
    this.jsonRequest({
      path: "/company/insert",
      method: "POST",
      data: { data },
    });

  companyInsertMultiple = async (
    data: {
      name: string;
      address?: {
        street: string;
        city: string;
        zip: string;
      };
    }[]
  ): Promise<{
    companies: {
      [name: string]: string;
    };
    paymentProfiles: { [uuid: string]: number };
    addresses: { [id: string]: number };
  }> =>
    this.jsonRequest({
      path: "/company/import",
      method: "POST",
      data: { data },
    });

  // this will insert company / payment profioe and make sure it does not exist yet
  companyInsertIfNotExists = async (
    data: Pick<T.Company, "name">,
    paymentProfile: Omit<T.PaymentProfile, "company" | "id">
  ): Promise<{ uuid: string; paymentProfile: { id: number } }> => {
    const l = await this.companyList();

    const f = l.find((x) => x.name === data.name);

    if (f) {
      // check if payment profile exists

      const pList = await this.paymentProfileList({ uuid: f.uuid });

      console.log(pList, paymentProfile.account);

      const fp = pList.find(
        (x) =>
          x.account.id === paymentProfile.account.id &&
          x.iban === paymentProfile.iban &&
          x.type === paymentProfile.type
      );

      if (fp) {
        return { uuid: f.uuid, paymentProfile: { id: fp.id } };
      }

      const { id } = await this.paymentProfileInsert({
        ...paymentProfile,
        company: { uuid: f.uuid },
      });

      return { uuid: f.uuid, paymentProfile: { id } };
    }

    const { uuid } = await this.companyInsert(data);

    const { id } = await this.paymentProfileInsert({
      ...paymentProfile,
      company: { uuid },
    });

    return { uuid, paymentProfile: { id } };
  };

  companyUpdate = async (id: string, data: Partial<Omit<T.Company, "uuid">>) =>
    this.jsonRequest({
      data: { id, data },
      path: "/company/update",
      method: "POST",
    });

  companyList = async (): Promise<T.Company[]> =>
    this.jsonRequest({ path: "/company/list" });

  companyDetail = async (id: string): Promise<T.Company> =>
    this.jsonRequest({ path: "/company/detail", data: { id }, method: "POST" });

  companyDeleteById = async (id: string) =>
    this.jsonRequest({
      path: `/company/delete`,
      data: { id },
      method: "POST",
    });

  //
  addressList = async (data: {
    company: { uuid: string };
  }): Promise<T.Address[]> => {
    const path = "/address/list";
    const method = "POST";
    return this.jsonRequest({ path, method, data });
  };

  addressInsert = async (
    companyId: string,
    address: Omit<T.Address, "id">
  ): Promise<{ id: number }> => {
    const path = "/address/insert";
    const data = {
      company: { uuid: companyId },
      ...address,
    };

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  paymentProfileList = async (company: {
    uuid: string;
  }): Promise<T.PaymentProfile[]> => {
    const data = {
      filters: { company },
    };
    return this.jsonRequest({
      path: "/payment-profile/list",
      method: "POST",
      data,
    });
  };

  paymentProfileInsert = async (
    data: Omit<T.PaymentProfile, "id">
  ): Promise<{ id: number }> =>
    this.jsonRequest({
      path: "/payment-profile/insert",
      method: "POST",
      data: { data },
    });

  invoiceInsert = async (data: {
    address: { id: number };
    items: T.InvoiceItemInsert[];
    refNumber?: string;
    refNumberInt?: number;
    status?: T.InvoiceStatus;
  }): Promise<{ uuid: string }> => {
    const path = "/invoice/insert";

    return this.jsonRequest({ path, method: "POST", data: { data } });
  };

  invoiceInsertWithNewCompany = async (
    companyName: string,
    address: Omit<T.Address, "id">,
    items: T.InvoiceItemInsert[]
  ) => {
    const { uuid } = await this.companyInsert({ name: companyName });
    const { id: addressId } = await this.addressInsert(uuid, address);
    return this.invoiceInsert({ address: { id: addressId }, items });
  };

  invoiceDetail = async (id: string): Promise<T.Invoice> =>
    this.jsonRequest({ path: "/invoice/detail", method: "POST", data: { id } });

  invoiceDelete = async (uuid: string) =>
    this.jsonRequest({
      path: "/invoice/delete",
      method: "POST",
      data: { uuid },
    });

  invoiceList = async (): Promise<T.InvoiceListUnit[]> =>
    this.jsonRequest({ path: "/invoice/list" });

  invoiceListWAmount = async (): Promise<T.InvoiceWAmount[]> =>
    this.jsonRequest({ path: "/invoice/list-w-amounts", method: "GET" });

  //
  invoiceImport = async (
    rows: T.InvoiceImport[],
    companies: { [k: string]: string },
    addresses: { [k: string]: number },
    paymentProfile: { id: number }
  ): Promise<{ response: { uuid: string; items: number }[] }> => {
    const toImport = rows.map(
      mapToDigisInvoice(companies, addresses, paymentProfile)
    );

    return this.jsonRequest({
      path: "/invoice/import",
      method: "POST",
      data: { data: toImport },
    });
  };

  invoiceItemInsert = async (
    data: T.InvoiceItemInsert[]
  ): Promise<{ uuid: string }> =>
    this.jsonRequest({
      path: "/invoice/item/insert",
      method: "POST",
      data: { data },
    });
  //

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
  ): Promise<T.AccountingBalanceOut[]> =>
    this.jsonRequest({ path: "/accounting/balance/get", method: "POST", data });

  accountingBalanceMulti = async (
    data: Omit<T.AccountingBalanceProps, "endDate"> & { endDates: string[] }
  ): Promise<T.AccountingBalanceOut[]> =>
    this.jsonRequest({
      path: "/accounting/balance/get/multi",
      method: "POST",
      data,
    });

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

  fileList = async (data: { payable?: { uuid: string } }) =>
    this.jsonRequest({ path: "/file/list", data, method: "POST" });

  // const blob = await f.async("blob");
  // const base64 = await blobToBase64(blob);
  // const data = { base64, filename, ...dataEntity };
  fileInsert = async (data: {
    base64: string;
    filename: string;
    mail?: { id: number };
    payable?: { uuid: string };
  }) => this.jsonRequest({ path: "/file/upload", data, method: "POST" });

  payableList = async (
    data: {
      filters: { isExpense: number };
    } = {
      filters: { isExpense: 0 },
    }
  ): Promise<T.Payable[]> =>
    this.jsonRequest({
      path: "/payable/list",
      data,
      method: "POST",
    });

  payableDetail = async (id: string): Promise<T.Payable> =>
    this.jsonRequest({ path: "/payable/detail", data: { id }, method: "POST" });

  payableInsert = async (data: {
    amount: number;
    company: { uuid: string };
    paymentProfile: { id: number };
    date: string;
    referenceNumber?: string;
    isExpense: boolean;
  }): Promise<{ uuid: string }> =>
    this.jsonRequest({ path: "/payable/insert", data, method: "POST" });

  payableInsertMulti = async (data: any[]): Promise<{ uuid: string }[]> =>
    this.jsonRequest({
      path: "/payable/insert-multiple",
      data: { data },
      method: "POST",
    });

  transactionGroupInsert = async (
    payableUuids: string[]
  ): Promise<{ id: number }> =>
    this.jsonRequest({
      path: "/transaction-group/insert",
      data: { payables: { uuids: payableUuids } },
    });

  transactionGroupList = async (): Promise<T.TransactionGroupListUnit[]> =>
    this.jsonRequest({ path: "/transaction-group/list", method: "GET" });

  transactionGroupListWAccounts = async () =>
    this.jsonRequest({ path: "/transaction-group/list-w-accounts" });

  transactionGroupDetail = async (id: number): Promise<T.TransactionGroup> =>
    this.jsonRequest({
      path: "/transaction-group/detail",
      data: { id },
      method: "POST",
    });

  mailInsert = async (data: {
    title: string;
    date: string;
    description?: string;
  }): Promise<{ id: number }> =>
    this.jsonRequest({ path: "/mail/insert", method: "POST", data });
}

export default Client;
