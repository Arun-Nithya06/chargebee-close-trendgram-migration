type PathParams = Record<string, string | number>;
type QueryParams = Record<string, string | number | boolean | undefined>;

export class URLBuilder {
  private baseUrl: string;
  private pathParams: PathParams;
  private queryParams: QueryParams;

  constructor(url: string) {
    this.baseUrl = url;
    this.pathParams = {};
    this.queryParams = {};
  }

  setPathParams(params: PathParams): this {
    this.pathParams = { ...this.pathParams, ...params };
    return this;
  }

  setQueryParams(params: QueryParams): this {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  build(): string {
    let url = this.baseUrl;

    for (const [key, value] of Object.entries(this.pathParams)) {
      url = url.replace(`:${key}`, encodeURIComponent(String(value)));
    }

    const queryString = Object.entries(this.queryParams)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }
}
