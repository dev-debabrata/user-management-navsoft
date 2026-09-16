import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, User, UserStatus } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { formatDate, getInitials } from '../../../core/utils/formatters';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiButtonComponent,
    SearchInputComponent,
    PaginationComponent,
    BadgeComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LoaderComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  users = signal<User[]>([]);
  totalUsers = signal<number>(0);
  page = signal<number>(1);
  limit = signal<number>(10);
  search = signal<string>('');
  roleFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  deptFilter = signal<string>('all');

  // Modals state
  isAddModalOpen = signal<boolean>(false);
  isEditModalOpen = signal<boolean>(false);
  isViewModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);

  selectedUser = signal<User | null>(null);
  userToDelete = signal<User | null>(null);

  formatDate = formatDate;
  getInitials = getInitials;

  addForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', [Validators.required]],
    department: ['Engineering'],
    phone: [''],
    status: ['active', [Validators.required]],
    password: ['Demo@123', [Validators.required, Validators.minLength(6)]],
  });

  editForm: FormGroup = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', [Validators.required]],
    department: ['Engineering'],
    phone: [''],
    status: ['active', [Validators.required]],
  });

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading.set(true);

    this.userService
      .getUsers({
        page: this.page(),
        limit: this.limit(),
        search: this.search(),
        role: this.roleFilter(),
        status: this.statusFilter(),
        department: this.deptFilter(),
      })
      .subscribe({
        next: (res) => {
          this.users.set(res.data);
          this.totalUsers.set(res.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onSearchChange(query: string): void {
    this.search.set(query);
    this.page.set(1);
    this.fetchUsers();
  }

  onRoleChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.roleFilter.set(val);
    this.page.set(1);
    this.fetchUsers();
  }

  onStatusChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.statusFilter.set(val);
    this.page.set(1);
    this.fetchUsers();
  }

  onDeptChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.deptFilter.set(val);
    this.page.set(1);
    this.fetchUsers();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.fetchUsers();
  }

  onLimitChange(l: number): void {
    this.limit.set(l);
    this.page.set(1);
    this.fetchUsers();
  }

  openAddModal(): void {
    this.addForm.reset({
      name: '',
      email: '',
      role: 'user',
      department: 'Engineering',
      phone: '',
      status: 'active',
      password: 'Demo@123',
    });
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  submitAddUser(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      this.toast.warning('Please fill in all required fields properly.');
      return;
    }

    this.isSubmitting.set(true);
    const val = this.addForm.value;

    this.userService.createUser(val).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.closeAddModal();
        this.toast.success(`User "${created.name}" created successfully!`);
        this.fetchUsers();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Failed to create user. Please try again.');
      },
    });
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editForm.patchValue({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Engineering',
      phone: user.phone || '',
      status: user.status,
    });
    this.isEditModalOpen.set(true);
  }

  openEditModalFromView(): void {
    const u = this.selectedUser();
    this.closeViewModal();
    if (u) {
      this.openEditModal(u);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  submitEditUser(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.toast.warning('Please fill in all required fields properly.');
      return;
    }

    this.isSubmitting.set(true);
    const val = this.editForm.value;

    this.userService.updateUser(val.id, val).subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.closeEditModal();
        this.toast.success(`User "${updated.name}" updated successfully!`);
        this.fetchUsers();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Failed to update user.');
      },
    });
  }

  openViewModal(user: User): void {
    this.selectedUser.set(user);
    this.isViewModalOpen.set(true);
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
  }

  confirmDeleteUser(user: User): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  submitDeleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.toast.success(`User "${user.name}" deleted.`);
        this.fetchUsers();
      },
      error: () => {
        this.isDeleting.set(false);
        this.toast.error('Failed to delete user.');
      },
    });
  }

  getRoleBadge(role: Role): 'primary' | 'purple' | 'indigo' | 'neutral' {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'purple';
      default:
        return 'indigo';
    }
  }
}
