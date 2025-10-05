# StudentLink Web Portal - Next.js Application

![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-blue.svg)

A comprehensive web portal for Bestlink College faculty, staff, department heads, and administrators to manage the StudentLink system. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring role-based access control and real-time updates.

## 🏗️ Architecture Overview

### System Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Flutter Mobile │    │  Laravel Backend │    │  Next.js Web    │
│   (Students)    │◄──►│   (Core API)     │◄──►│ (Faculty/Staff) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features
- **🔐 JWT Authentication** - Secure login with Laravel backend
- **👥 Role-Based Access Control** - Four distinct user roles with specific permissions
- **📋 Concern Management** - View, respond to, and track student concerns
- **📢 Announcement System** - Create and manage campus announcements
- **🤖 AI Chatbot Integration** - AI-powered assistance for staff
- **🔔 Real-time Notifications** - Live updates via Firebase FCM
- **📊 Analytics & Reporting** - Comprehensive system analytics
- **🚨 Emergency Help** - Quick access to campus services
- **👨‍💼 User Management** - Complete user administration (admin only)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studentlink_web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Edit with your configuration
   nano .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access application**
   - Open browser to `http://localhost:3000`
   - Use demo accounts for testing

## 🔐 Demo Accounts

For development and testing, use these demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | admin@bestlink.edu.ph | admin123 | Full system access |
| **Department Head** | depthead@bestlink.edu.ph | dept123 | Department management |
| **Staff** | staff@bestlink.edu.ph | staff123 | Assigned concerns |
| **Faculty** | faculty@bestlink.edu.ph | faculty123 | Student concerns |

## 📊 User Roles & Permissions

### 1. Administrator (`admin`)
**Full system access and management capabilities**

**Dashboard Access:**
- System overview with all metrics
- User management (CRUD operations)
- All concerns across departments
- System-wide announcements
- AI chatbot configuration
- System settings and workflows

**Key Features:**
- Create, read, update, delete all users
- Manage all concerns system-wide
- Configure AI chatbot settings
- Access comprehensive analytics
- Manage roles and permissions

### 2. Department Head (`department_head`)
**Department-level management and oversight**

**Dashboard Access:**
- Department-specific dashboard
- Department concerns management
- Staff management within department
- Department analytics and reports
- Department announcements

**Key Features:**
- View and manage department concerns
- Manage department staff members
- Create department-specific announcements
- Access department performance metrics

### 3. Staff (`staff`)
**Operational staff with assigned responsibilities**

**Dashboard Access:**
- Personal dashboard
- Assigned concerns management
- Relevant announcements
- Emergency help access

**Key Features:**
- View and respond to assigned concerns
- Access emergency help resources
- Update personal profile
- View targeted announcements

### 4. Faculty (`faculty`)
**Teaching staff with student interaction capabilities**

**Dashboard Access:**
- Faculty dashboard
- Student concerns management
- Student information access
- Course-related features
- Office hours management

**Key Features:**
- View and respond to student concerns
- Manage student information
- Set and manage office hours
- Access course-related announcements

## 🌐 Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_NAME="StudentLink Web Portal"
NEXT_PUBLIC_COLLEGE_NAME="Bestlink College of the Philippines"

# Firebase Configuration (for notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=true

# Debug Configuration
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

## 📡 API Integration

### Backend Connection

The web portal connects to the Laravel backend API with comprehensive endpoints:

#### Authentication
```typescript
// Login with JWT token response
const { token, user } = await apiClient.login(email, password)

// Get current user details
const user = await apiClient.getCurrentUser()

// Logout and clear session
await apiClient.logout()
```

#### Concerns Management
```typescript
// Get concerns with filtering
const { data, pagination } = await apiClient.getConcerns({
  status: 'pending',
  department_id: 1,
  priority: 'high',
  page: 1,
  per_page: 20
})

// Update concern status
await apiClient.updateConcernStatus(concernId, 'in_progress', 'Investigation started')

// Assign concern to staff member
await apiClient.assignConcern(concernId, staffUserId)

// Add message to concern thread
await apiClient.addConcernMessage(concernId, 'Thank you for your concern. We are reviewing it.')
```

#### User Management (Admin Only)
```typescript
// Get all users with filtering
const { data, pagination } = await apiClient.getUsers({
  role: 'faculty',
  department_id: 2,
  is_active: true
})

// Create new user
const newUser = await apiClient.createUser({
  name: 'John Doe',
  email: 'john.doe@bestlink.edu.ph',
  role: 'faculty',
  department_id: 1,
  password: 'temporaryPassword123'
})
```

#### Announcements
```typescript
// Create announcement
const announcement = await apiClient.createAnnouncement({
  title: 'Midterm Examination Schedule',
  content: 'Please be advised that midterm examinations will be held...',
  type: 'academic',
  priority: 'high',
  target_departments: [1, 2, 3],
  target_roles: ['student', 'faculty']
})
```

#### AI Features
```typescript
// Chat with AI assistant
const { message, session_id } = await apiClient.sendAiMessage(
  'How should I respond to a student complaint about late grades?',
  sessionId,
  'concern_reply'
)

// Get AI suggestions for message composition
const suggestions = await apiClient.getAiSuggestions(
  'student_concern',
  'concern_reply',
  'Thank you for reaching out...'
)
```

## 🎨 UI/UX Design

### Design System

**Color Palette:**
- **Primary Dark Blue**: `#1E2A78` - Main brand color
- **Secondary Bright Blue**: `#2480EA` - Accent color  
- **Red**: `#E22824` - Alert/error color
- **Light Gray**: `#DFD10F` - Muted color
- **White**: `#FFFFFF` - Background color

**Typography:**
- **Primary Font**: Geist Sans (modern, clean)
- **Monospace Font**: Geist Mono (code, data)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Component Library

Built with **shadcn/ui** components:
- Button variants and sizes
- Card containers with headers
- Form inputs and validation
- Data tables with sorting
- Modal dialogs and alerts
- Navigation and breadcrumbs
- Badge indicators and status

### Responsive Design

- **Mobile-first** approach with Tailwind CSS
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interface elements

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Type checking
npm run type-check
```

### Project Structure

```
studentlink_web/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin role pages
│   ├── department-head/   # Department head pages
│   ├── faculty/           # Faculty pages
│   ├── staff/             # Staff pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   ├── auth-provider.tsx # Authentication context
│   └── protected-route.tsx # Route protection
├── lib/                  # Utility libraries
│   ├── api-client.ts     # Backend API client
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

### Code Standards

- **TypeScript** with strict mode enabled
- **ESLint** with Next.js configuration
- **Prettier** for code formatting
- **Tailwind CSS** for styling
- **Component composition** over inheritance

## 🧪 Testing

### Testing Strategy

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
__tests__/
├── components/
├── pages/
├── api/
└── utils/
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in dashboard
3. Deploy automatically on push to main branch

#### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **AWS Amplify**: Full Next.js support
- **Docker**: Custom containerized deployment

### Environment Variables for Production

Configure these in your deployment platform:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.studentlink.bestlink.edu.ph/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
# ... other production variables
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT token** authentication with automatic refresh
- **Role-based access control** enforced at route level
- **Protected routes** with permission checking
- **Session management** with secure storage

### Data Protection
- **HTTPS only** communication
- **CORS protection** with trusted origins
- **XSS protection** with content security policy
- **Input validation** on all forms

### Privacy Compliance
- **GDPR compliant** data handling
- **Privacy settings** for users
- **Data anonymization** options
- **Audit logging** for compliance

## 📊 Analytics & Monitoring

### Performance Monitoring
- **Core Web Vitals** tracking
- **Page load performance** metrics
- **API response times** monitoring
- **Error rate** tracking

### User Analytics
- **Feature usage** tracking
- **User journey** analysis
- **Engagement metrics** monitoring
- **Custom events** tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or questions:
- **Email**: support@studentlink.edu.ph
- **Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Issues**: [GitHub Issues](issues)

## 🎓 About Bestlink College

StudentLink Web Portal is proudly built for **Bestlink College of the Philippines**, empowering educators and administrators with modern tools for student support and campus management.

---

**Built with ❤️ using Next.js for Bestlink College of the Philippines**