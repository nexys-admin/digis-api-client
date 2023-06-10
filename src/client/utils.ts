export interface JsonRequestProps<B> {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: B;
}

export const jsonRequestGeneric =
  <A, B = any>(url: string, headers: { [k: string]: string }) =>
  async ({
    path,
    method = "GET",
    data = undefined,
  }: JsonRequestProps<B>): Promise<A> => {
    const body = data && JSON.stringify(data);
    const response = await fetch(url + path, { headers, method, body });
    console.log("status for path", path, response.status);
    return response.json();
  };
