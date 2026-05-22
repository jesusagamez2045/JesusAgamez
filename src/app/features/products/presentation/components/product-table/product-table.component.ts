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
}
