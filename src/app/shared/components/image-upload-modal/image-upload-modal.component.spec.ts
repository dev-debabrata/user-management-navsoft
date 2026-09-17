import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AlertCircle,
  LucideAngularModule,
  Maximize2,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-angular';
import { of } from 'rxjs';
import { ImageItem, ImageUploadPreview } from '../../../core/models/image.model';
import { ImageService } from '../../../core/services/image.service';
import { ImageUploadModalComponent } from './image-upload-modal.component';

describe('ImageUploadModalComponent', () => {
  let fixture: ComponentFixture<ImageUploadModalComponent>;
  let component: ImageUploadModalComponent;

  const dummyFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        importProvidersFrom(
          LucideAngularModule.pick({
            AlertCircle,
            Maximize2,
            Plus,
            Search,
            Trash2,
            TriangleAlert,
            Upload,
            X,
          }),
        ),
        {
          provide: ImageService,
          useValue: {
            processFileForPreview: (f: File) =>
              Promise.resolve({
                file: f,
                name: f.name,
                size: f.size,
                type: f.type,
                dataUrl: 'data:image/png;base64,sample',
              }),
            getImages: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calculates valid previews count correctly', () => {
    component.selectedPreviews.set([
      {
        file: dummyFile,
        name: 'good.png',
        size: 100,
        type: 'image/png',
        dataUrl: 'data:image/png;base64,good',
      },
      {
        file: dummyFile,
        name: 'bad.png',
        size: 100,
        type: 'image/png',
        dataUrl: '',
        error: 'Too large',
      },
    ]);
    expect(component.validPreviewsCount()).toBe(1);
  });

  it('clears previews when clearPreviews is called', () => {
    component.selectedPreviews.set([
      {
        file: dummyFile,
        name: 'good.png',
        size: 100,
        type: 'image/png',
        dataUrl: 'data:image/png;base64,good',
      },
    ]);
    expect(component.selectedPreviews().length).toBe(1);
    component.clearPreviews();
    expect(component.selectedPreviews().length).toBe(0);
  });

  it('flags duplicate image as error if it already exists in the gallery', async () => {
    fixture.componentRef.setInput('existingImages', [
      {
        id: 1,
        name: 'existing-photo.jpg',
        url: 'data:...',
        size: 200,
        type: 'image/jpeg',
        uploadedBy: 'Tester',
        createdAt: '2026-01-01',
      },
    ]);
    fixture.detectChanges();

    const file = new File(['123'], 'existing-photo.jpg', { type: 'image/jpeg' });
    await component.onFilesSelected([file]);

    const previews = component.selectedPreviews();
    expect(previews.length).toBe(1);
    expect(previews[0].error).toContain('Duplicate: An image with this name already exists');
    expect(component.validPreviewsCount()).toBe(0);
  });

  it('flags duplicate file within the same selection batch', async () => {
    const file1 = new File(['123'], 'batch-photo.jpg', { type: 'image/jpeg' });
    const file2 = new File(['123'], 'batch-photo.jpg', { type: 'image/jpeg' });

    await component.onFilesSelected([file1, file2]);

    const previews = component.selectedPreviews();
    expect(previews.length).toBe(2);
    expect(previews[0].error).toBeUndefined();
    expect(previews[1].error).toContain('Duplicate: Image already added to this selection');
    expect(component.validPreviewsCount()).toBe(1);
  });
});
