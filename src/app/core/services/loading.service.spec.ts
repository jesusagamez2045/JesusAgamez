import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should be true after increment', () => {
    service.increment();
    expect(service.isLoading()).toBe(true);
  });

  it('should return to false after matching decrement', () => {
    service.increment();
    service.increment();
    service.decrement();
    expect(service.isLoading()).toBe(true);
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('should not go below zero on excess decrements', () => {
    service.decrement();
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });
});
