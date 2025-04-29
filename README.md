# Excel Analytics Platform

A full-stack web application for analyzing Excel data with authentication, role-based access control, and modern UI components.

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- React Router v7 for routing
- Tailwind CSS for styling
- Axios for API requests
- React Icons for UI elements

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin resource sharing

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access (Admin/User)
- Protected routes
- Persistent login state
- Password encryption

### User Interface
- Responsive design
- Modern dashboard
- Real-time notifications
- Password visibility toggle
- Loading states
- Error handling
- Admin-specific features

### Security
- Protected API endpoints
- Secure password storage
- Token-based authentication
- Role-based route protection
- HTTP-only cookies
- Input validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas URI)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Excel_Analytics_Platform
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd ../backend
npm install
```

4. Configure Environment Variables:
   - Create `.env` in backend directory
   - Add required variables:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the Application

1. Start Backend Server:
```bash
cd backend
npm start
```

2. Start Frontend Development Server:
```bash
cd frontend
npm start
```

## Project Structure

```
Excel_Analytics_Platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   └── Notification.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── authSlice.js
│   │   └── App.js
│   └── package.json
└── backend/
    ├── routes/
    │   └── authRoutes.js
    ├── models/
    │   └── User.js
    ├── index.js
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/dashboard` - Protected dashboard route
- `GET /api/admin` - Admin-only route

## Available Scripts

### Frontend

```bash
npm start      # Start development server
npm run build  # Build for production
npm run test   # Run tests
```

### Backend

```bash
npm start      # Start server
npm run dev    # Start server with nodemon
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js Documentation
- Redux Toolkit Documentation
- MongoDB Documentation
- Express.js Documentation
- Tailwind CSS Documentation
