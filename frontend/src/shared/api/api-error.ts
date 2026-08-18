export type ApiErrorBody = {
  status?: number;
  code?: string;
  message?: string;
  timestamp?: string;
  path?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(
    status: number,
    message: string,
    body: ApiErrorBody | null = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get code(): string | undefined {
    return this.body?.code;
  }
}
