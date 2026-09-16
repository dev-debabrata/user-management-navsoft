import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, PaginationParams } from '../models/pagination.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getUsers(params: PaginationParams): Observable<PagedResult<User>> {
    let httpParams = new HttpParams()
      .set('_page', params.page.toString())
      .set('_limit', params.limit.toString());

    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('q', params.search.trim());
    }

    if (params.role) {
      if (Array.isArray(params.role)) {
        params.role.forEach((r) => {
          if (r && r !== 'all') httpParams = httpParams.append('role', r);
        });
      } else if (params.role !== 'all') {
        httpParams = httpParams.set('role', params.role);
      }
    }

    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => {
          if (s && s !== 'all') httpParams = httpParams.append('status', s);
        });
      } else if (params.status !== 'all') {
        httpParams = httpParams.set('status', params.status);
      }
    }

    if (params.department) {
      if (Array.isArray(params.department)) {
        params.department.forEach((d) => {
          if (d && d !== 'all') httpParams = httpParams.append('department', d);
        });
      } else if (params.department !== 'all') {
        httpParams = httpParams.set('department', params.department);
      }
    }

    if (params.sort) {
      httpParams = httpParams.set('_sort', params.sort);
      httpParams = httpParams.set('_order', params.order || 'asc');
    } else {
      httpParams = httpParams.set('_sort', 'id');
      httpParams = httpParams.set('_order', 'desc');
    }

    return this.http
      .get<User[]>(this.baseUrl, {
        params: httpParams,
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const totalHeader = response.headers.get('X-Total-Count');
          const data = response.body || [];
          const total = totalHeader ? parseInt(totalHeader, 10) : data.length;
          const totalPages = Math.ceil(total / params.limit) || 1;

          return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
          };
        }),
      );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    const payload: Partial<User> = {
      ...user,
      status: user.status || 'active',
      createdAt: user.createdAt || new Date().toISOString(),
    };
    return this.http.post<User>(this.baseUrl, payload);
  }

  updateUser(id: string | number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
