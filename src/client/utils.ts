import { Invoice, InvoiceImport } from "./type";

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

export const getVatRate = (total: number, vat: number) => {
  if (!vat) {
    return null;
  }
  const r = total / (total - vat) - 1;

  return Number(r.toFixed(3));
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
