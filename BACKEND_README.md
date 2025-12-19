# DBULK WhatsApp Marketing SaaS - Backend API

A production-ready backend for WhatsApp Marketing SaaS built with Next.js App Router, TypeScript, MySQL, and Prisma.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MySQL with Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **Email:** Nodemailer with HTML templates
- **WhatsApp:** Meta WhatsApp Cloud API (BYO-WABA)
- **Queue:** BullMQ interface (processing handled externally)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/dbulk"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_EXPIRES_IN="7d"

# Encryption (32 bytes hex for AES-256)
ENCRYPTION_PSK="your-64-char-hex-string-for-aes-256-encryption"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="DBULK <noreply@dbulk.com>"

# Meta WhatsApp API
META_API_VERSION="v18.0"
META_APP_SECRET="your-meta-app-secret"
META_WEBHOOK_VERIFY_TOKEN="dbulk_webhook_verify"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE dbulk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Push schema to database:
```bash
npx prisma db push
```

4. (Optional) Open Prisma Studio:
```bash
npx prisma studio
```

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API and database health |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user and tenant |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP email |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user profile |

### WhatsApp Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp/connect` | Connect WhatsApp Business Account |
| GET | `/api/whatsapp/connect` | List connected accounts |
| GET | `/api/whatsapp/accounts/[id]` | Get account details |
| POST | `/api/whatsapp/accounts/[id]` | Re-verify account credentials |
| DELETE | `/api/whatsapp/accounts/[id]` | Disconnect account |

### Message Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates` | Create new template |
| GET | `/api/templates` | List templates |
| GET | `/api/templates/[id]` | Get template details |
| DELETE | `/api/templates/[id]` | Delete draft template |
| POST | `/api/templates/[id]/submit` | Submit template to Meta |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/campaigns` | Create new campaign |
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/campaigns/[id]` | Get campaign details |
| PATCH | `/api/campaigns/[id]` | Update campaign |
| DELETE | `/api/campaigns/[id]` | Delete campaign |
| POST | `/api/campaigns/[id]/start` | Start campaign (queue jobs) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/usage` | Get conversation usage stats |
| GET | `/api/analytics/campaigns` | Get campaign performance stats |

### Pricing Configuration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing` | Create pricing config |
| GET | `/api/pricing` | List pricing configs |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/meta` | Meta webhook verification |
| POST | `/api/webhooks/meta` | Meta webhook events handler |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### User Roles
- `SUPER_ADMIN` - Full system access
- `CLIENT_ADMIN` - Tenant admin access
- `CLIENT_USER` - Standard user access

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **Token Encryption:** AES-256-GCM for WhatsApp access tokens
- **OTP Security:** SHA-256 hashed, 5-minute expiry, rate limited
- **Session Management:** JWT with database session validation
- **Audit Logging:** All sensitive actions logged with IP and user agent
- **Webhook Verification:** HMAC-SHA256 signature verification
- **Multi-tenant Isolation:** All queries scoped by tenant_id

## Project Structure

```
├── app/
│   └── api/
│       ├── auth/           # Authentication endpoints
│       ├── whatsapp/       # WhatsApp account management
│       ├── templates/      # Message template management
│       ├── campaigns/      # Campaign management
│       ├── analytics/      # Usage and campaign analytics
│       ├── pricing/        # Pricing configuration
│       ├── webhooks/       # Meta webhook handler
│       └── health/         # Health check
├── lib/
│   ├── auth/              # Password and JWT utilities
│   ├── db/                # Prisma client
│   ├── encryption/        # AES encryption utilities
│   ├── errors/            # Error handling
│   ├── mailer/            # Email sending
│   ├── meta/              # Meta WhatsApp API client
│   ├── middleware/        # Auth middleware
│   ├── services/          # Audit and queue services
│   └── validations/       # Zod schemas
└── prisma/
    └── schema.prisma      # Database schema
```

## Meta Webhook Setup

1. In Meta Developer Console, configure webhook URL:
   ```
   https://your-domain.com/api/webhooks/meta
   ```

2. Set verify token to match `META_WEBHOOK_VERIFY_TOKEN`

3. Subscribe to:
   - `messages`
   - `message_template_status_update`

## Queue Processing

This backend uses a queue interface for campaign message sending. Jobs are stored in the `CampaignJob` table and must be processed by an external worker (e.g., on a VPS with BullMQ + Redis).

### Job Structure
```json
{
  "campaignId": "uuid",
  "phoneNumberId": "meta-phone-number-id",
  "recipientPhone": "+1234567890",
  "templateName": "template_name",
  "languageCode": "en",
  "variables": { "1": "value1", "2": "value2" }
}
```

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## License

Proprietary - All rights reserved
