import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BreadcrumbItem, DriveNode, DriveStats } from '../../core/models/drive.model';
import { AuthService } from '../../core/services/auth.service';
import { DRIVE_ROOT, DriveService } from '../../core/services/drive.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { formatBytes, formatDate } from '../../core/utils/formatters';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-drive',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    UiButtonComponent,
    SearchInputComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LoaderComponent,
  ],
  templateUrl: './drive.component.html',
  styleUrl: './drive.component.css',
})
export class DriveComponent implements OnInit {
  private driveService = inject(DriveService);
  private authService = inject(AuthService);
  private snackbar = inject(SnackbarService);

  isLoading = signal<boolean>(true);
  isActionSubmitting = signal<boolean>(false);

  currentFolderId = signal<string>(DRIVE_ROOT);
  nodes = signal<DriveNode[]>([]);
  breadcrumbs = signal<BreadcrumbItem[]>([{ id: DRIVE_ROOT, name: 'My Drive' }]);
  stats = signal<DriveStats>({ totalFolders: 0, totalFiles: 0, totalSizeBytes: 0 });

  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = signal<string>('');

  // Modals
  isCreateFolderOpen = signal<boolean>(false);
  newFolderName = signal<string>('');

  isRenameOpen = signal<boolean>(false);
  nodeToRename = signal<DriveNode | null>(null);
  renameValue = signal<string>('');

  isPreviewOpen = signal<boolean>(false);
  previewNode = signal<DriveNode | null>(null);

  isDeleteOpen = signal<boolean>(false);
  nodeToDelete = signal<DriveNode | null>(null);

  formatBytes = formatBytes;
  formatDate = formatDate;

  filteredNodes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.nodes();
    return this.nodes().filter((n) => n.name.toLowerCase().includes(q));
  });

  currentFolders = computed(() => {
    return this.filteredNodes().filter((n) => n.type === 'folder');
  });

  currentFiles = computed(() => {
    return this.filteredNodes().filter((n) => n.type === 'file');
  });

  ngOnInit(): void {
    this.loadFolder(DRIVE_ROOT);
    this.loadStats();
  }

  loadFolder(folderId: string): void {
    this.isLoading.set(true);
    this.currentFolderId.set(folderId);

    forkJoin({
      nodes: this.driveService.getNodes(folderId),
      crumbs: this.driveService.getBreadcrumbs(folderId),
    }).subscribe({
      next: (res) => {
        this.nodes.set(res.nodes);
        this.breadcrumbs.set(res.crumbs);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadStats(): void {
    this.driveService.getStats().subscribe({
      next: (s) => this.stats.set(s),
    });
  }

  navigateToFolder(folderId: string): void {
    this.searchQuery.set('');
    this.loadFolder(folderId);
  }

  onFolderClick(folder: DriveNode): void {
    // Single click handler
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  isImageFile(node: DriveNode): boolean {
    if (!node.mimeType) return false;
    return node.mimeType.startsWith('image/');
  }

  // Create Folder
  openCreateFolderModal(): void {
    this.newFolderName.set('');
    this.isCreateFolderOpen.set(true);
  }

  closeCreateFolderModal(): void {
    this.isCreateFolderOpen.set(false);
  }

  onNewFolderNameInput(e: Event): void {
    this.newFolderName.set((e.target as HTMLInputElement).value);
  }

  submitCreateFolder(): void {
    const name = this.newFolderName().trim();
    if (!name) {
      this.snackbar.warning('Please enter a folder name.');
      return;
    }

    this.isActionSubmitting.set(true);
    const uploader = this.authService.currentUser()?.name || 'User';

    this.driveService.createFolder(name, this.currentFolderId(), uploader).subscribe({
      next: (created) => {
        this.isActionSubmitting.set(false);
        this.closeCreateFolderModal();
        this.snackbar.success(`Folder "${created.name}" created!`);
        this.loadFolder(this.currentFolderId());
        this.loadStats();
      },
      error: () => {
        this.isActionSubmitting.set(false);
        this.snackbar.error('Failed to create folder.');
      },
    });
  }

  // Upload Files
  async onUploadFileInput(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isLoading.set(true);
    const uploader = this.authService.currentUser()?.name || 'User';

    for (const file of files) {
      try {
        const obs = await this.driveService.uploadFile(file, this.currentFolderId(), uploader);
        await new Promise<void>((resolve, reject) => {
          obs.subscribe({
            next: () => resolve(),
            error: (err) => reject(err),
          });
        });
      } catch {
        this.snackbar.error(`Failed to upload ${file.name}`);
      }
    }

    this.snackbar.success(`Uploaded ${files.length} file(s) into current folder!`);
    input.value = '';
    this.loadFolder(this.currentFolderId());
    this.loadStats();
  }

  // Rename
  openRenameModal(node: DriveNode): void {
    this.nodeToRename.set(node);
    this.renameValue.set(node.name);
    this.isRenameOpen.set(true);
  }

  closeRenameModal(): void {
    this.isRenameOpen.set(false);
    this.nodeToRename.set(null);
  }

  onRenameInput(e: Event): void {
    this.renameValue.set((e.target as HTMLInputElement).value);
  }

  submitRename(): void {
    const node = this.nodeToRename();
    const newName = this.renameValue().trim();
    if (!node || !newName) return;

    this.isActionSubmitting.set(true);
    this.driveService.renameNode(node.id, newName).subscribe({
      next: () => {
        this.isActionSubmitting.set(false);
        this.closeRenameModal();
        this.snackbar.success(`Renamed to "${newName}"`);
        this.loadFolder(this.currentFolderId());
      },
      error: () => {
        this.isActionSubmitting.set(false);
        this.snackbar.error('Failed to rename item.');
      },
    });
  }

  // Preview
  openPreview(node: DriveNode): void {
    if (node.type === 'folder') {
      this.navigateToFolder(node.id);
      return;
    }
    this.previewNode.set(node);
    this.isPreviewOpen.set(true);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
    this.previewNode.set(null);
  }

  downloadFile(node: DriveNode): void {
    if (!node.dataUrl) return;
    const a = document.createElement('a');
    a.href = node.dataUrl;
    a.download = node.name;
    a.click();
    this.snackbar.info(`Downloading ${node.name}...`);
  }

  // Delete
  confirmDelete(node: DriveNode): void {
    this.nodeToDelete.set(node);
    this.isDeleteOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteOpen.set(false);
    this.nodeToDelete.set(null);
  }

  submitDelete(): void {
    const node = this.nodeToDelete();
    if (!node) return;

    this.isActionSubmitting.set(true);
    this.driveService.deleteNode(node.id).subscribe({
      next: () => {
        this.isActionSubmitting.set(false);
        this.closeDeleteModal();
        this.snackbar.success(`Deleted "${node.name}"`);
        this.loadFolder(this.currentFolderId());
        this.loadStats();
      },
      error: () => {
        this.isActionSubmitting.set(false);
        this.snackbar.error('Failed to delete item.');
      },
    });
  }
}
