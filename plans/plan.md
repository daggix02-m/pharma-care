# PharmaCare System Plan

## Project Overview

**PharmaCare** is a comprehensive pharmacy management system built with React, Vite, and Convex backend. It provides multi-role authentication, real-time data management, and role-specific dashboards for pharmacy operations.

---

## System Functionality

### 1. Authentication & User Management

**Implemented Features:**

- Multi-role authentication (Admin, Manager, Pharmacist, Cashier)
- Convex-powered secure user authentication
- Password reset and email verification flows
- SSO callback handling
- Account suspension handling
- Pending approval workflow for new registrations

**User Roles:**

- **Admin**: Platform-wide management, user management, system statistics
- **Manager**: Branch management, staff oversight, inventory control, reporting
- **Pharmacist**: Prescription handling, inventory management, stock receiving
- **Cashier**: Point-of-sale transactions, receipt generation, session management
- **Owner**: Pharmacy ownership management, appeals, testimonials

### 2. Dashboard Features

#### Admin Dashboard

- **Overview**: System-wide metrics (pharmacies, branches, managers, revenue)
- **Approvals**: Pending manager and branch approvals
- **Pharmacies**: Full pharmacy management with detailed views
- **Feedbacks**: Contact form message management with reply functionality
- **Audit Logs**: System activity tracking
- **Settings**: Platform configuration
- **Landing Page Management**: Content editor, testimonials manager, section visibility

#### Manager Dashboard

- Branch management and oversight
- Staff management
- Inventory control
- Reporting and analytics

#### Pharmacist Dashboard

- Prescription handling
- Inventory management
- Stock receiving
- Sale creation

#### Cashier Dashboard

- **Overview**: Dashboard summary
- **Stock Check**: Inventory lookup
- **Receipts**: Receipt management
- **Settings**: Personal configuration
- **Pending Payments**: Payment tracking
- **Returns**: Return processing
- **Transactions**: Transaction history
- **POS Operations**: Point of sale
- **Financial Operations**: Financial management
- **Session Management**: Shift management
- **Shift Summary**: End-of-shift reports

#### Owner Dashboard

- Pharmacy ownership overview
- Appeal history for flagged accounts
- Testimonial submission for landing page

### 3. Landing Page

**Sections:**

- Hero section with dynamic content
- About page
- Features section
- Services section
- Testimonials section
- Contact form with success page
- Footer

### 4. Data Management

**State Management:**

- Zustand for client-side state (theme, signup flow)
- React Query for server state
- Convex for real-time database operations

**Key Stores:**

- `useThemeStore`: Dark/light mode management
- `useSignupStore`: Multi-step signup flow state

### 5. Backend Integration (Convex)

**Admin Queries:**

- `getPharmacies`: List all pharmacies
- `getBranches`: List all branches
- `getAllManagers`: List all managers
- `getPendingManagers`: Pending approval queue
- `getPendingBranches`: Branch approval queue
- `getSubscriptionPlans`: Subscription tiers
- `getSubscriptionAnalytics`: Revenue analytics
- `getFlaggedAccounts`: Suspicious activity
- `getPendingAppeals`: User appeals

**Admin Mutations:**

- `approveBranch`: Approve pending branch
- `rejectBranch`: Reject pending branch
- `deletePharmacy`: Remove pharmacy

**Feedback System:**

- `getMessages`: Contact form inbox
- `getTrashedMessages`: Deleted messages
- `getUnreadCount`: Unread message count
- `markAsRead`/`markAsUnread`: Message status
- `replyToMessage`: Admin replies
- `moveToTrash`/`restoreFromTrash`/`permanentDelete`: Message lifecycle
- `emptyTrash`: Bulk deletion

### 6. UI Components

**Base Components (Radix UI-based):**

- Button, Card, Input, Select, Dialog
- Tabs, Badge, Avatar, Tooltip
- Dropdown Menu, Sheet, Separator
- Scroll Area, Skeleton, Switch
- Alert Dialog, Radio Group, Pagination
- Label, Textarea, Progress

**Shared Components:**

- KPICard: Metric display
- Breadcrumb: Navigation
- ExcelImport: Data import
- StatusBadge: Status indicators
- ProfileSettings: User settings
- FormCard: Form containers
- AuthSeparator: OAuth divider
- Logo: Branding
- NotificationBell: Notifications
- ErrorBoundary: Error handling
- LabBackground: Animated background
- FloatingPaths, BackgroundPaths: Visual effects
- ElegantShape: Decorative elements

**Theme Components:**

- ThemeProvider: Context provider
- ThemeToggle: Dark/light switch

### 7. Services

**AI Service:**

- Chatbot integration
- Escalation handling

**Chapa Service:**

- Payment processing integration

### 8. Utilities

- **animations.ts**: GSAP animation utilities
- **logger.ts**: Application logging
- **cn()**: Tailwind class merging utility

### 9. Layouts

**DashboardLayout:**

- Responsive sidebar navigation
- Header with user info
- Breadcrumb navigation
- Role-based menu items

### 10. Pages Structure

```
src/pages/
├── auth/
│   ├── login.tsx
│   ├── signup.tsx
│   ├── SSOCallbackPage.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── change-password.tsx
│   ├── verify-email.tsx
│   ├── pending-approval.tsx
│   ├── pharmacy-request-confirm.tsx
│   └── pharmacy-suspended.tsx
├── landing/
│   ├── LandingPage.tsx
│   ├── AboutPage.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── ServicesSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── ContactSection.tsx
│   ├── ContactSuccess.tsx
│   ├── Footer.tsx
│   ├── CTASection.tsx
│   └── ElegantShape.tsx
└── dashboard/
    ├── admin/
    │   ├── AdminDashboard.tsx
    │   ├── appeals/
    │   │   └── AdminAppealReview.tsx
    │   └── pharmacy-detail/
    │       ├── PharmacyDetailPage.tsx
    │       └── sections/
    │           ├── PharmacyOverviewSection.tsx
    │           ├── OwnerDetailsSection.tsx
    │           ├── BranchesSection.tsx
    │           ├── ManagersSection.tsx
    │           ├── StaffSection.tsx
    │           ├── SubscriptionBillingSection.tsx
    │           ├── HistoryPageSection.tsx
    │           ├── DiagnosticSessionsSection.tsx
    │           └── AuditLogSection.tsx
    ├── manager/
    │   └── ManagerDashboard.tsx
    ├── pharmacist/
    │   ├── PharmacistDashboard.tsx
    │   └── SaleCreation.tsx
    ├── cashier/
    │   ├── CashierOverview.tsx
    │   ├── StockCheck.tsx
    │   ├── Receipts.tsx
    │   ├── Settings.tsx
    │   ├── PendingPayments.tsx
    │   ├── Returns.tsx
    │   ├── Transactions.tsx
    │   ├── POSOperations.tsx
    │   ├── FinancialOperations.tsx
    │   ├── SessionManagement.tsx
    │   └── ShiftSummary.tsx
    └── owner/
        ├── OwnerDashboard.tsx
        ├── appeals/
        │   └── OwnerAppealHistory.tsx
        └── testimonials/
            └── TestimonialSubmission.tsx
```

---

## Technical Stack

### Frontend

- **React 18**: Component-based UI library
- **Vite 6**: Fast build tool and dev server
- **React Router 7**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components
- **GSAP**: Animations and transitions
- **Lucide React**: Icon library
- **Recharts**: Charting and visualization
- **Sonner**: Toast notifications
- **date-fns**: Date formatting
- **exceljs**: Excel file handling
- **file-saver**: File download utility

### State Management

- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Convex**: Backend database and real-time functions

### Authentication

- **Convex Auth**: User authentication and management

### Development Tools

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **@testing-library/react**: Component testing

### Build & Deploy

- **Vercel**: Deployment platform
- **Convex**: Backend-as-a-Service
- **Render**: API backend (if applicable)

---

## Environment Variables

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
```

**Note**: `ADMIN_EMAIL` is a Convex environment variable set in the Convex dashboard, not in `.env` files.

---

## Project Structure

```
frontend-new/
├── program/                    # Main application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── shared/        # Shared components
│   │   │   ├── theme/          # Theme components
│   │   │   └── ui/            # Base UI components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── layouts/           # Page layouts
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Route components
│   │   ├── services/          # Business logic
│   │   ├── store/             # Zustand stores
│   │   └── utils/             # Utilities
│   ├── convex/                # Convex backend
│   │   └── _generated/        # Auto-generated types
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── plans/                     # Project documentation
│   └── plan.md               # This file
├── AGENTS.md                 # Coding assistant guidelines
├── README.md                 # Project readme
├── vercel.json              # Vercel configuration
└── package.json             # Root package for deployment
```

---

## Key Features Not Yet Implemented

### 1. Cashier Module

- Full POS integration
- Receipt printing
- Cash drawer management
- End-of-day reconciliation

### 2. Inventory Management

- Real-time stock tracking
- Low stock alerts
- Automatic reorder points
- Barcode scanning
- Inventory adjustments

### 3. Prescription Management

- Prescription upload (image/PDF)
- Digital prescription validation
- Patient prescription history
- Insurance integration

### 4. Reporting & Analytics

- Sales reports with filters
- Inventory reports
- Staff performance metrics
- Financial reports
- Export to PDF/Excel

### 5. Notifications

- Real-time notifications
- Push notifications
- Email notifications
- SMS alerts

### 6. Mobile App

- React Native mobile application
- Offline capability
- Barcode scanning
- Push notifications

### 7. Advanced Features

- Multi-currency support
- Tax calculation
- Discount management
- Loyalty program
- Integration with external pharmacies
- Drug interaction checking
- Expiry date tracking

### 8. Testing

- Unit test coverage
- Integration tests
- E2E tests with Playwright
- Performance testing

### 9. Documentation

- API documentation
- Component storybook
- User manual
- Admin guide

---

## Development Workflow

### Essential Commands

```bash
# Development
npm run dev                    # Start development server

# Build
npm run build                  # Create production build
npm run preview                # Preview production build locally

# Code Quality
npm run lint                   # Check linting errors
npm run lint:fix              # Auto-fix linting errors
npm run format                # Format with Prettier
npm run typecheck             # TypeScript type checking

# Testing
npm test                      # Run all tests
npm run test:ui               # Run tests with UI
npm run test:coverage         # Generate coverage report
```

### Code Style

- **Imports**: React → Third-party → Internal → Types
- **Components**: Functional with hooks, PascalCase naming
- **Hooks**: camelCase with 'use' prefix
- **Files**: kebab-case for services/pages, PascalCase for components
- **Styling**: Tailwind with `cn()` utility for conditionals
- **Types**: Strict TypeScript, interfaces for objects, types for unions

---

## Deployment

### Vercel Configuration

**Root Directory**: `./program`
**Build Command**: `npm run build`
**Output Directory**: `dist`

### Environment Variables in Vercel

Add all `VITE_` prefixed variables in Vercel dashboard under Settings → Environment Variables.

### Convex Integration

1. Install Convex integration in Vercel
2. Connect to project: `enduring-owl-795`
3. Set `ADMIN_EMAIL` in Convex dashboard

---

## Security Considerations

- All client-side env vars must start with `VITE_`
- Authentication is enforced through Convex and role-based checks
- Role-based access control on all protected routes
- Pharmacy suspension status checked on login
- Password change requirement enforcement
- Input validation on all forms
- XSS protection through React's built-in escaping
- CSRF protection via Convex's secure mutations

---

## Performance Optimization

- Memoized components with `React.memo`
- Optimized QueryClient with caching
- Lazy loading for dashboard sections
- GSAP animations with cleanup
- Image optimization
- Code splitting by route
- Bundle size monitoring

---

## Troubleshooting

### Common Issues

**Build Fails:**

- Check all environment variables are set
- Verify Convex URL is correct
- Ensure `ADMIN_EMAIL` is set in Convex dashboard

**Authentication Issues:**

- Verify Convex auth environment configuration
- Ensure user role is properly assigned

**Convex Connection:**

- Verify `VITE_CONVEX_URL` matches your Convex project
- Check Convex dashboard for function errors
- Ensure Convex integration is connected in Vercel

---

## License

Private project - All rights reserved

---

## Support

- **Convex Docs**: https://docs.convex.dev
- **Vercel Docs**: https://vercel.com/docs
- **React Docs**: https://react.dev
