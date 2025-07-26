#!/bin/bash

echo "🚀 Setting up Think41 Chat Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
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
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

cd ..

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
npm install

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Make sure to update the JWT_SECRET in backend/.env for production!" 