# Society Creation API Integration Guide

This document outlines how to integrate and use the API for creating new societies in the system.

## Endpoint Details

- **URL:** `http://localhost:3001/societies`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Permission Required:** `create_society`

## Access Control

Only users with the `create_society` permission can access this endpoint. By default, this permission is assigned to the **Superadmin** role.

| Role | Access | Notes |
| :--- | :--- | :--- |
| **Superadmin** | ✅ Yes | Has `create_society` permission |
| **Manager** | ❌ No | |
| **Receptionist** | ❌ No | |
| **Tenant** | ❌ No | |

## Implementation Steps

### 1. Authenticate as Superadmin
First, you must obtain an access token by logging in as a user with the **Superadmin** role.

**Request:** `POST /auth/login`
```json
{
  "email": "superadmin@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOi..."
}
```

### 2. Create Society
Use the `access_token` from the previous step to authorize the request.

**Request:** `POST /societies`

**Headers:**
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sunshine Heights",
  "address": "456 Innovation Blvd, Tech City"
}
```

**Response (201 Created):**
```json
{
  "id": "a1b2c3d4-...",
  "name": "Sunshine Heights",
  "address": "456 Innovation Blvd, Tech City"
}
```

## Error Responses

- **401 Unauthorized:** If the token is missing or invalid.
- **403 Forbidden:** If the user does not have the `create_society` permission.
- **409 Conflict:** If a society with the same name already exists.
