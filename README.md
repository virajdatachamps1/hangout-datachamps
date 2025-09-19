# DataChamps Hangout - Team Intranet Platform

A modern, feature-rich intranet platform built for DataChamps team collaboration, task management, and team celebrations.

## 🌟 Features

- **User Authentication**: Secure login with Clerk, restricted to @datachamps.ai emails
- **Task Management**: Kanban-style board with todo, in-progress, and completed columns
- **Kudos System**: Send and receive recognition to team members
- **Celebrations**: Track birthdays, work anniversaries, and company events
- **Dashboard**: Real-time overview of tasks, recent activity, and team updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

The application is deployed at: `https://yourusername.github.io/datachamps-hangout/`

## 📁 Project Structure

```
datachamps-hangout/
├── index.html                 # Dashboard page
├── tasks.html                 # Task management
├── kudos.html                 # Kudos system
├── celebrations.html          # Team celebrations
├── training.html              # Training calendar
├── photos.html               # Company photos
├── sop.html                  # SOPs & Policies
├── css/
│   └── style.css             # Main stylesheet
├── js/
│   ├── app.js               # Main application logic
│   ├── auth.js              # Authentication management
│   └── api.js               # Backend API integration
├── assets/
│   ├── images/              # Logo and images
│   └── photos/              # Company photos
├── docs/
│   ├── google-apps-script/  # Backend code
│   └── deployment-steps.md  # Deployment guide
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icons
- **Clerk** - Authentication

### Backend
- **Google Apps Script** - Serverless backend
- **Google Sheets** - Database
- **RESTful API** - Clean API design

### Deployment
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - Automated deployment

## 🔧 Setup and Installation

### Prerequisites
- GitHub account
- Google account
- Clerk account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/datachamps-hangout.git
cd datachamps-hangout
```

### 2. Google Sheets Setup
1. Create a new Google Spreadsheet
2. Add tabs: `Users`, `Tasks`, `Kudos`, `Celebrations`
3. Add column headers as specified in deployment guide
4. Copy the spreadsheet ID from the URL

### 3. Google Apps Script Setup
1. Go to [script.google.com](https://script.google.com)
2. Create new project: "DataChamps Hangout Backend"
3. Copy all `.gs` files from `docs/google-apps-script/`
4. Set script properties:
   - `SPREADSHEET_ID`: Your Google Sheets ID
   - `CLERK_JWT_KEY`: Your Clerk JWT key
5. Deploy as web app with public access
6. Copy the web app URL

### 4. Clerk Configuration
1. Create a new Clerk application
2. Configure email domain restriction to `@datachamps.ai`
3. Add your GitHub Pages domain to allowed domains
4. Copy your publishable key

### 5. Frontend Configuration
1. Update `js/api.js`:
   ```javascript
   const API_BASE_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
   ```

2. Update `js/auth.js`:
   ```javascript
   const CLERK_PUBLISHABLE_KEY = 'YOUR_CLERK_PUBLISHABLE_KEY';
   ```

### 6. GitHub Pages Deployment
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Set source to "Deploy from branch
