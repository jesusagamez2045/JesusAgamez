import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => controller.verify());

  it('should set isLoading to true while request is in flight', () => {
    http.get('/api/test').subscribe();

    expect(loadingService.isLoading()).toBe(true);

    controller.expectOne('/api/test').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });

  it('should decrement when request errors', () => {
    http.get('/api/test').subscribe({ error: () => {} });

    controller.expectOne('/api/test').flush('err', { status: 500, statusText: 'Error' });

    expect(loadingService.isLoading()).toBe(false);
  });

  it('should track multiple concurrent requests', () => {
    http.get('/api/a').subscribe();
    http.get('/api/b').subscribe();

    expect(loadingService.isLoading()).toBe(true);

    controller.expectOne('/api/a').flush({});
    expect(loadingService.isLoading()).toBe(true);

    controller.expectOne('/api/b').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });
});
