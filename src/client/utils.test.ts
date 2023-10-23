import * as U from "./utils";

describe("display amount", () => {
  it("simple", () => {
    expect(U.displayAmount(1234.567, "en-US")).toBe("1,234.57");
  });
});
