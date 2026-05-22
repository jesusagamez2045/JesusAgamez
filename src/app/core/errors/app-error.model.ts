export type AppErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromStatus(status: number, serverMessage?: string): AppError {
    switch (status) {
      case 400:
        return new AppError('BAD_REQUEST', serverMessage ?? 'Solicitud inválida.', status);
      case 404:
        return new AppError('NOT_FOUND', serverMessage ?? 'Recurso no encontrado.', status);
      case 409:
        return new AppError('CONFLICT', serverMessage ?? 'El recurso ya existe.', status);
      default:
        return new AppError('SERVER_ERROR', serverMessage ?? 'Error del servidor.', status);
    }
  }

  static network(): AppError {
    return new AppError('NETWORK_ERROR', 'Sin conexión. Verifique su red.');
  }
}
