# Jobs_Fundamentals

API Endpoints -

1) POST /api/tasks
2) GET /api/tasks
3) GET /api/tasks/:id
4)PATCH /api/tasks/:id
5)PATCH /api/tasks/:id/status

The app connects to a PostgreSQL database using Prisma, and the data can be viewed in Prisma Studio.

To run the project, first install dependencies with npm install.

Create a .env file with your Neon database URL.

Run npx prisma generate and npx prisma db push to set up the database schema.

