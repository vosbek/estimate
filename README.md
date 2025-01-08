# Estimation Tool

A full-stack application for managing and creating estimation templates for software projects.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

## Project Structure

```
.
├── client/          # Next.js frontend application
├── server/          # Express.js backend application
└── README.md
```

## Setup Instructions

### 1. Database Setup

1. Create a new PostgreSQL database:
```sql
CREATE DATABASE estimate;
```

2. Create a `.env` file in the `server` directory:
```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/estimate
NODE_ENV=development
```

3. Initialize the database schema:
```bash
cd server
psql -d estimate -f src/db/schema.sql
```

### 2. Server Setup

1. Install server dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm run dev
```

The server will start on http://localhost:3001

### 3. Client Setup

1. Install client dependencies:
```bash
cd client
npm install
```

2. Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start the client:
```bash
npm run dev
```

The client will start on http://localhost:3000

## Database Schema Overview

The application uses several key tables:

- `templates`: Stores estimation templates
- `entry_points`: Defines entry points for different estimation flows
- `template_nodes`: Stores decision tree nodes for templates
- `teams`: Manages team information
- `work_units`: Stores work estimates for different teams

## GitHub Setup

1. Initialize Git repository (if not already done):
```bash
git init
```

2. Create `.gitignore` file:
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

3. Add files and make initial commit:
```bash
git add .
git commit -m "Initial commit"
```

4. Add remote repository:
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Development Workflow

1. Create a new branch for features:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "Description of changes"
```

3. Push changes:
```bash
git push origin feature/your-feature-name
```

## Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check database connection string in `.env`
- Verify database user has proper permissions

### Server Issues
- Check if port 3001 is available
- Verify all environment variables are set
- Check server logs for detailed errors

### Client Issues
- Verify API URL in `.env.local`
- Clear `.next` cache if needed: `rm -rf .next`
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license here] 