import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent implements OnDestroy {
  readonly search = output<string>();

  private readonly inputSubject = new Subject<string>();
  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.inputSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.search.emit(term));
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputSubject.next(input.value);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
