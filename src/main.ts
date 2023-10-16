import Client, { Type as T } from "./client";

// this is an example of how the client can be used

/*
 * run: yarn start MYTOKEN
 *
 */
const { argv: args } = process;

const main = async () => {
  if (args.length <= 2) {
    console.warn("token must be passed as arg");
    throw Error("token must be defined");
  }

  const token = args[2];

  const client = new Client({ token });

  client.viewAPIVersion().then(console.log);
  client.getProfile().then(console.log);

  // insert a new invoice with a new company, new address
  const items: T.InvoiceItemInsert[] = [{ label: "d", rate: 23, quantity: 3 }];
  const address: Omit<T.Address, "id"> = {
    street: "Route des cerises",
    city: "Morges",
    zip: "1111",
    country: { id: T.Country.Switzerland },
  };
  const companyName = "my company";

  const { uuid: invoiceId } = await client.invoiceInsertWithNewCompany(
    companyName,
    address,
    items
  );

  console.log("invoice with uuid", invoiceId, "created");

  const invoiceDetail = await client.invoiceDetail(invoiceId);

  console.log("invoice detail", invoiceDetail);

  // display invoice list
  const invoiceList = await client.invoiceList();
  console.log(
    "invoice list",
    invoiceList.map((x) => x.uuid)
  );

  // delete invoice that was newly created
  return client.invoiceDelete(invoiceId);
};

main().then(console.log);
