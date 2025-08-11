# Intelligent Library Management System - Frontend

A Vue.js frontend application for an intelligent library management system.

## **Prerequisites!!!**

- **Node.js**: Version 16.x 
- **npm**: Version 8.x 
- **Vue**: npm install vue-template-compiler@2.x.x --save-dev

## Installation

1. Clone the repository:
```bash
git clone https://github.com/wanghanjun-code/Intelligent-library-management-system-frontend.git

cd Intelligent-library-management-system-frontend
```

2. Install dependencies:
```bash
// Please ensure the Node version is 16. If you are using a Mac, you can switch to version 16 by running   nvm use 16.

npm install
```

## Running the Project

```bash
npm run dev
```

## Access the Application

Once the development server is running, open your browser and navigate to:
```
http://localhost:21091
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── admin/         # Admin panel views
│   ├── user/          # User views
│   ├── login/         # Authentication views
│   └── register/      # Registration views
├── router/             # Vue Router configuration
├── utils/              # Utility functions
└── assets/             # Static assets (CSS, images)
```

## Features

- **User Management**: Registration, login, profile management
- **Book Management**: Browse, search, order, and manage books
- **Admin Panel**: Comprehensive administrative tools
- **AI Assistant**: Integrated AI chat functionality
- **Responsive Design**: Modern UI with Element UI components

## Development

The project uses:
- **Vue CLI** for project scaffolding
- **Webpack** for module bundling
- **SCSS** for styling
- **ESLint** for code quality

