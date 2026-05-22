import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from './error.interceptor';
import { AppError } from '../errors/app-error.model';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('should pass through successful requests', () => {
    let result: unknown;
    http.get('/api/test').subscribe((r) => (result = r));

    controller.expectOne('/api/test').flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('should convert 404 to AppError with NOT_FOUND code', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/test').flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).code).toBe('NOT_FOUND');
    expect((caught as AppError).status).toBe(404);
  });

  it('should convert 409 to CONFLICT', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/test').flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect((caught as AppError).code).toBe('CONFLICT');
  });

  it('should convert 500 to SERVER_ERROR', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/test').flush('', { status: 500, statusText: 'Server Error' });

    expect((caught as AppError).code).toBe('SERVER_ERROR');
  });

  it('should convert status 0 to NETWORK_ERROR', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller.expectOne('/api/test').error(new ProgressEvent('error'));

    expect((caught as AppError).code).toBe('NETWORK_ERROR');
  });

  it('should extract message from JSON body', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller
      .expectOne('/api/test')
      .flush({ message: 'ID ya existe' }, { status: 400, statusText: 'Bad Request' });

    expect((caught as AppError).message).toBe('ID ya existe');
  });

  it('should use string body as message', () => {
    let caught: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caught = e) });

    controller
      .expectOne('/api/test')
      .flush('Custom error message', { status: 400, statusText: 'Bad Request' });

    expect((caught as AppError).message).toBe('Custom error message');
  });
});
