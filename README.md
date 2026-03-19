# PharmaCare - Pharmacy Management System

A comprehensive pharmacy management system frontend built with React, Vite, and modern web technologies.

## Features

- **Multi-role Authentication**: Admin, Manager, Pharmacist, and Cashier dashboards
- **Real-time Data**: Convex-powered database for live updates
- **Secure Authentication**: Clerk integration for user management
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Modern Tech Stack**: React 18, Vite 6, Radix UI components

## Quick Start

```bash
cd program
npm install
npm run dev
```

## Environment Variables

See `.env.production.example` for required environment variables.

## Deployment

See `README-DEPLOYMENT.md` for detailed deployment instructions to Vercel.

## Project Structure

```
├── program/              # Main application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   └── convex/          # Convex backend functions
├── .env.production.example
├── vercel.json         # Vercel configuration
└── README-DEPLOYMENT.md
```

## Documentation

- **Deployment Guide**: See `README-DEPLOYMENT.md`
- **API Documentation**: See Render backend API docs
- **Convex Functions**: See `program/convex/` directory

## Tech Stack

- **Frontend**: React 18, Vite 6, React Router 7
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **State Management**: Zustand, React Query
- **Backend**: Convex (database + server functions)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS, GSAP animations
