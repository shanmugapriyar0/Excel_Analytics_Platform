# Excel Analytics Platform

Last Updated: 2 June, 2025

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
- Plotly.js for 3D data visualization

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

## Week 3 Progress

During Week 3, we focused on improving file handling, fixing critical bugs, and enhancing the user experience:

### Backend Improvements
- Fixed critical ObjectId constructor error in excelRoutes.js by properly using `new` keyword when creating MongoDB ObjectId instances
- Improved error handling for file deletion and download operations
- Enhanced GridFS integration for better file storage operations
- Added more robust token verification for file operations

### File Analysis Enhancements
- Implemented automatic file selection in analysis view for newly uploaded files
- Added persistent file selection using localStorage to maintain state between sessions
- Improved file metadata display with better formatting
- Created unified handling of both CSV and Excel files with appropriate icons

### User Interface Improvements
- Added distinctive styling for CSV files with orange icon to differentiate from Excel files (green)
- Enhanced dropdown menu functionality in the AnalyzeData component
- Added better empty state handling when no files are available
- Improved responsive design for file analysis on various screen sizes
- Added "No selection" messaging when files exist but none selected

### User Experience Flow
- Created seamless transition between file upload and analysis by:
  - Auto-saving the most recently uploaded file ID to localStorage
  - Automatically selecting this file when navigating to analysis view
  - Adding a direct "Analyze Files" button after successful upload
- Fixed console error messages for better debugging

### Styling Improvements
- Enhanced image responsiveness across all device sizes
- Improved container sizing for better display on larger screens
- Added responsive adjustments for 2K+ displays
- Fixed image scaling on mobile and smaller screens

## Final Day of Week 3

On the final day of Week 3, we successfully completed the advanced data visualization features, overcoming several technical challenges:

### 3D Visualization Implementation
- Successfully integrated Plotly.js for powerful 3D visualization capabilities
- Implemented six different 3D chart types:
  - 3D Bar Charts with dynamic spacing and optimized text label positioning
  - 3D Scatter Plots with intelligent marker sizing based on data distribution
  - 3D Surface Plots with gradient coloring for better data interpretation
  - 3D Line Charts with smooth curves for trend visualization
  - 3D Area Charts with semi-transparent surfaces for volume analysis
  - 3D Pie Charts with elevation for better category distinction

### Technical Challenges Overcome
- Fixed critical performance issues when rendering large datasets in 3D:
  - Implemented adaptive data sampling based on chart type
  - Created intelligent dataset size limits to prevent browser crashes
  - Added progressive loading for complex 3D visualizations
- Resolved WebGL compatibility issues across different browsers:
  - Added fallback rendering options for browsers with limited 3D support
  - Implemented graceful degradation for older browsers
- Fixed text rendering issues in 3D space:
  - Created custom text labels with proper positioning and visibility
  - Added shadow effects to ensure text legibility against various backgrounds

### Chart Data Processing Improvements
- Developed intelligent data type detection for automatic chart selection
- Implemented data normalization algorithms for consistent visualization scales
- Added support for handling mixed data types (text and numeric) in 3D visualizations
- Created smart axis mapping to represent categorical data in 3D space

### UI/UX Enhancements
- Implemented a user-friendly interface for switching between 2D and 3D visualizations
- Added informative warnings when selected data isn't optimal for the chosen chart type
- Created custom tooltips for 3D charts with detailed data point information
- Implemented intuitive camera controls for 3D chart exploration
- Added performance warnings when visualizing large datasets

### Code Architecture Improvements
- Refactored chart rendering code for better maintainability
- Created a reusable ThreeDChart component to handle all 3D visualization types
- Implemented proper error boundary handling to prevent rendering failures
- Enhanced prop validation for more robust component interaction

## Next Steps
- Implement data filtering capabilities
- Create data export functionality for visualizations
- Add user file management features (rename, delete, organize)
- Implement collaborative features for team analysis
- Add batch processing capabilities for multiple files
- Create user permissions for file access control

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
