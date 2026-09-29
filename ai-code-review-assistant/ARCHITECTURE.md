# Architecture Documentation

## System Overview

The AI-Powered Code Review Assistant is a full-stack application designed to help developers review code using AI. The system follows a clean architecture pattern with clear separation of concerns between frontend, backend, and AI integration layers.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (Next.js + React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Projects │  │  Files   │  │  Review  │  │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                        │                                    │
│                  ┌─────▼─────┐                               │
│                  │  Zustand  │                               │
│                  │   Store   │                               │
│                  └─────┬─────┘                               │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                        Backend                               │
│                     (NestJS + TypeScript)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Projects │  │  Files   │  │  Review  │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │AI Provider│  │   Chat   │  │  Bonus   │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                        │                                    │
│                  ┌─────▼─────┐                               │
│                  │ TypeORM   │                               │
│                  │  ORM      │                               │
│                  └─────┬─────┘                               │
└────────────────────────┼────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  users   │  │ projects │  │  files   │  │ reviews  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ai_providers│ │chat_sessions│ │ messages │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘

                         │
                         │ OpenAI-compatible API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    AI Providers                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  OpenAI  │  │LM Studio │  │  Ollama  │  │  Custom  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Directory Structure
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Main dashboard
│   ├── project/[id]/      # Project detail page
│   └── settings/          # Settings page
├── lib/                   # Utility functions
│   └── api.ts            # Axios configuration
├── store/                 # State management
│   └── authStore.ts      # Authentication state
├── globals.css           # Global styles
└── layout.tsx            # Root layout
```

### Key Components

#### Authentication Flow
1. User enters credentials on login/register page
2. Form validation with React Hook Form
3. API call to backend auth endpoints
4. Token stored in Zustand store and localStorage
5. Protected routes check authentication status
6. Axios interceptor adds token to all requests

#### State Management
- **Zustand** for global state (authentication)
- **React useState** for local component state
- **Persist middleware** for localStorage persistence

#### API Integration
- Centralized Axios instance in `lib/api.ts`
- Request interceptor adds JWT token
- Response interceptor handles 401 errors
- Type-safe API calls with TypeScript

### Page Architecture

#### Dashboard Page
- Project list with statistics
- Quick action buttons
- New project modal
- Real-time data fetching

#### Project Page
- File tree structure
- Upload modal (ZIP/GitHub/Files)
- Review history
- Action buttons for code review and chat

#### Settings Page
- AI provider management
- Add/Edit/Delete providers
- Set default provider
- Example configurations

## Backend Architecture

### Technology Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **File Processing**: Multer, AdmZip, Octokit
- **AI Integration**: OpenAI SDK

### Module Structure

Each module follows NestJS conventions:
- **Entities**: Database models
- **DTOs**: Data transfer objects with validation
- **Services**: Business logic
- **Controllers**: HTTP endpoints
- **Guards**: Route protection

#### Auth Module
```
auth/
├── dto/
│   ├── register.dto.ts
│   └── login.dto.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   └── jwt-auth.guard.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.module.ts
```

**Responsibilities**:
- User registration with password hashing (bcrypt)
- JWT token generation and validation
- Protected route enforcement
- Password verification

#### Projects Module
```
projects/
├── dto/
│   └── create-project.dto.ts
├── entities/
│   └── project.entity.ts
├── projects.service.ts
├── projects.controller.ts
└── projects.module.ts
```

**Responsibilities**:
- CRUD operations for projects
- User-scoped project access
- File and review associations

#### Files Module
```
files/
├── dto/
│   └── upload-file.dto.ts
├── entities/
│   └── file.entity.ts
├── files.service.ts
├── files.controller.ts
└── files.module.ts
```

**Responsibilities**:
- File upload (ZIP, drag-drop, GitHub)
- File content storage
- Language detection
- Tree structure generation
- GitHub repository fetching

#### Reviews Module
```
reviews/
├── dto/
│   └── create-review.dto.ts
├── entities/
│   └── review.entity.ts
├── reviews.service.ts
├── reviews.controller.ts
└── reviews.module.ts
```

**Responsibilities**:
- AI-powered code review generation
- Review template management (Security, Performance, Code Quality)
- Issue categorization by severity
- Review history and search

#### AI Providers Module
```
ai-providers/
├── dto/
│   └── create-ai-provider.dto.ts
├── entities/
│   └── ai-provider.entity.ts
├── ai-providers.service.ts
├── ai-providers.controller.ts
└── ai-providers.module.ts
```

**Responsibilities**:
- AI provider configuration
- Default provider management
- OpenAI-compatible API support
- Provider validation

#### Chat Module
```
chat/
├── dto/
│   ├── create-chat-session.dto.ts
│   └── create-message.dto.ts
├── entities/
│   ├── chat-session.entity.ts
│   └── message.entity.ts
├── chat.service.ts
├── chat.controller.ts
└── chat.module.ts
```

**Responsibilities**:
- Chat session management
- Message storage
- AI response generation with code context
- Conversation history

#### Bonus Module
```
bonus/
├── documentation-generator.service.ts
├── technical-debt-scanner.service.ts
├── bonus.controller.ts
└── bonus.module.ts
```

**Responsibilities**:
- Documentation generation (README, Setup Guide, API Docs)
- Technical debt scanning
- Priority categorization

## Database Design

### Entity Relationships

```
users (1) ──────── (N) projects
  │                    │
  │                    │
  │                    │
  │          (1) ────── (N) files
  │                    │
  │                    │
  │                    │
  │          (1) ────── (N) reviews
  │                    │
  │                    │
  │                    │
  │          (1) ────── (N) ai_providers
  │
  │
  └─────── (1) ──────── (N) chat_sessions
                           │
                           │
                           │
                    (1) ── (N) messages
```

### Table Schemas

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### files
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  size INTEGER,
  language VARCHAR(50),
  is_directory BOOLEAN DEFAULT FALSE,
  parent_id UUID,
  project_id UUID NOT NULL REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  issues JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  template VARCHAR(50) NOT NULL,
  file_ids JSONB,
  project_id UUID NOT NULL REFERENCES projects(id),
  ai_provider_id UUID NOT NULL REFERENCES ai_providers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ai_providers
```sql
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_url VARCHAR(500) NOT NULL,
  api_key VARCHAR(500) NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### chat_sessions
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  context_file_ids JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## AI Integration Flow

### Code Review Process

```
1. User initiates review
   ↓
2. Backend fetches files to review
   ↓
3. Backend retrieves AI provider configuration
   ↓
4. Backend builds code context (file paths, content, language)
   ↓
5. Backend constructs prompt based on review template
   ↓
6. Backend calls AI provider via OpenAI SDK
   ↓
7. AI processes code and returns analysis
   ↓
8. Backend parses AI response (JSON extraction)
   ↓
9. Backend stores review in database
   ↓
10. Frontend displays review results
```

### Chat with Code Process

```
1. User sends message with optional file context
   ↓
2. Backend retrieves chat session history
   ↓
3. Backend fetches context files if specified
   ↓
4. Backend builds conversation context
   ↓
5. Backend calls AI provider with:
   - System prompt (role definition)
   - Conversation history
   - Code context
   - Current user query
   ↓
6. AI generates response
   ↓
7. Backend stores user message and AI response
   ↓
8. Frontend displays AI response
```

### Review Templates

#### Security Review Prompt
Focuses on:
- Hardcoded credentials
- Authentication issues
- Input validation
- Injection risks (SQL, XSS, etc.)
- Insecure data handling

#### Performance Review Prompt
Focuses on:
- Slow operations
- Inefficient algorithms
- Unnecessary database queries
- Rendering performance
- Memory leaks
- Caching strategies

#### Code Quality Review Prompt
Focuses on:
- Naming conventions
- Code structure
- Readability
- Maintainability
- Duplication
- Error handling
- Documentation

## Security Architecture

### Authentication
- JWT-based stateless authentication
- Password hashing with bcrypt (salt rounds: 10)
- Token expiration: 7 days
- Protected routes with JWT guard

### Authorization
- User-scoped data access (projects, files, reviews)
- User ownership verification on all operations
- No cross-user data access

### Data Security
- Environment variables for sensitive data
- No API keys in code
- HTTPS recommended in production
- Input validation with class-validator
- SQL injection prevention via TypeORM

### File Security
- File size limits (50MB max)
- File type validation
- Sanitized file paths
- User-isolated file storage

## Scalability Considerations

### Current Architecture (MVP)
- Monolithic backend
- Single database instance
- File storage on local filesystem
- Synchronous AI calls

### Production Enhancements
- **Horizontal Scaling**: Load balancer + multiple backend instances
- **Database**: Connection pooling, read replicas
- **File Storage**: S3 or similar object storage
- **AI Integration**: Queue system for async processing
- **Caching**: Redis for frequently accessed data
- **CDN**: For static assets

## Error Handling

### Frontend
- React Hot Toast for user notifications
- Axios interceptor for 401 handling
- Form validation errors
- Loading states for async operations

### Backend
- Global exception filter
- Custom HTTP exceptions
- Validation errors (class-validator)
- Database error handling
- AI provider error handling with fallback

## Performance Optimizations

### Frontend
- Next.js automatic code splitting
- Image optimization
- Lazy loading for large components
- Zustand for efficient state updates

### Backend
- Database query optimization with TypeORM relations
- File streaming for large uploads
- Connection pooling
- Async/await for non-blocking operations

## Monitoring & Logging

### Current Implementation
- Console logging for development
- Swagger API documentation
- Error tracking in try-catch blocks

### Production Recommendations
- Structured logging (Winston, Pino)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- Database query logging
- API response time monitoring

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation rules

### Integration Tests
- API endpoints
- Database operations
- AI integration (mocked)

### E2E Tests
- User flows (Playwright, Cypress)
- Critical paths (auth, upload, review)

## Deployment Architecture

### Development
- Local PostgreSQL
- Local file storage
- Development server with hot reload

### Production
- Managed PostgreSQL (Supabase, Neon)
- Object storage (S3, Cloudflare R2)
- Process manager (PM2)
- Reverse proxy (Nginx)
- SSL/TLS termination
- CI/CD pipeline

## Future Enhancements

### Planned Features
- Real-time collaboration
- Diff review (compare file versions)
- Automated PR review integration
- Custom review templates
- Team/organization support
- Analytics dashboard
- Code metrics visualization

### Technical Improvements
- GraphQL API
- WebSocket for real-time updates
- Microservices architecture
- Event-driven architecture
- Advanced caching strategies
- Multi-region deployment
