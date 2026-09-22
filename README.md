# Job Management App

A full-stack task and file management application built with Express and Next.js.

## Getting Started

### Backend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env` in the root directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   STORAGE_PROVIDER=local
   LOCAL_STORAGE_DIR=./uploads
   MAX_FILE_SIZE_BYTES=10485760
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running Both

- Backend: `npm run dev:backend` (port 3000)
- Frontend: `npm run dev:frontend` (port 3001)

## Testing

```bash
npm test
```
