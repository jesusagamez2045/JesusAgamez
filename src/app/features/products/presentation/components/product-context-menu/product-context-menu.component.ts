import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-product-context-menu',
  imports: [ClickOutsideDirective],
  templateUrl: './product-context-menu.component.html',
  styleUrl: './product-context-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductContextMenuComponent {
  readonly edit = output<void>();
  readonly delete = output<void>();

  protected readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onEdit(): void {
    this.isOpen.set(false);
    this.edit.emit();
  }

  onDelete(): void {
    this.isOpen.set(false);
    this.delete.emit();
  }
}
