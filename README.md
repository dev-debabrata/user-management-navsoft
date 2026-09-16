# UserManage - Modern Angular SaaS Platform

A responsive, feature-rich Angular web application built with a modern UI design system, REST API integration, authentication, role-based authorization, user management CRUD, multiple image upload with product-style magnifier, Google Drive-style file and folder management, reactive forms, guards, and interceptors.

Powered by **JSON Server** as the mock REST API backend (`db.json`).

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

You will need two terminals running simultaneously:

```bash
# Terminal 1: Start JSON Server Mock REST API (Port 3000)
npm run api

# Terminal 2: Start Angular Dev Server (Port 4200)
npm start
```

Open your browser at **`http://localhost:4200`**.

---

## 🔑 Demo Accounts & Credentials

The Login screen includes one-click demo credentials for rapid testing:

| Role        | Email              | Password      | Allowed Access                                                                               |
| :---------- | :----------------- | :------------ | :------------------------------------------------------------------------------------------- |
| **Admin**   | `admin@demo.com`   | `Admin@123`   | Full Access: Admin Dashboard, User Management CRUD, Image Gallery, Drive Explorer, Settings  |
| **Manager** | `manager@demo.com` | `Manager@123` | Manager Dashboard, Team Directory (read-only), Image Gallery, Drive Explorer, Settings       |
| **User**    | `viewer@demo.com`  | `Viewer@123`  | User Dashboard, Personal Image Gallery & Magnifier, Personal Drive Files, Profile & Password |

> 💡 **Public Registration:** New users can sign up via the **Sign Up** page (`/signup`), which automatically assigns the `user` role and enables immediate login.

---

## 🛠️ Key Features

### 1. Authentication & Security

- **Login / Logout**: Credential check against `db.json`, session token management in `localStorage`, role-based auto-redirect.
- **User Sign Up**: Public self-registration for `user` role with validation, password strength checker, and duplicate email prevention.
- **Forgot & Reset Password**: Verified email recovery flow with password reset (`PATCH /users/:id`).
- **Profile & Change Password**: Authenticated user password update with old password verification.
- **Guards & Interceptors**:
  - `authGuard`: Enforces active session before accessing private routes.
  - `roleGuard`: Restricts routes according to user roles (`admin`, `manager`, `user`).
  - `authInterceptor`: Automatically attaches the bearer token.
  - `loadingInterceptor`: Triggers top-level progress bar on active HTTP calls.
  - `errorInterceptor`: Handles 401 session expirations, server faults, and alerts.

### 2. Role-Based Dashboards

- **Admin Dashboard** (`/admin/dashboard`): System metrics, user role distribution bar charts, department headcount, recent user registrations, quick actions.
- **Manager Dashboard** (`/manager/dashboard`): Team directory overview with live search, storage statistics, asset counts.
- **User Dashboard** (`/user/dashboard`): Personal welcome banner, user profile card, quick access to media gallery and files.

### 3. User Management (Admin Only)

- User table with avatar initials, name, email, role badge, department, phone, and active/inactive status.
- **Search & Filtering**: Debounced search by query, filter by role (Admin/Manager/User), filter by status (Active/Inactive), filter by department.
- **Pagination**: Customizable page size (5, 10, 20, 50 rows per page), page jump controls, item counts.
- **Add User Modal**: Full reactive form with validations and API creation.
- **Edit User Modal**: Update member roles, contact details, status, and department.
- **View Details Modal**: User profile inspector with full metadata.
- **Delete Confirmation**: Safe deletion prompt with cascade cleanup.

### 4. Multiple Image Upload & Product Magnifier Gallery

- **Multiple Image Upload**: Drag-and-drop zone, file picker, multi-file previews with thumbnail, dimensions, and file size before upload.
- **File Validation**: Allowed image formats (PNG, JPG, WEBP, GIF, SVG) and max size restriction (2MB).
- **Gallery Grid**: Responsive image cards with hover zoom triggers and individual delete buttons.
- **Product-Style Magnifier**:
  - 2.5x high-definition zoom lens following mouse movement with magnification preview window.
  - Bottom thumbnail filmstrip carousel to switch between active gallery images.
  - Full-resolution image download.

### 5. Google Drive-Style File & Folder Management

- **Folder Navigation**: Interactive breadcrumbs path (`My Drive > Folder > Subfolder`).
- **Create Folder & Subfolders**: Seamless directory creation at any nesting level.
- **Upload Files**: Upload documents, photos, and files into the active folder.
- **View Modes**: Switch between Grid View (rich card tiles) and List View (tabular layout).
- **File Operations**: In-app image preview, document metadata viewer, rename file/folder, recursive delete (removes nested children).
- **Live Search**: Real-time search across the folder tree.

### 6. Component Architecture & Modern UI

- Separate `.html`, `.css`, and `.ts` files for every component.
- Standalone components using Angular signals (`signal`, `computed`, `input`, `output`).
- Reusable UI component library:
  - `app-ui-button` (primary, secondary, danger, outline, ghost variants with loading spinner)
  - `app-badge` (status & role badges with dot indicator)
  - `app-search-input` (debounced search with clear trigger)
  - `app-pagination` (page buttons & size selector)
  - `app-modal` (animated backdrop dialog with ESC shortcut)
  - `app-confirm-dialog` (safe confirmation prompt)
  - `app-toast-container` & `ToastService` (floating toast alerts)
  - `app-file-drop-zone` (drag-and-drop upload zone)
  - `app-image-magnifier` (interactive loupe zoom magnifier)
  - `app-loader` (spinner indicators)
  - `app-empty-state` (clean zero-data illustrations)
  - `app-page-header` (title, breadcrumbs, action button slots)

---

## 📁 REST API Endpoints (`db.json`)

| Resource        | Method   | URL                   | Description                                                                                         |
| :-------------- | :------- | :-------------------- | :-------------------------------------------------------------------------------------------------- |
| **Users**       | `GET`    | `/users`              | Get users list (supports `_page`, `_limit`, `q`, `role`, `status`, `department`, `_sort`, `_order`) |
|                 | `GET`    | `/users/:id`          | Get user by ID                                                                                      |
|                 | `POST`   | `/users`              | Create new user record                                                                              |
|                 | `PATCH`  | `/users/:id`          | Update user properties (role, status, password, info)                                               |
|                 | `DELETE` | `/users/:id`          | Remove user                                                                                         |
| **Images**      | `GET`    | `/images`             | List uploaded gallery images                                                                        |
|                 | `POST`   | `/images`             | Upload image metadata & base64 content                                                              |
|                 | `DELETE` | `/images/:id`         | Delete image                                                                                        |
| **Drive Nodes** | `GET`    | `/nodes?parentId=:id` | Get folders and files in directory                                                                  |
|                 | `POST`   | `/nodes`              | Create folder or upload file                                                                        |
|                 | `PATCH`  | `/nodes/:id`          | Rename file or folder                                                                               |
|                 | `DELETE` | `/nodes/:id`          | Delete node and recursive descendants                                                               |

---

## 🧪 Testing & Verification

```bash
# Run unit test suite (Vitest)
npm test

# Run production build
npm run build
```
