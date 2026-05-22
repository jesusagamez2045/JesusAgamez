import { AppError } from './app-error.model';

describe('AppError', () => {
  describe('fromStatus', () => {
    it('should return BAD_REQUEST for 400', () => {
      const err = AppError.fromStatus(400);
      expect(err.code).toBe('BAD_REQUEST');
      expect(err.status).toBe(400);
    });

    it('should return NOT_FOUND for 404', () => {
      const err = AppError.fromStatus(404);
      expect(err.code).toBe('NOT_FOUND');
    });

    it('should return CONFLICT for 409', () => {
      const err = AppError.fromStatus(409);
      expect(err.code).toBe('CONFLICT');
    });

    it('should return SERVER_ERROR for 500', () => {
      const err = AppError.fromStatus(500);
      expect(err.code).toBe('SERVER_ERROR');
    });

    it('should use custom server message when provided', () => {
      const err = AppError.fromStatus(400, 'ID ya existe.');
      expect(err.message).toBe('ID ya existe.');
    });

    it('should use default message when server message is not provided', () => {
      const err = AppError.fromStatus(404);
      expect(err.message).toBe('Recurso no encontrado.');
    });
  });

  describe('network', () => {
    it('should return NETWORK_ERROR code', () => {
      const err = AppError.network();
      expect(err.code).toBe('NETWORK_ERROR');
    });

    it('should have name AppError', () => {
      const err = AppError.network();
      expect(err.name).toBe('AppError');
    });
  });
});
