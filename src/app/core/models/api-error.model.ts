export interface ApiError {
  name: string;
  message: string;
}

export interface AppError {
  status: number;
  message: string;
  originalError?: unknown;
}
