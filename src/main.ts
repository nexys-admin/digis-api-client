import Client from "./client";

// this is an example of how the client can be used

/*
 * run: yarn start MYTOKEN
 *
 */
const { argv: args } = process;

const main = () => {
  if (args.length <= 2) {
    console.warn("token must be passed as arg");
    return;
  }

  const token = args[2];

  const client = new Client(token);

  client.viewAPIVersion().then(console.log);
  client.getProfile().then(console.log);
  //companyInsert().then(console.log);
  //addressInsert("7d9826c7-077f-11ee-859f-42010aac0014").then(console.log);
  //invoiceInsert(451, [{ label: "d", rate: 23, quantity: 3 }]).then(console.log);

  client
    .invoiceDetail("757f8dfb-0780-11ee-859f-42010aac0014")
    .then(console.log);
};

main();

/*
const items = [{ label: "d", rate: 23, quantity: 3 }];
const address = {
  street: "Route des cerises",
  city: "Morges",
  zip: "1111",
  country: { id: 1 },
};
const companyName = "my company";
//invoiceInsertWithNewCompany(companyName, address, items).then(console.log);*/
