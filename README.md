# Excel Analytics Platform

A web application for uploading, parsing, and analyzing Excel and CSV data with a modern dashboard interface.

## Overview

Excel Analytics Platform is a full-stack web application that allows users to upload Excel/CSV files, parse their data, and store structured information in MongoDB. The application features user authentication, role-based access control, and a responsive dashboard UI.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Role-Based Access Control**: Different permissions for users and administrators
- **Modern Dashboard UI**: Responsive sidebar layout with dark/green theme
- **Excel File Management**:
  - Upload Excel/CSV files with drag-and-drop functionality
  - Preview parsed data before storage
  - Handle large files using GridFS (beyond MongoDB's 16MB limit)
  - Download uploaded files
- **Data Visualization**: View and analyze uploaded data (coming soon)

## Technical Implementation

### Frontend (React)

- React with Redux for state management
- Responsive design with custom CSS
- File upload with drag-and-drop using React hooks
- Data preview functionality

### Backend (Node.js)

- Express.js REST API
- MongoDB with Mongoose ODM
- JWT authentication for secure API access
- GridFS for handling large file storage
- Excel parsing using XLSX library

## File Structure

```
backend/
  ├── models/
  │   ├── User.js
  │   └── ExcelFile.js
  ├── routes/
  │   ├── authRoutes.js
  │   └── excelRoutes.js
  ├── uploads/
  ├── temp-uploads/
  └── index.js

frontend/
  ├── public/
  └── src/
      ├── components/
      │   ├── Dashboard.js
      │   ├── FileUpload.js
      │   ├── Login.js
      │   ├── Signup.js
      │   └── Notification.js
      ├── redux/
      │   ├── authSlice.js
      │   └── store.js
      └── App.js
```

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB
- Git

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies: `npm install`
4. Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/myauthdb
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
5. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Usage

1. Register a new user account
2. Log in with your credentials
3. Navigate the dashboard to access different features
4. Upload Excel/CSV files using the File Upload section
5. View parsed data and manage your uploaded files

## Recent Updates (May 6, 2025)

- Added advanced dashboard UI with a modern sidebar layout and responsive design
- Implemented Excel/CSV file upload with drag-and-drop functionality
- Created backend integration using GridFS for handling large files (beyond MongoDB's 16MB limit)
- Added preview functionality for uploaded Excel data
- Fixed JWT authentication issues for file upload endpoints

## Known Issues

- Files larger than 100MB should be handled with care to avoid Git repository issues
- Large Excel files may cause MongoDB document size limit errors if not properly chunked

## Next Steps

- Implement data visualization for uploaded Excel files
- Add batch processing capabilities for multiple files
- Create user permissions for file access control
- Add data analysis tools and reporting features

