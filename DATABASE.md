# Database Schema Setup Guide

## Overview
This project uses **PostgreSQL** as the database and **Prisma ORM** for database management.

## Database Models

### 1. **User**
Stores user registration information:
- `fullname`: User's full name
- `email`: Unique email address
- `faculty`: BSC_IT or BBA
- `year`: FIRST, SECOND, THIRD, or FOURTH
- Relations: Has many `Game` records

### 2. **Location**
Stores Nepal location data with coordinates:
- `name`: Name of the place
- `latitude` & `longitude`: Actual coordinates
- `imageUrl`: Path to the location image
- `difficulty`: EASY, MEDIUM, or HARD
- Relations: Has many `Guess` records

### 3. **Game**
Stores individual game sessions:
- `userId`: Reference to the player
- `totalScore`: Accumulated score for the game
- `status`: IN_PROGRESS, COMPLETED, or ABANDONED
- `startedAt` & `completedAt`: Timestamps
- Relations: Belongs to `User`, has many `Guess` records

### 4. **Guess**
Stores individual guesses within a game:
- `gameId`: Reference to the game session
- `locationId`: Reference to the actual location
- `guessedLatitude` & `guessedLongitude`: User's selected coordinates
- `distance`: Calculated distance in kilometers
- `points`: Points earned for this guess
- Relations: Belongs to `Game` and `Location`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/geo_detection_game?schema=public"
```

### 3. Create the Database
Make sure PostgreSQL is running, then create the database:
```bash
createdb geo_detection_game
```

Or use pgAdmin or any PostgreSQL client to create a database named `geo_detection_game`.

### 4. Run Database Migrations
Generate Prisma Client and push the schema to your database:
```bash
npm run db:generate
npm run db:push
```

### 5. Seed the Database (Optional)
Populate the database with sample Nepal locations:
```bash
npm run db:seed
```

## Available Database Scripts

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations (production-ready)
- `npm run db:studio` - Open Prisma Studio to view/edit data
- `npm run db:seed` - Seed database with sample locations

## Using Prisma Client

Import the Prisma client in your server-side code:

```typescript
import { prisma } from '~/utils/db.server';

// Example: Get all users
const users = await prisma.user.findMany();

// Example: Create a new game
const game = await prisma.game.create({
  data: {
    userId: 'user-id',
    status: 'IN_PROGRESS',
  },
});
```

## Database Diagram

```
User (1) ──────< (N) Game (1) ──────< (N) Guess >────── (1) Location
     │                                               │
     │                                               │
     └─ id, fullname, email                         └─ id, name, coordinates
        faculty, year                                  imageUrl, difficulty
```

## Notes

- All IDs use `cuid()` for better distribution and security
- Cascade deletes are configured: deleting a User deletes their Games, deleting a Game deletes its Guesses
- Indexes are added on frequently queried fields for performance
- The seed file includes 10 sample locations across Nepal with varying difficulty levels
