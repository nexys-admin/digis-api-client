import { InvoiceImport } from "./type";

export const getVatRate = (total: number, vat: number) => {
  if (!vat) {
    return null;
  }
  const r = total / (total - vat) - 1;

  return Number(r.toFixed(3));
};

export const formatAmount = (
  amount: number | string,
  locale: string = "fr-CH"
): string => {
  const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return parsedAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const displayAmount = (
  amount?: number,
  locale: string = "fr-CH"
): string => {
  if (typeof amount !== "number") {
    return "-";
  }

  if (amount >= 0) {
    return formatAmount(amount, locale);
  }

  if (amount < 0) {
    return `(${formatAmount(Math.abs(amount), locale)})`;
  }

  return "-";
};

export const formatDate = (date: string, locale: string = "fr-CH") =>
  new Date(date).toLocaleDateString(locale);

export const toRef = (
  id: number,
  {
    prefix = "DIGIS",
    minLength = 6,
  }: { prefix?: string; minLength?: number } = {}
) => {
  const numberString = id.toString();
  const zerosToAdd = minLength - numberString.length;

  return prefix + "0".repeat(zerosToAdd) + numberString;
};

export const mapToDigisInvoice =
  (
    companies: { [k: string]: any },
    addresses: { [k: string]: any },
    paymentProfile: { id: number }
  ) =>
  (invoiceImport: InvoiceImport) => {
    const addressId = addresses[companies[invoiceImport.client.name]];
    const address = { id: addressId };
    const label = `${invoiceImport.project.id} ${invoiceImport.project.name} - ${invoiceImport.type}`;

    return {
      vat: getVatRate(invoiceImport.total, invoiceImport.vat),
      address,
      paymentProfile,
      refNumberInt: invoiceImport.refNumberInt,
      items: [
        {
          label,
          quantity: 1,
          rate: invoiceImport.total,
        },
      ],
      //dates: { issued: x.dateIssued, paid: x.datePaid }
    };
  };

export interface JsonRequestProps<B> {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: B;
}

export const jsonRequestGeneric =
  <A, B = any>(
    url: string,
    headers: { [k: string]: string },
    options: { displayRequestStatusLog?: boolean } = {}
  ) =>
  async ({
    path,
    method = "GET",
    data = undefined,
  }: JsonRequestProps<B>): Promise<A> => {
    const body = data && JSON.stringify(data);
    const response = await fetch(url + path, { headers, method, body });

    if (options.displayRequestStatusLog) {
      console.log("status for path", path, response.status);
    }

    return response.json();
  };

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Ensure that the result is a string and then split it
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
};
