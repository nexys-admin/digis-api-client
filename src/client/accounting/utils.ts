import { AccountingEntryAccount, EntryInput } from "../type";

export const toEntryAccount = ([account, amount]: [number, number]): Pick<
  AccountingEntryAccount,
  "amount" | "direction"
> & { account: { id: number } } => ({
  account: { id: account },
  amount: Math.abs(amount),
  direction: Math.sign(amount) as -1 | 1,
});

export const ajToEntry = (
  description: string,
  dateLedger: string,
  accountsMap: Map<number, number>,
  eas: [number, number][]
): EntryInput => {
  const entryAccounts = eas
    .map(([account, amount]) => {
      const accountId = accountsMap.get(account);

      if (!accountId) {
        throw Error("could not map account " + account);
      }

      return [accountId, -amount];
    })
    .map(([a, b]) => toEntryAccount([a, b]));

  return {
    dateLedger,
    description,
    entryAccounts,
  };
};
