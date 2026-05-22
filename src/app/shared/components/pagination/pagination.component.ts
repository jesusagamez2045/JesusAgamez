import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type PageItem = number | '...';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  readonly pages = computed<PageItem[]>(() =>
    buildPageRange(this.currentPage(), this.totalPages()),
  );

  readonly isFirst = computed(() => this.currentPage() === 1);
  readonly isLast = computed(() => this.currentPage() === this.totalPages());

  goTo(page: PageItem): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev(): void {
    this.goTo(this.currentPage() - 1);
  }

  next(): void {
    this.goTo(this.currentPage() + 1);
  }

  isEllipsis(item: PageItem): boolean {
    return item === '...';
  }
}

function buildPageRange(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}
