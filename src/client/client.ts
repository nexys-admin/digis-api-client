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

  profile = async (): Promise<T.Profile> =>
    this.jsonRequest({ path: "/profile" });

  profileInstanceList = async (): Promise<T.ProfileInstance[]> =>
    this.jsonRequest({ path: "/instance/list" });

  instanceInfo = async (): Promise<T.Instance & { address: T.Address }> =>
    this.jsonRequest({ path: "/instance/detail" });

  profileMailSyncList = async (): Promise<T.ProfileMailSync[]> =>
    this.jsonRequest({ path: "/profile/mail-sync" });

  profileInstanceChange = async (instance: {
    uuid: string;
  }): Promise<{ locale: string; permissions: string[]; profile: T.Profile }> =>
    this.jsonRequest({
      path: `/auth/instance/change?instanceUuid=${instance.uuid}`,
    });

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

  addressUpdate = async (
    id: number,
    data: Pick<T.Address, "street" | "city" | "zip" | "country">
  ) =>
    this.jsonRequest({
      path: "/address/update",
      data: { id, data },
      method: "POST",
    });

  addressDelete = async (addressId: number): Promise<void> =>
    this.jsonRequest({
      path: "/address/delete",
      method: "POST",
      data: { id: addressId },
    });

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

  paymentProfileByAccount = async (data: {
    account: { id: number };
    company: { uuid: string };
  }): Promise<T.PaymentProfile> =>
    this.jsonRequest({
      path: "/payment-profile/by-account",
      method: "POST",
      data,
    });

  paymentProfileArchive = async (
    id: number
  ): Promise<{ success: boolean; updated: number }> =>
    this.jsonRequest({
      path: "/payment-profile/archive",
      method: "POST",
      data: { id },
    });

  paymentProfileDelete = async (
    id: number
  ): Promise<{ success: boolean; updated: number }> =>
    this.jsonRequest({
      path: "/payment-profile/delete",
      method: "POST",
      data: { id },
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

  invoiceUpdate = async (id: string, data: T.InvoiceUpdate) =>
    this.jsonRequest({
      path: "/invoice/update",
      method: "POST",
      data: { data, id },
    });

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

  invoiceStatusChange = async (
    uuid: string,
    status: T.InvoiceStatus,
    bankRef?: string,
    ledgerDate?: string
  ) =>
    this.jsonRequest({
      path: "/invoice/status/change",
      method: "POST",
      data: { uuid, status, bankRef, ledgerDate },
    });

  invoiceItemInsert = async (
    data: T.InvoiceItemInsert
  ): Promise<{ id: number }> =>
    this.jsonRequest({
      path: "/invoice/item/insert",
      method: "POST",
      data: { data },
    });

  invoiceItemUpdate = async (
    data: Omit<T.InvoiceItemInsert, "id">,
    id: number
  ) =>
    this.jsonRequest({
      path: "/invoice/item/update",
      method: "POST",
      data: { data, id },
    });

  invoiceItemDelete = async (id: number) =>
    this.jsonRequest({
      path: "/invoice/item/delete",
      method: "POST",
      data: { id },
    });
  //

  // accounting module
  accountingAccountList = async (filters?: {
    functionType?: { id: T.AccountFunctionType };
  }): Promise<T.AccountingAccountListUnit[]> =>
    this.jsonRequest({
      path: "/accounting/account/list",
      method: "POST",
      data: { filters },
    });

  accountingAccountDetail = async (
    id: number
  ): Promise<T.AccountingAccountListUnit[]> =>
    this.jsonRequest({
      path: "/accounting/account/detail",
      data: { id },
      method: "POST",
    });

  accountingAccountsMap = async () => {
    const list = await this.accountingAccountList();
    return new Map(list.map(({ number, id }) => [number, id]));
  };

  accountingEntryList = async () =>
    this.jsonRequest<any, any>({
      path: "/accounting/entry/list",
      method: "POST",
    });

  accountingEntryAccountList = async (
    filters: T.EntryAccountProps
  ): Promise<T.AccountingEntryAccountListUnit[]> =>
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

  accountingEntryupdate = (id: number, entry: Partial<T.EntryInput>) => {
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

  //
  accountingLockTransaction = async (entryId: number) =>
    this.jsonRequest({
      path: "",
      method: "POST",
      data: { endEntry: { id: entryId } },
    });

  accountingLockList = async () =>
    this.jsonRequest({ path: "/accounting/lock/list" });

  accountingLockDelete = async (uuid: string) =>
    this.jsonRequest({
      path: "/accounting/lock/delete",
      method: "POST",
      data: { uuid },
    });

  //

  fileList = async (filters: {
    payable?: { uuid: string };
    company?: { uuid: string };
    name?: string;
  }): Promise<T.File[]> =>
    this.jsonRequest({ path: "/file/list", data: { filters }, method: "POST" });

  fileInsert = async (data: {
    base64: string;
    filename: string;
    mail?: { id: number };
    payable?: { uuid: string };
    company?: { uuid: string };
  }): Promise<{ uuid: string }> =>
    this.jsonRequest({ path: "/file/upload", data, method: "POST" });

  fileDelete = async (uuid: string) =>
    this.jsonRequest({ path: "/file/delete", method: "POST", data: { uuid } });

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
    isExpense?: boolean;
    isCreditCard?: boolean; // to remove?
    bank?: { id: number };
    vat?: number;
  }): Promise<{ uuid: string }> =>
    this.jsonRequest({
      path: "/payable/insert",
      data: { data },
      method: "POST",
    });

  payableInsertMulti = async (data: any[]): Promise<{ uuid: string }[]> =>
    this.jsonRequest({
      path: "/payable/insert-multiple",
      data: { data },
      method: "POST",
    });

  payableDelete = async (uuid: string) =>
    this.jsonRequest({
      path: "/payable/delete",
      data: { uuid },
      method: "POST",
    });

  transactionGroupInsert = async (
    payableUuids: string[]
  ): Promise<{
    bankAccount: { id: number };
    entry: { eas: { ids: number[] }; entry: { id: number } };
    payables: T.Payable[];
    responseUpdate: { success: true; updated: number };
    tgInsertResponse: { id: number };
  }> =>
    this.jsonRequest({
      path: "/transaction-group/insert",
      data: { payable: { uuids: payableUuids } },
      method: "POST",
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

  transactionGroupStatusChange = async (
    id: number,
    status: T.TransactionGroupStatus
  ) =>
    this.jsonRequest({
      path: "/transaction-group/status/change",
      method: "POST",
      data: { id, status },
    });

  transactionGroupDelete = async (id: number) =>
    this.jsonRequest({
      path: "/transaction-group/delete",
      method: "POST",
      data: { id },
    });

  paymentInsert = async (data: {
    account: Pick<T.AccountingAccount, "id">;
    creditors: { name: string; amount: number; iban: string; bic?: string }[];
    debtor: { name: string; iban: string; bic?: string };
    paymentId: string;
    token: string;
  }) =>
    this.jsonRequest({
      path: "/banking/integrations/payment/insert",
      method: "POST",
      data,
    });

  mailInsert = async (data: {
    title: string;
    date: string;
    description?: string;
  }): Promise<{ id: number }> =>
    this.jsonRequest({ path: "/mail/insert", method: "POST", data });

  bankingIntegrationsReconcile = async (data: {
    instance: { uuid: string };
    account: { id: number };
  }) =>
    this.jsonRequest({
      path: "/banking/integrations/reconcile",
      method: "POST",
      data,
    });

  additionalPropertList = async (filters: {
    company: { uuid: string };
  }): Promise<T.AdditionalProperty[]> =>
    this.jsonRequest({
      path: "/additional-property/list",
      method: "POST",
      data: { filters },
    });

  additionalPropertyInsert = async (
    data: Omit<T.AdditionalProperty, "id">,
    company: { uuid: string }
  ): Promise<T.AdditionalProperty[]> =>
    this.jsonRequest({
      path: "/additional-property/insert",
      method: "POST",
      data: { ...data, company },
    });

  additionalPropertyDelete = async (data: {
    id: number;
  }): Promise<T.AdditionalProperty[]> =>
    this.jsonRequest({
      path: "/additional-property/delete",
      method: "POST",
      data,
    });
}

export default Client;
