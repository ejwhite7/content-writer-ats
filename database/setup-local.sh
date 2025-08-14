#!/bin/bash

# ATS Platform Local Database Setup Script
# This script sets up the database schema for local development

set -e

echo "🚀 Setting up ATS Platform Database for Local Development..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing now..."
    brew install supabase/tap/supabase
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📊 Starting Supabase local services..."

# Start Supabase if not already running
if ! supabase status &> /dev/null; then
    supabase start
else
    echo "  ✅ Supabase is already running"
fi

echo "🔄 Applying database migrations..."

# Reset database and apply migrations
supabase db reset

echo "🎉 Database setup complete!"
echo ""
echo "📋 Your local ATS platform is ready:"
echo "  🌐 API URL: http://127.0.0.1:54321"
echo "  📊 Studio URL: http://127.0.0.1:54323"
echo "  📧 Inbucket (Email): http://127.0.0.1:54324"
echo "  💾 Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "🔗 Useful commands:"
echo "  - Start Supabase: supabase start"
echo "  - Stop Supabase: supabase stop"
echo "  - Reset database: supabase db reset"
echo "  - View logs: supabase logs"
echo "  - Check status: supabase status"
echo ""
echo "✅ Setup complete! You can now run 'npm run dev' to start your application."
