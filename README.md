o# Pharmacare - Pharmacy Management System Frontend

A comprehensive pharmacy management system frontend built with React and modern web technologies. This application enables efficient management of pharmacy operations with role-based access control for different user types.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Role-Based Access](#role-based-access)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Multi-role Authentication**: Secure login system with role-based access control
- **Admin Dashboard**: Comprehensive platform management tools
- **Manager Dashboard**: Branch and staff management, inventory oversight
- **Pharmacist Dashboard**: Prescription handling, inventory management, stock transfers
- **Cashier Dashboard**: POS sales, receipts, session management
- **Real-time Sales Monitoring**: Live dashboard for tracking sales
- **Inventory Management**: Complete stock tracking and management
- **Reporting System**: Generate and view detailed reports
- **Data Import/Export**: Excel import functionality for bulk data entry
- **Stock Transfer Approval**: Workflow for inter-branch stock movement

### Technical Features
- Modern React architecture with hooks
- Responsive UI with Tailwind CSS
- State management with Zustand
- API integration with Axios
- Form validation and error handling
- Component-based architecture

## Tech Stack

### Frontend Framework
- **React 18**: Component-based UI library
- **React Router DOM 7**: Client-side routing
- **Vite 6**: Fast build tool and development server

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Beautiful icon library
- **Recharts**: Charting and visualization library

### State Management
- **Zustand**: Lightweight state management
- **React Hooks**: Built-in state and lifecycle management

### Data Handling
- **Axios**: HTTP client for API communication
- **XLSX**: Excel file processing for import/export

### Development Tools
- **ESLint 8**: Code linting
- **Prettier 3**: Code formatting
- **PostCSS 8**: CSS processing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd pharmacare-frontend
```

2. Navigate to the program directory:
```bash
cd program
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
Create a `.env` file in the `program` directory with the following variables:
```env
VITE_API_BASE_URL=https://pharmacare-api.onrender.com/api
# Add other environment variables as needed
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Available Scripts

In the project directory (`program` folder), you can run:

- `npm run dev`: Starts the development server with hot reloading
- `npm run start`: Alias for the dev script
- `npm run build`: Creates an optimized production build
- `npm run preview`: Locally previews the production build
- `npm run lint`: Checks code for linting errors
- `npm run lint:fix`: Automatically fixes linting errors
- `npm run format`: Formats code using Prettier

### Environment Configuration

The application uses the `VITE_API_BASE_URL` environment variable for all API requests in every environment (development and production). No dev-time proxy is configured in `vite.config.js`; the frontend talks directly to the backend URL you set in `.env`.

## Project Structure

```
program/
├── public/                 # Static assets
│   ├── favicon.png
│   └── logo.png
├── src/
│   ├── api/                # API client and service functions
│   ├── components/         # Reusable UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── shared/         # Shared components
│   │   └── ui/            # Base UI components
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Page layout components
│   ├── lib/              # Utility functions
│   ├── pages/            # Route components
│   │   └── auth/         # Authentication pages
│   │   └── dashboard/
│   │       ├── admin/    # Admin-specific pages
│   │       ├── manager/  # Manager-specific pages
│   │       ├── pharmacist/ # Pharmacist-specific pages
│   │       └── cashier/  # Cashier-specific pages
│   ├── services/         # Business logic services
│   ├── store/            # State stores
│   └── utils/            # Utility functions
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── .env                  # Environment variables
```

## Role-Based Access

The application implements a robust role-based access control system:

### User Roles
1. **Admin**: Platform-wide management, user management, billing, system statistics
2. **Manager**: Branch management, staff oversight, inventory control, reporting
3. **Pharmacist**: Prescription handling, inventory management, stock receiving
4. **Cashier**: Point-of-sale transactions, receipt generation, session management

### Access Control
- Protected routes are implemented using the `RoleProtectedRoute` component
- Users are automatically redirected based on their role after authentication
- Each role has specific permissions and accessible features

## API Integration

The frontend communicates with the backend API hosted at `https://pharmacare-api.onrender.com`. API calls are managed through:
- Dedicated API client in `src/api/apiClient.js`
- Service layers for business logic in `src/services/`
- Authentication tokens stored in localStorage

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

#### Automated Deployment via Git

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables (see below)
4. Deploy!

#### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Build the project:
```bash
cd program
npm run build
```

3. Deploy:
```bash
vercel --prod
```

#### Environment Variables Required

In Vercel, set these environment variables:

```env
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

#### Vercel Configuration

The project includes a `vercel.json` file with:
- Build command: `cd program && npm run build`
- Output directory: `program/dist`
- Rewrite rules for client-side routing
- Security headers
- Static asset caching

## Contributing

We welcome contributions to improve the Pharmacare system. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed
- Run `npm run lint` and `npm run format` before committing

### Code Standards
- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Write reusable and modular components
- Implement proper error handling


## Support

For support, please contact the development team or open an issue in the repository.