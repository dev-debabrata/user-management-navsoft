import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LoadingService } from '../core/services/loading.service';
import { getInitials } from '../core/utils/formatters';
import { LucideAngularModule } from 'lucide-angular';
import { BadgeComponent } from '../shared/components/badge/badge.component';

export type NavIconType =
  'admin-dash' | 'manager-dash' | 'user-dash' | 'users' | 'drive' | 'gallery' | 'profile';

interface NavItem {
  label: string;
  route: string;
  iconName: string;
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
    LucideAngularModule,
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
      iconName: 'layout-dashboard',
    },
    {
      label: 'Manager Dashboard',
      route: '/manager/dashboard',
      roles: ['manager'],
      iconName: 'layout-dashboard',
    },
    {
      label: 'My Dashboard',
      route: '/user/dashboard',
      roles: ['user', 'viewer'],
      iconName: 'home',
    },
    {
      label: 'User Management',
      route: '/admin/users',
      roles: ['admin'],
      iconName: 'users',
    },
    {
      label: 'File & Drive Manager',
      route: '/drive',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconName: 'folder',
    },
    {
      label: 'Image Gallery & Zoom',
      route: '/gallery',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconName: 'image',
    },
    {
      label: 'Profile & Security',
      route: '/profile',
      roles: ['admin', 'manager', 'user', 'viewer'],
      iconName: 'user',
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
