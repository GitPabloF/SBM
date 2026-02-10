# SBM - Smart Bookmark Manager

A full-stack bookmark manager with user authentication, metadata extraction, and Redis-backed rate limiting.

## Tech Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- Redis (rate limiting)
- JWT Authentication
- TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Redis

### Installation

```bash
npm install
cp .env.example .env
```

Fill in your `.env` values, then:

```bash
# Seed the database with default users
npm run seed

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

### Seeding

```bash
npm run seed
```

Creates two default users (configurable via env vars):
- **Admin**: `admin@local.dev` / `Changeme123`
- **User**: `user@local.dev` / `Changeme123`

## API Routes

### Authentication

#### POST /api/auth/signup

Create a new user account.

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response (201)
{
  "success": true,
  "message": "User created successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/login

Login to get access tokens.

```json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response (200)
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/refresh-token

Refresh the access token.

```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response (200)
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET /api/auth/me

Get current user profile. Requires authentication.

```
Authorization: Bearer <accessToken>
```

```json
// Response (200)
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### PUT /api/auth/me

Update user profile. Requires authentication.

```json
// Request
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}

// Response (200)
{
  "success": true,
  "message": "User updated successfully"
}
```

#### PUT /api/auth/change-password

Change user password. Requires authentication.

```json
// Request
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}

// Response (200)
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### DELETE /api/auth/me

Delete user account. Requires authentication.

```json
// Response (200)
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### Bookmarks

All bookmark routes require authentication via Bearer token.

```
Authorization: Bearer <accessToken>
```

#### GET /api/bookmark

Get all bookmarks for the authenticated user.

Query parameters:

- `tags` - Filter by tags (comma-separated or multiple params)
- `title` - Search by title

```bash
# Get all bookmarks
GET /api/bookmark

# Filter by tags
GET /api/bookmark?tags=javascript,react

# Search by title
GET /api/bookmark?title=tutorial
```

```json
// Response (200)
{
  "success": true,
  "message": "Fetched successfully",
  "data": [
    {
      "_id": "...",
      "url": "https://example.com",
      "title": "Example Site",
      "coverUrl": "https://example.com/image.png",
      "tags": ["javascript", "tutorial"],
      "userId": "..."
    }
  ]
}
```

#### GET /api/bookmark/:bookmarkId

Get a specific bookmark by ID.

```json
// Response (200)
{
  "success": true,
  "message": "Bookmark fetched successfully",
  "data": {
    "_id": "...",
    "url": "https://example.com",
    "title": "Example Site",
    "coverUrl": "https://example.com/image.png",
    "tags": ["javascript"],
    "userId": "..."
  }
}
```

#### POST /api/bookmark

Create a new bookmark. Title and cover image are automatically extracted from the URL.

```json
// Request
{
  "url": "https://example.com",
  "tags": ["javascript", "tutorial"]
}

// Response (201)
{
  "success": true,
  "message": "Bookmark created successfully",
  "data": {
    "_id": "...",
    "url": "https://example.com",
    "title": "Example Site",
    "coverUrl": "https://example.com/image.png",
    "tags": ["javascript", "tutorial"],
    "userId": "..."
  }
}
```

#### PUT /api/bookmark/:bookmarkId

Update a bookmark.

```json
// Request
{
  "title": "Updated Title",
  "coverUrl": "https://example.com/new-image.png",
  "tags": ["updated", "tags"]
}

// Response (200)
{
  "success": true,
  "message": "Bookmark updated successfully",
  "data": {
    "_id": "...",
    "url": "https://example.com",
    "title": "Updated Title",
    "coverUrl": "https://example.com/new-image.png",
    "tags": ["updated", "tags"],
    "userId": "..."
  }
}
```

#### DELETE /api/bookmark/:bookmarkId

Delete a bookmark.

```json
// Response (200)
{
  "success": true,
  "message": "Bookmark deleted successfully"
}
```

## Rate Limiting

API routes are protected by Redis-backed rate limiting (sliding window per IP):

| Routes | Limit |
|---|---|
| Login, Signup, Change password | 10 req / 15 min |
| Refresh token | 30 req / 15 min |
| All other routes | 100 req / 15 min |

Rate limiting is disabled in development (`NODE_ENV=development`).
