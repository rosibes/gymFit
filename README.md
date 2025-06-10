# 🏋️‍♂️ GymFit - Modern Gym Management System

GymFit is a modern web application for gym management, built with .NET Core backend and React frontend.

## 🌟 Key Features

### 👥 User Roles
- **Admin** - Full system management
- **Client** - Bookings and subscriptions
- **Trainer** - Schedule and clients

### 💼 Admin Features
- Real-time statistics dashboard
- Subscription management
- Client management
- Trainer management
- Appointment overview
- User role management
- System monitoring

### 🎯 Client Features
- Personal dashboard
- Appointment booking
- Subscription management
- Trainer view
- Profile management
- Appointment history

### 🏋️‍♂️ Trainer Features
- Personal dashboard
- Appointment management
- Client overview
- Personal schedule
- Profile management

## 🛠 Technologies Used

### Backend (.NET Core)
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- OData for API endpoints
- Log4Net for logging
- AutoMapper for DTOs
- FluentValidation for request validation
- Swagger/OpenAPI for API documentation
- CORS configuration



### Frontend (React)
- React 18
- TypeScript
- Vite for build tooling
- React Router v6
- React Hot Toast for notifications
- Tailwind CSS for styling
- Axios for API calls
- React Context for state management
- React Query for data fetching
- ESLint for code quality
- Prettier for code formatting

## 🚀 Installation and Running

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+
- PGadmin
- VS Code

### Backend Setup
```bash
cd GymFit_BE
dotnet restore
dotnet run
```

### Frontend Setup
```bash
cd GymFit_FE
npm install
npm run dev
```

## 📁 Project Structure

```
GymFit/
├── GymFit_BE/                 # Backend .NET Core
│   ├── Controllers/          # API Controllers
│   ├── Models/              # Entity Models
│   ├── DTOs/               # Data Transfer Objects
│   ├── Services/            # Business Logic
│   ├── DBContext/          # Database Context
│   ├── Migrations/         # EF Core Migrations
│   └── Program.cs          # Application Entry
│
└── GymFit_FE/                # Frontend React
    ├── src/
    │   ├── components/      # React Components
    │   ├── context/        # React Context
    │   ├── services/       # API Services
    │   ├── types/         # TypeScript Types
    │   ├── hooks/         # Custom Hooks
    │   └── utils/         # Utility Functions
    └── package.json
```

## 🔐 Authentication and Authorization

- JWT (JSON Web Tokens) for authentication
- Role-based authorization
- Protected routes
- Refresh tokens for long sessions
- Secure password hashing
- Token blacklisting

## 📊 API Endpoints

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/logout`

### Subscriptions
- GET `/odata/Subscriptions`
- POST `/odata/Subscriptions`
- PUT `/odata/Subscriptions/{id}`
- DELETE `/odata/Subscriptions/{id}`

### Appointments
- GET `/odata/Appointments`
- POST `/odata/Appointments`
- PUT `/odata/Appointments/{id}`
- DELETE `/odata/Appointments/{id}`

### Users
- GET `/odata/Users`
- PUT `/odata/Users/{id}`
- DELETE `/odata/Users/{id}`

## 🎨 UI/UX Features

- Modern and responsive design
- Dark/Light mode support
- Smooth animations
- Toast notifications
- Loading states
- Error handling
- Form validations
- Responsive tables
- Interactive charts
- Modal dialogs
- Confirmation dialogs
- Search and filter functionality
- Pagination
- Sorting capabilities

## 🔄 Workflow

1. **Authentication**
   - Login/Register
   - Role-based routing
   - Session management

2. **Dashboard**
   - Role-specific statistics
   - Quick actions
   - Recent activities
   - Performance metrics

3. **Management**
   - CRUD operations
   - Real-time updates
   - Bulk actions
   - Data export


## 📝 Code Quality

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Code documentation
- Clean architecture
- SOLID principles
- Design patterns


