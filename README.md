# PharmaCare - Pharmacy Management System

A comprehensive pharmacy management system frontend built with React, Vite, and modern web technologies.

## Features

- **Multi-role Authentication**: Admin, Manager, Pharmacist, and Cashier dashboards
- **Real-time Data**: Convex-powered database for live updates
- **Secure Authentication**: Clerk integration for user management
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Modern Tech Stack**: React 18, Vite 6, Radix UI components

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend-new

# Install dependencies
cd program
npm install

# Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

## Available Scripts

In the `program` directory, you can run:

- `npm run dev` - Start the development server
- `npm run build` - Create an optimized production build
- `npm run preview` - Locally preview the production build
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Automatically fix linting errors
- `npm run format` - Format code using Prettier
- `npm test` - Run tests with Vitest

## Environment Variables

Create a `.env` file in the `program` directory with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://pharmacare-api.onrender.com/api

# Application Settings
VITE_APP_NAME=PharmaCare
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false

# Backend Services
VITE_CONVEX_URL=https://enduring-owl-795.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3F1YXJlLXBvbGVjYXQtNy5jbGVyay5hY2NvdW50cy5kZXYk
```

## Deployment

### Vercel Deployment

#### Prerequisites

- GitHub repository with the project
- Vercel account ([vercel.com](https://vercel.com))
- Convex project deployed
- Clerk application configured

#### Environment Variables for Vercel

Add these in **Vercel → Settings → Environment Variables**:

```
VITE_API_BASE_URL=https://pharmacare-api.onrender.com/api
VITE_APP_NAME=PharmaCare
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
VITE_TOKEN_EXPIRY_MINUTES=30
VITE_SESSION_TIMEOUT_MINUTES=60
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=60000
VITE_MAX_FILE_SIZE_MB=5
VITE_ALLOWED_FILE_TYPES=.xlsx,.xls,.csv
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=50
VITE_CONVEX_URL=https://enduring-owl-795.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3F1YXJlLXBvbGVjYXQtNy5jbGVyay5hY2NvdW50cy5kZXYk
```

#### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./program`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables listed above
   - Select Production environment
   - Save

5. **Add Convex Integration**
   - Go to Integrations tab
   - Search for "Convex"
   - Install and authorize
   - Select your Convex project: `enduring-owl-795`

6. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete
   - Get your Vercel URL

7. **Add Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your domain
   - Configure DNS records

#### Post-Deployment Verification

- [ ] Website loads at the Vercel URL
- [ ] Clerk authentication works (login/signup)
- [ ] Convex database queries return data
- [ ] Convex mutations execute successfully
- [ ] API calls to Render backend work
- [ ] All dashboard routes are accessible
- [ ] Responsive design works on mobile

## Project Structure

```
├── program/                    # Main application
│   ├── src/                   # Source code
│   │   ├── api/              # API client and service functions
│   │   ├── components/       # Reusable UI components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   └── ui/          # Base UI components
│   │   ├── layouts/         # Page layout components
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Route components
│   │   │   ├── auth/       # Authentication pages
│   │   │   └── dashboard/  # Dashboard pages
│   │   │       ├── admin/     # Admin-specific pages
│   │   │       ├── manager/   # Manager-specific pages
│   │   │       ├── pharmacist/ # Pharmacist-specific pages
│   │   │       └── cashier/    # Cashier-specific pages
│   │   ├── services/      # Business logic services
│   │   ├── store/         # State stores (Zustand)
│   │   └── utils/         # Utility functions
│   ├── convex/            # Convex backend functions
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies and scripts
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── .env.development   # Development environment variables
├── .env.production.example  # Environment variable template
├── package.json            # Root package for Vercel
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## Tech Stack

### Frontend
- **React 18**: Component-based UI library
- **Vite 6**: Fast build tool and dev server
- **React Router 7**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components

### State Management & Data
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Convex**: Backend database and server functions

### UI & Styling
- **Lucide React**: Icon library
- **Recharts**: Charting and visualization
- **GSAP**: Animations
- **Sonner**: Toast notifications

### Authentication
- **Clerk**: User authentication and management

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework

## Role-Based Access

The application implements a robust role-based access control system:

### User Roles

1. **Admin**: Platform-wide management, user management, system statistics
2. **Manager**: Branch management, staff oversight, inventory control, reporting
3. **Pharmacist**: Prescription handling, inventory management, stock receiving
4. **Cashier**: Point-of-sale transactions, receipt generation, session management

### Access Control

- Protected routes implemented with role checks
- Automatic redirection based on user role
- Role-specific permissions and features

## Troubleshooting

### Build Fails

Check Vercel Build Logs for errors. Common issues:
- Missing dependencies: Ensure `package.json` is correct
- Environment variables missing: Verify all variables are added
- Convex connection issues: Check `VITE_CONVEX_URL`

### Authentication Issues

- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check Clerk dashboard for application settings
- Ensure allowed origins include your Vercel domain

### Convex Issues

- Verify Convex project URL: `https://enduring-owl-795.convex.cloud`
- Check Convex dashboard for function errors
- Ensure Convex integration is connected in Vercel

### Environment Variables Not Working

- Variables must start with `VITE_` for client-side access
- Redeploy after adding environment variables
- Check you're using Production environment variables

## Production Considerations

### Clerk Keys

You're currently using a test key (`pk_test_`). For production:

1. Go to Clerk Dashboard
2. Navigate to your application
3. Find the Publishable Key section
4. Copy the production key (starts with `pk_live_`)
5. Update `VITE_CLERK_PUBLISHABLE_KEY` in Vercel
6. Redeploy

### Convex Production

Your Convex URL is already production-ready. No changes needed.

### API Backend

Ensure your Render API (`https://pharmacare-api.onrender.com/api`) is also in production mode.

## Monitoring

- **Vercel Analytics**: Monitor performance and visitor data
- **Vercel Logs**: Check real-time logs for errors
- **Convex Dashboard**: Monitor database operations and function executions
- **Clerk Dashboard**: Monitor authentication events

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Convex Documentation: [docs.convex.dev](https://docs.convex.dev)
- Clerk Documentation: [clerk.com/docs](https://clerk.com/docs)

## License

Private project - All rights reserved
