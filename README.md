# Think41 Chat Application

A full-stack chat application built with React frontend and Node.js/Express backend with SQLite database.

## Features

- 🔐 User authentication (register/login)
- 💬 Real-time chat interface
- 🛡️ JWT-based authentication
- 📱 Responsive design
- 🔒 Secure API endpoints
- ⚡ Rate limiting and security headers

## Project Structure

```
think41/
├── backend/                 # Node.js/Express server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main app component
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env file with your configuration
# Make sure to set a strong JWT_SECRET

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 3. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Chat
- `POST /api/chat` - Send a message (protected)

### Health
- `GET /api/health` - Server health check

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS configuration
- SQL injection protection with Sequelize

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Start React development server
```

## Database

The application uses SQLite as the database. The database file (`database.sqlite`) will be created automatically when you first run the server.

### Models
- **User**: Stores user information and authentication data
- **Conversation**: Chat conversations (planned)
- **Message**: Individual messages (planned)
- **Product**: Product information (planned)
- **Order**: Order management (planned)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in your .env file
2. **Database connection error**: Make sure the backend directory has write permissions
3. **CORS errors**: Verify the CORS_ORIGIN in your .env file matches your frontend URL
4. **JWT errors**: Ensure JWT_SECRET is set in your .env file

### Logs

Check the console output for detailed error messages. The server logs all requests and errors.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment variables
2. Use a strong, unique JWT_SECRET
3. Configure proper CORS origins
4. Use a production database (PostgreSQL, MySQL, etc.)
5. Set up proper logging
6. Configure HTTPS
7. Set up environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 