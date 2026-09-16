import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  total = input.required<number>();
  page = input<number>(1);
  limit = input<number>(10);
  pageSizeOptions = input<number[]>([5, 10, 20, 50]);

  pageChange = output<number>();
  limitChange = output<number>();

  totalPages = computed(() => {
    const t = Math.ceil(this.total() / this.limit());
    return t > 0 ? t : 1;
  });

  startItem = computed(() => {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * this.limit() + 1;
  });

  endItem = computed(() => {
    return Math.min(this.page() * this.limit(), this.total());
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const items: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
    } else {
      items.push(1);
      if (current > 3) {
        items.push(-1);
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (current < total - 2) {
        items.push(-1);
      }
      items.push(total);
    }

    return items;
  });

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages() && p !== this.page()) {
      this.pageChange.emit(p);
    }
  }

  onLimitChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.limitChange.emit(parseInt(select.value, 10));
  }
}
