import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ImageItem, ImageUploadPreview } from '../../../core/models/image.model';
import { AuthService } from '../../../core/services/auth.service';
import { ImageService } from '../../../core/services/image.service';
import {
  MediaUploadOutcome,
  MediaUploadService,
} from '../../../core/services/media-upload.service';
import { formatBytes } from '../../../core/utils/formatters';
import { FileDropZoneComponent } from '../file-drop-zone/file-drop-zone.component';
import { ModalComponent } from '../modal/modal.component';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'app-image-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ModalComponent,
    FileDropZoneComponent,
    UiButtonComponent,
  ],
  templateUrl: './image-upload-modal.component.html',
  styleUrl: './image-upload-modal.component.css',
})
export class ImageUploadModalComponent {
  private imageService = inject(ImageService);
  private mediaUpload = inject(MediaUploadService);
  private authService = inject(AuthService);

  isOpen = input<boolean>(false);
  title = input<string>('Upload Images');
  accept = input<string>('image/png, image/jpeg, image/webp, image/gif, image/svg+xml');
  maxSizeMb = input<number>(2);
  existingImages = input<ImageItem[]>([]);

  close = output<void>();
  uploaded = output<MediaUploadOutcome>();

  isUploading = signal<boolean>(false);
  selectedPreviews = signal<ImageUploadPreview[]>([]);

  formatBytes = formatBytes;

  validPreviewsCount = computed(() => {
    return this.selectedPreviews().filter((p) => !p.error && p.dataUrl).length;
  });

  private existingImageNames = computed(() => {
    return new Set(this.existingImages().map((img) => img.name.toLowerCase().trim()));
  });

  async onFilesSelected(files: File[]): Promise<void> {
    const previews: ImageUploadPreview[] = [];
    const currentQueueNames = new Set(
      this.selectedPreviews().map((p) => p.name.toLowerCase().trim()),
    );
    const existingNames = this.existingImageNames();

    for (const file of files) {
      const p = await this.imageService.processFileForPreview(file);
      const normalizedName = file.name.toLowerCase().trim();

      if (!p.error) {
        if (existingNames.has(normalizedName)) {
          p.error = 'Duplicate: An image with this name already exists in the gallery.';
        } else if (currentQueueNames.has(normalizedName)) {
          p.error = 'Duplicate: Image already added to this selection.';
        }
      }

      currentQueueNames.add(normalizedName);
      previews.push(p);
    }
    this.selectedPreviews.update((curr) => [...curr, ...previews]);
  }

  removePreview(index: number): void {
    this.selectedPreviews.update((curr) => curr.filter((_, i) => i !== index));
  }

  clearPreviews(): void {
    this.selectedPreviews.set([]);
  }

  onClose(): void {
    if (this.isUploading()) return;
    this.clearPreviews();
    this.close.emit();
  }

  async uploadAll(): Promise<void> {
    const valid = this.selectedPreviews().filter((p) => !p.error && p.dataUrl);
    if (valid.length === 0) return;

    this.isUploading.set(true);

    const outcome = await this.mediaUpload.uploadToGallery(
      valid.map((p) => ({ name: p.name, size: p.size, type: p.type, dataUrl: p.dataUrl })),
      { uploadedBy: this.authService.currentUser()?.name || 'User' },
    );

    this.mediaUpload.report(outcome, 'Gallery');
    this.isUploading.set(false);

    const landed = new Set(outcome.uploaded);
    this.selectedPreviews.update((curr) => curr.filter((p) => !landed.has(p.name)));

    if (outcome.uploaded.length > 0) {
      this.uploaded.emit(outcome);
      if (this.selectedPreviews().length === 0) {
        this.close.emit();
      }
    }
  }
}
