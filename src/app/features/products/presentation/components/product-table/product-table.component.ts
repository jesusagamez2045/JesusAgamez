import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Product } from '../../../domain/models/product.model';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { ProductContextMenuComponent } from '../product-context-menu/product-context-menu.component';

@Component({
  selector: 'app-product-table',
  imports: [DatePipe, SkeletonComponent, ProductContextMenuComponent],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  readonly products = input.required<Product[]>();
  readonly isLoading = input.required<boolean>();

  readonly edit = output<Product>();
  readonly delete = output<Product>();

  onImgError(event: Event, productName: string): void {
    const img = event.target as HTMLImageElement;
    const initials = productName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#c8cdd6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#4b5563">${initials}</text></svg>`;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    img.onerror = null;
  }
}
