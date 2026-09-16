import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LoadingService } from '../core/services/loading.service';
import { getInitials } from '../core/utils/formatters';
import { BadgeComponent } from '../shared/components/badge/badge.component';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';

export type NavIconType =
  'admin-dash' | 'manager-dash' | 'user-dash' | 'users' | 'drive' | 'gallery' | 'profile';

interface NavItem {
  label: string;
  route: string;
  iconType: NavIconType;
  roles: string[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BadgeComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  loadingService = inject(LoadingService);

  isSidebarCollapsed = signal<boolean>(false);
  isMobileNavOpen = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);

  currentUser = this.authService.currentUser;

  userInitials = computed(() => getInitials(this.currentUser()?.name || ''));

  allNavItems: NavItem[] = [
    {
      label: 'Admin Dashboard',
      route: '/admin/dashboard',
      roles: ['admin'],
      iconType: 'admin-dash',
    },
    {
      label: 'Manager Dashboard',
      route: '/manager/dashboard',
      roles: ['manager'],
      iconType: 'manager-dash',
    },
    {
      label: 'My Dashboard',
      route: '/user/dashboard',
      roles: ['user', 'viewer'],
      iconType: 'user-dash',
    },
    {
      label: 'User Management',
      route: '/admin/users',
      roles: ['admin'],
      iconType: 'users',
    },
    {
      label: 'File & Drive Manager',
      route: '/drive',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconType: 'drive',
    },
    {
      label: 'Image Gallery & Zoom',
      route: '/gallery',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconType: 'gallery',
    },
    {
      label: 'Profile & Security',
      route: '/profile',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconType: 'profile',
    },
  ];

  filteredNavItems = computed(() => {
    const role = this.currentUser()?.role || 'user';
    return this.allNavItems.filter((item) => {
      if (item.roles.includes(role)) return true;
      if (item.roles.includes('user') && role === 'viewer') return true;
      return false;
    });
  });

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen.update((v) => !v);
  }

  closeMobileNav(): void {
    this.isMobileNavOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout(true);
  }

  getRoleBadgeVariant(role: string): 'primary' | 'purple' | 'success' | 'indigo' | 'neutral' {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'purple';
      case 'user':
      case 'viewer':
      default:
        return 'indigo';
    }
  }
}
