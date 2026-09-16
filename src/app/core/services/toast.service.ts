import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, message: string, title?: string, duration: number = 4000): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, message, title, duration };

    this.toasts.update((list) => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Success'): void {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', message, title, 5000);
  }

  info(message: string, title: string = 'Info'): void {
    this.show('info', message, title);
  }

  warning(message: string, title: string = 'Warning'): void {
    this.show('warning', message, title);
  }

  remove(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
