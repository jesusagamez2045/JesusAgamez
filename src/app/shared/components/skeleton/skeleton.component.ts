import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly rows = input<number>(5);
  readonly cols = input<number>(6);

  readonly rowsArray = computed(() => Array.from({ length: this.rows() }));
  readonly colsArray = computed(() => Array.from({ length: this.cols() }));
}
