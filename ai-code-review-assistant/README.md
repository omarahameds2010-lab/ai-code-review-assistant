# AI-Powered Code Review Assistant

A production-oriented full-stack application that enables developers to upload source code and receive structured AI-generated code reviews. Supports multiple AI providers (OpenAI, LM Studio, Ollama, and any OpenAI-compatible endpoint).

## Features

### Core Features
- **Authentication**: User registration, login, and JWT-based protected routes
- **Project Management**: Create, view, and delete projects with descriptions
- **Code Upload**: Upload code via ZIP files, drag-and-drop, or GitHub repository URLs
- **Code Explorer**: Display uploaded files in a tree structure with syntax highlighting
- **AI Review Engine**: Review single files, multiple files, or entire projects
- **Review Templates**: 
  - Security Review (hardcoded credentials, authentication, injection risks)
  - Performance Review (slow operations, inefficient queries, rendering issues)
  - Code Quality Review (naming, structure, readability, maintainability)
- **Review History**: View, search, and manage previous reviews
- **AI Chat with Code**: Ask questions about uploaded code with context awareness

### Bonus Features
- **Documentation Generator**: Generate README, Setup Guide, and API documentation
- **Technical Debt Scanner**: Categorize issues by priority (High, Medium, Low)

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **AI Integration**: OpenAI SDK (supports OpenAI-compatible APIs)
- **File Processing**: Multer, AdmZip, Octokit (GitHub)
- **API Documentation**: Swagger

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Project Structure

```
ai-code-review-assistant/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── projects/          # Project management
│   │   ├── files/             # File upload and management
│   │   ├── reviews/           # AI review engine
│   │   ├── ai-providers/      # AI provider configuration
│   │   ├── chat/              # AI chat with code context
│   │   ├── bonus/             # Bonus features (docs generator, debt scanner)
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts           # Application entry point
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── project/[id]/  # Project detail page
│   │   │   └── settings/      # AI provider settings
│   │   ├── lib/               # Utility functions (API client)
│   │   ├── store/             # Zustand state management
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── README.md
├── ARCHITECTURE.md
└── AI_USAGE.md
```

## Database Schema

### Tables
- **users**: User accounts with authentication
- **projects**: Project metadata and associations
- **files**: Uploaded code files with content
- **reviews**: AI-generated code reviews
- **ai_providers**: Configured AI provider settings
- **chat_sessions**: Chat sessions for AI assistance
- **messages**: Chat messages with context

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ai_code_review
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb ai_code_review

# Or using psql
psql -U postgres
CREATE DATABASE ai_code_review;
```

5. **Start the backend server**
```bash
npm run start:dev
```

The backend will run on `http://localhost:3001`
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### 1. Register/Login
- Navigate to `http://localhost:3000`
- Create an account or sign in

### 2. Configure AI Provider
- Go to Settings
- Add an AI provider (OpenAI, LM Studio, Ollama, etc.)
- Example configurations:
  - OpenAI: Base URL `https://api.openai.com/v1`, Model `gpt-4`
  - LM Studio: Base URL `http://localhost:1234/v1`
  - Ollama: Base URL `http://localhost:11434/v1`

### 3. Create a Project
- Click "New Project" on the dashboard
- Enter project name and description

### 4. Upload Code
- Navigate to the project
- Click "Upload"
- Choose ZIP, GitHub URL, or individual files

### 5. Run Code Review
- Select files to review
- Choose review template (Security, Performance, Code Quality)
- View AI-generated issues and recommendations

### 6. AI Chat
- Start a chat session
- Select files for context
- Ask questions about your code

### 7. Bonus Features
- Generate documentation (README, Setup Guide, API Docs)
- Scan for technical debt with priority categorization

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `DELETE /projects/:id` - Delete project

### Files
- `POST /files/upload` - Upload files
- `POST /files/upload-zip` - Upload ZIP file
- `GET /files/project/:projectId` - Get project files
- `GET /files/tree/:projectId` - Get file tree structure
- `GET /files/:id` - Get file details
- `DELETE /files/:id` - Delete file

### Reviews
- `POST /reviews` - Create code review
- `GET /reviews/project/:projectId` - Get project reviews
- `GET /reviews/search?projectId=&q=` - Search reviews
- `GET /reviews/:id` - Get review details
- `DELETE /reviews/:id` - Delete review

### AI Providers
- `POST /ai-providers` - Add AI provider
- `GET /ai-providers` - Get all providers
- `GET /ai-providers/default` - Get default provider
- `GET /ai-providers/:id` - Get provider details
- `PUT /ai-providers/:id` - Update provider
- `DELETE /ai-providers/:id` - Delete provider

### Chat
- `POST /chat/sessions` - Create chat session
- `GET /chat/sessions` - Get all sessions
- `GET /chat/sessions/:id` - Get session details
- `POST /chat/messages` - Send message
- `DELETE /chat/sessions/:id` - Delete session

### Bonus Features
- `POST /bonus/documentation` - Generate documentation
- `POST /bonus/technical-debt` - Scan technical debt

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_DATABASE` - Database name
- `JWT_SECRET` - JWT secret key
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Deployment

### Backend Deployment
1. Build the project: `npm run build`
2. Set production environment variables
3. Run: `npm run start:prod`
4. Use a process manager like PM2 for production

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or any Node.js hosting

### Database
- Use a managed PostgreSQL service (Supabase, Neon, AWS RDS)
- Run migrations in production mode
- Set `NODE_ENV=production` to disable auto-sync

## Security Notes

- Never commit `.env` files or API keys
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use environment-specific configurations

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### AI Provider Issues
- Verify API key is correct
- Check base URL format (must end with `/v1`)
- Test provider with curl or Postman
- Check network connectivity for local providers (LM Studio, Ollama)

### File Upload Issues
- Check file size limits (default: 50MB)
- Verify upload directory permissions
- Ensure enough disk space

## License

MIT

## Author

Omar Ahmed - Full Stack Engineering Internship Assessment for Strix Engineering Studio
