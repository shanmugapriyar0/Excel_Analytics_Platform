# Excel Analytics Platform

Last Updated: July 25, 2025

A comprehensive full-stack web application for analyzing Excel data with advanced AI insights, authentication, role-based access control, and modern data visualization capabilities.

## 🚀 Project Overview

The Excel Analytics Platform is a sophisticated data analysis tool that combines the power of Excel file processing with artificial intelligence to provide meaningful insights from your data. Built with modern web technologies, it offers a seamless experience for uploading, analyzing, and visualizing data with interactive 3D charts and AI-powered analytics.

## 🛠️ Tech Stack

### Frontend
- **React.js with Vite** - Fast development and build tool
- **Redux Toolkit** - Predictable state management
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Icons** - Beautiful icon library
- **GSAP** - Professional-grade animations
- **Plotly.js** - Interactive 3D data visualizations

### Backend
- **Node.js & Express.js** - Server-side JavaScript runtime and framework
- **MongoDB with Mongoose** - NoSQL database with object modeling
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing and encryption
- **CORS** - Cross-origin resource sharing
- **SendGrid** - Email service integration
- **GridFS** - Large file storage solution
- **Google Gemini AI** - Advanced AI analytics and insights

### Additional Tools
- **Multer** - File upload handling
- **XLSX** - Excel file parsing and processing
- **Crypto** - Secure token generation

## ✨ Key Features

### 🔐 Authentication & Security
- Complete user registration and login system
- JWT-based secure authentication
- Role-based access control (Admin/User)
- Password reset functionality with email integration
- Protected routes on both frontend and backend
- Secure password hashing with bcrypt
- Token-based API access

### 📁 File Management
- Drag-and-drop Excel/CSV file upload
- GridFS integration for large file storage (>16MB)
- Real-time upload progress tracking
- File validation and error handling
- Support for multiple file formats (.xlsx, .xls, .csv)
- Automatic file preview generation
- Persistent file selection across sessions

### 📊 Data Visualization
- Interactive 3D visualizations with Plotly.js
- Six different 3D chart types:
  - 3D Bar Charts with dynamic spacing
  - 3D Scatter Plots with intelligent sizing
  - 3D Surface Plots with gradient coloring
  - 3D Line Charts with smooth curves
  - 3D Area Charts with transparency
  - 3D Pie Charts with elevation effects
- Responsive design for all screen sizes
- Custom tooltips and interactive controls
- Performance optimization for large datasets

### 🤖 AI-Powered Analytics
- Google Gemini AI integration for data insights
- Natural language querying of your data
- Automated pattern recognition
- Statistical analysis and recommendations
- Smart data type detection
- Contextual insights based on data content

### 🎨 User Interface
- Modern, responsive dashboard design
- Engaging intro animations with GSAP
- Mobile-first responsive design
- Real-time notifications system
- Custom form components
- Intuitive navigation and user experience

## 📈 Development Progress

### Week 1: Foundation
- Established project structure and basic authentication
- Set up MongoDB database connectivity
- Created initial dashboard layout
- Configured development environment
- Implemented JWT authentication basics

### Week 2: Authentication & File Handling
**Major Achievements:**
- ✅ Complete authentication flow (login, signup, logout)
- ✅ Password reset with email integration via SendGrid
- ✅ Role-based access control implementation
- ✅ Drag-and-drop file upload with progress tracking
- ✅ GridFS integration for large file storage
- ✅ GSAP animations for engaging user experience
- ✅ Responsive design for mobile and tablet devices
- ✅ Custom form components with validation

**Technical Implementations:**
- Integrated SendGrid for secure email communications
- Enhanced Excel file handling with GridFS for files beyond MongoDB's 16MB limit
- Added comprehensive error handling across all API endpoints
- Created admin-specific dashboard sections with role-based UI
- Implemented secure password handling and JWT token management

### Week 3: Data Analysis & Visualization
**Major Achievements:**
- ✅ Fixed critical MongoDB ObjectId constructor bugs
- ✅ Implemented automatic file selection and persistence
- ✅ Enhanced file analysis with metadata display
- ✅ Created unified CSV and Excel file handling
- ✅ Advanced 3D visualization implementation with Plotly.js
- ✅ Six different 3D chart types with optimized performance
- ✅ Responsive image slider for login page

**Technical Breakthroughs:**
- Resolved WebGL compatibility issues across browsers
- Implemented intelligent data type detection for chart selection
- Created adaptive data sampling for large datasets
- Added progressive loading for complex 3D visualizations
- Enhanced user experience with seamless file-to-analysis transitions

**3D Visualization Features:**
- 3D Bar Charts with dynamic spacing and text positioning
- 3D Scatter Plots with intelligent marker sizing
- 3D Surface Plots with gradient coloring
- 3D Line Charts with smooth trend visualization
- 3D Area Charts with semi-transparent surfaces
- 3D Pie Charts with category elevation effects

### Week 4: UI/UX Refinement & AI Integration
**Major Achievements:**
- ✅ Resolved button styling conflicts across components
- ✅ Enhanced AI Insights component functionality
- ✅ Improved visual consistency of interactive elements
- ✅ Google Gemini AI integration for data analysis
- ✅ Natural language querying capabilities
- ✅ Advanced CSS architecture improvements

**Technical Optimizations:**
- Implemented utility classes for selective style overrides
- Created reusable style patterns for consistent appearance
- Enhanced responsive design for varying screen sizes
- Added AI-powered insights with contextual analysis
- Improved CSS selector specificity to prevent conflicts

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or Atlas account) - [Download here](https://www.mongodb.com/)
- **npm** or **yarn** package manager
- **Git** for version control

### 📥 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shanmugapriyar0/Excel_Analytics_Platform.git
   cd Excel_Analytics_Platform
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### 🔧 Environment Configuration

#### Setting Up Backend Environment
1. Create a `.env` file in the `backend` directory:
   ```bash
   cd backend
   touch .env  # On Windows: echo. > .env
   ```

2. Add the following environment variables to your `.env` file:
   ```env
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/excel_analytics_platform
   # For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/excel_analytics_platform

   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_very_long_and_random
   
   # SendGrid Email Configuration (for password reset)
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=your_verified_email@domain.com
   
   # Google Gemini AI Configuration
   GEMINI_API_KEY=your_google_gemini_api_key_here
   
   # Application Configuration
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   PORT=5000
   ```

#### 🔑 API Keys Setup Guide

**1. MongoDB Setup**
- **Local MongoDB**: Install MongoDB locally and use the default connection string
- **MongoDB Atlas**: 
  - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
  - Create a free account and cluster
  - Get your connection string from the "Connect" button
  - Replace `<username>` and `<password>` with your database credentials

**2. JWT Secret Generation**
Generate a secure JWT secret using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**3. SendGrid Configuration** (for email functionality)
- Visit [SendGrid](https://sendgrid.com/) and create a free account
- Navigate to Settings → API Keys
- Create a new API key with "Mail Send" permissions
- Verify a sender email address in Settings → Sender Authentication
- Use the verified email as `SENDGRID_FROM_EMAIL`

**4. Google Gemini AI Setup** (for AI insights)
- Go to [Google AI Studio](https://aistudio.google.com/)
- Create a new project or use an existing one
- Generate an API key for Gemini AI
- Copy the API key to your `.env` file

### 🚀 Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # Development mode with auto-restart:
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Create a new account or use the login functionality
   - Start uploading and analyzing your Excel files!

## 📁 Project Structure

```
Excel_Analytics_Platform/
├── 📁 backend/                    # Backend API server
│   ├── 📁 controllers/            # Request handlers
│   ├── 📁 middleware/             # Authentication & validation
│   ├── 📁 models/                 # Database schemas
│   │   ├── 📄 User.js            # User authentication model
│   │   ├── 📄 ExcelFile.js       # File metadata model
│   │   └── 📄 Activity.js        # User activity tracking
│   ├── 📁 routes/                 # API route definitions
│   │   ├── 📄 authRoutes.js      # Authentication endpoints
│   │   ├── 📄 excelRoutes.js     # File handling endpoints
│   │   └── 📄 userRoutes.js      # User management endpoints
│   ├── 📁 services/               # External service integrations
│   │   └── 📄 geminiService.js   # AI analysis service
│   ├── 📁 utils/                  # Utility functions
│   ├── 📁 uploads/                # File storage directory
│   ├── 📄 index.js               # Express server entry point
│   ├── 📄 package.json           # Backend dependencies
│   └── 📄 .env                   # Environment variables
├── 📁 frontend/                   # React frontend application
│   ├── 📁 public/                 # Static assets
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📄 Dashboard.js   # Main dashboard
│   │   │   ├── 📄 FileUpload.js  # File upload interface
│   │   │   ├── 📄 AIInsights.js  # AI analysis display
│   │   │   ├── 📄 ThreeDChart.js # 3D visualization
│   │   │   ├── 📄 Login.js       # Authentication forms
│   │   │   └── 📄 Signup.js      # User registration
│   │   ├── 📁 redux/              # State management
│   │   │   ├── 📄 store.js       # Redux store configuration
│   │   │   └── 📄 authSlice.js   # Authentication state
│   │   ├── 📁 css/                # Stylesheets
│   │   │   ├── 📄 index.css      # Global styles
│   │   │   ├── 📄 dashboard.css  # Dashboard styles
│   │   │   └── 📄 responsive.css # Responsive design
│   │   ├── 📄 App.js             # Main application component
│   │   └── 📄 index.js           # React entry point
│   ├── 📄 package.json           # Frontend dependencies
│   └── 📄 vite.config.js         # Vite configuration
├── 📄 README.md                   # Project documentation
└── 📄 .gitignore                 # Git ignore rules
```

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/signup          # Register new user
POST /api/auth/login           # User authentication
POST /api/auth/forgot-password # Request password reset
POST /api/auth/reset-password  # Reset password with token
GET  /api/auth/verify-token    # Verify JWT token validity
```

### File Management Endpoints
```
POST /api/excel/upload         # Upload Excel/CSV files
GET  /api/excel/files          # Get user's uploaded files
GET  /api/excel/download/:id   # Download specific file
DELETE /api/excel/delete/:id   # Delete uploaded file
POST /api/excel/analyze        # Analyze file data with AI
```

### User Management Endpoints
```
GET  /api/user/profile         # Get user profile
PUT  /api/user/profile         # Update user profile
GET  /api/user/activity        # Get user activity log
```

## 🎯 Features in Detail

### File Upload & Processing
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Multiple Format Support**: Excel (.xlsx, .xls) and CSV files
- **Large File Handling**: GridFS integration for files exceeding 16MB
- **Real-time Progress**: Live upload progress with percentage display
- **File Validation**: Automatic format and size validation
- **Preview Generation**: Instant data preview after upload

### AI-Powered Analytics
- **Natural Language Queries**: Ask questions about your data in plain English
- **Automated Insights**: Get intelligent analysis without manual configuration
- **Pattern Recognition**: Discover hidden trends and correlations
- **Statistical Analysis**: Comprehensive statistical summaries
- **Contextual Recommendations**: AI suggests relevant analysis approaches

### Advanced Visualizations
- **Interactive 3D Charts**: Rotate, zoom, and explore your data in three dimensions
- **Multiple Chart Types**: Bar, scatter, surface, line, area, and pie charts
- **Performance Optimized**: Handles large datasets with intelligent sampling
- **Responsive Design**: Charts adapt to different screen sizes
- **Custom Styling**: Consistent color schemes and professional appearance

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Notifications**: Instant feedback on user actions
- **Persistent Sessions**: Remember user preferences and selections
- **Loading States**: Clear indication of processing status
- **Error Handling**: Graceful error messages and recovery options

## 🛠️ Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
```

### Frontend Scripts
```bash
npm start        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔍 Troubleshooting

### Common Issues and Solutions

**1. MongoDB Connection Error**
```bash
# Ensure MongoDB is running
# Windows: Start MongoDB service
# macOS/Linux: sudo systemctl start mongod
```

**2. Port Already in Use**
```bash
# Kill process on port 5000 (backend)
# Windows: netstat -ano | findstr :5000 && taskkill /PID <PID> /F
# macOS/Linux: lsof -ti:5000 | xargs kill -9
```

**3. File Upload Issues**
- Check if `uploads/` directory exists in backend
- Verify MongoDB GridFS configuration
- Ensure sufficient disk space

**4. AI Analysis Not Working**
- Verify Gemini API key is valid and has quota
- Check internet connectivity
- Review API key permissions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/shanmugapriyar0/Excel_Analytics_Platform.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **MongoDB** for the robust database solution
- **Google** for the powerful Gemini AI integration
- **Plotly** for the incredible 3D visualization capabilities
- **SendGrid** for reliable email services
- **Open Source Community** for the countless libraries that made this possible

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/shanmugapriyar0/Excel_Analytics_Platform/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce
4. Provide system information (OS, Node.js version, etc.)

---

**Built with ❤️ by the Excel Analytics Platform Team**

*Making data analysis accessible and insightful for everyone*

