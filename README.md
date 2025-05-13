# Excel Analytics Platform

Last Updated: May 13, 2025

A full-stack web application for analyzing Excel data with authentication, role-based access control, and modern UI components.

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- React Router v7 for routing
- Tailwind CSS for styling
- Axios for API requests
- React Icons for UI elements
- GSAP for animations

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin resource sharing
- SendGrid for email communications
- GridFS for handling large files

## Features

### Week 1 Progress
- Basic authentication setup
- Initial dashboard layout
- Project structure establishment
- Database connectivity
- Environment configuration

### Week 2 Progress
This week we've made significant additions to the platform:

#### Authentication & Security
- Implemented complete authentication flow (login, signup, logout)
- Added password reset functionality with email integration
- Created JWT-based authentication for secure API access
- Implemented role-based access control (admin vs user)
- Protected routes on both frontend and backend
- Added responsive notifications for user actions

#### UI/UX Improvements
- Created engaging intro animation sequence with GSAP
- Designed responsive layouts for mobile and tablet devices
- Added custom form components (checkbox, input fields with toggle visibility)
- Implemented drag-and-drop file upload with validation and progress tracking
- Created admin-specific dashboard sections with role-based UI

#### Backend Enhancements
- Integrated SendGrid for email communications (password reset)
- Improved Excel file handling with GridFS for large files
- Added secure file upload validation and processing
- Enhanced error handling across all API endpoints
- Implemented secure password handling with bcrypt

### Today's Updates
Today we implemented a new Excel file upload and parsing functionality within the dashboard. The updates include:

- Added an advanced dashboard UI with a modern sidebar layout and responsive design
- Implemented Excel/CSV file upload with drag-and-drop functionality
- Created backend integration using GridFS for handling large files (beyond MongoDB's 16MB limit)
- Added preview functionality for uploaded Excel data

### Additional Features
- User registration and login
- Persistent login state
- Real-time notifications
- Password visibility toggle
- Loading states
- Error handling
- Admin-specific features
- Protected API endpoints
- HTTP-only cookies
- Input validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas URI)
- npm or yarn

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd Excel_Analytics_Platform
   ```

2. Install Frontend Dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install Backend Dependencies:
   ```
   cd ../backend
   npm install
   ```

### Environment Setup

#### Setting Up .env File
1. Create a `.env` file in the root of the backend directory
2. Add the following environment variables:

```
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/myauthdb

# Authentication
JWT_SECRET=your_very_long_and_secure_secret_key

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@example.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

3. Replace placeholder values with your actual credentials
4. Generate a secure JWT secret using:
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

#### SendGrid Account Setup
1. **Create a SendGrid Account**:
   - Go to [SendGrid's website](https://sendgrid.com/) and sign up for a free account
   - Verify your account through the confirmation email

2. **Verify a Sender Identity**:
   - Navigate to Settings → Sender Authentication
   - Choose either "Single Sender Verification" or "Domain Authentication"
   - For testing, use Single Sender Verification by adding your email address
   - Complete the verification process by clicking the link sent to your email

3. **Create an API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name your key (e.g., "Excel Analytics Platform")
   - Select "Full Access" or "Restricted Access" with at least "Mail Send" permissions
   - Copy the generated API key immediately (it won't be shown again)

4. **Add API Key to .env File**:
   - Paste your API key as the value for `SENDGRID_API_KEY` in your .env file
   - Set `SENDGRID_FROM_EMAIL` to your verified email address

#### MongoDB Setup
1. **Local Development**:
   - Install MongoDB on your machine or use MongoDB Atlas
   - Create a database named 'myauthdb' (or choose your own name)
   - Update the MONGO_URI in .env with your connection string

2. **Production**:
   - Use MongoDB Atlas or other cloud database service
   - Update the MONGO_URI with your production connection string
   - Set NODE_ENV=production in your environment variables

## Usage
1. Navigate to the Dashboard
2. Select the "File Upload" tab
3. Drag and drop or browse for an Excel/CSV file
4. Click "Upload & Process Data"
5. View the parsed data preview

## Authentication Flow
1. Users can register with username, email, and password
2. Login with email and password
3. Reset password via email if forgotten
4. Role-based access to features (admin vs regular users)

## Known Issues
- Files larger than 100MB should be handled with care to avoid Git repository issues
- Email service requires proper SendGrid API key configuration in production

## Next Steps
- Improving Dashboard and Website UI/UX
- Implement data visualization for uploaded Excel files
- Add batch processing capabilities for multiple files
- Create user permissions for file access control
- Add analytics dashboard with charts and graphs
