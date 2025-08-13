#!/bin/bash

# ATS Platform Database Setup Script
# This script sets up the complete database schema for the ATS platform

set -e

echo "🚀 Setting up ATS Platform Database Schema..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're linked to a Supabase project
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ No Supabase project linked. Please run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📊 Creating database schema..."

# Run database migrations in order
echo "  1️⃣ Creating core tables and functions..."
supabase db push --file database/01_create_tables.sql

echo "  2️⃣ Setting up Row Level Security policies..."
supabase db push --file database/02_row_level_security.sql

echo "  3️⃣ Configuring storage buckets..."
supabase db push --file database/03_storage_buckets.sql

echo "  4️⃣ Installing AI scoring functions..."
supabase db push --file database/04_ai_scoring_functions.sql

echo "  5️⃣ Adding Supabase functions..."
supabase db push --file database/06_supabase_functions.sql

echo "  6️⃣ Inserting seed data..."
supabase db push --file database/05_seed_data.sql

echo "📦 Creating storage buckets..."

# Create storage buckets
echo "  📄 Creating resumes bucket..."
supabase storage create-bucket resumes --public=false || echo "  ⚠️ Resumes bucket may already exist"

echo "  🎨 Creating portfolios bucket..."
supabase storage create-bucket portfolios --public=false || echo "  ⚠️ Portfolios bucket may already exist"

echo "  📝 Creating assessments bucket..."
supabase storage create-bucket assessments --public=false || echo "  ⚠️ Assessments bucket may already exist"

echo "  📎 Creating attachments bucket..."
supabase storage create-bucket attachments --public=false || echo "  ⚠️ Attachments bucket may already exist"

echo "  🏷️ Creating branding bucket..."
supabase storage create-bucket branding --public=true || echo "  ⚠️ Branding bucket may already exist"

echo "🔧 Generating TypeScript types..."

# Generate TypeScript types
if [ -f "package.json" ]; then
    if npm run db:generate 2>/dev/null; then
        echo "  ✅ TypeScript types generated successfully"
    else
        echo "  ⚠️ Could not generate TypeScript types. Run 'npm run db:generate' manually"
    fi
else
    echo "  ⚠️ No package.json found. Generate types manually with:"
    echo "     supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts"
fi

echo "🔍 Verifying setup..."

# Verify setup by checking if key tables exist
echo "  📋 Checking core tables..."
supabase db remote ls tables | grep -E "tenants|users|jobs|applications|assessments" > /dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Core tables created successfully"
else
    echo "  ❌ Some core tables are missing"
fi

echo "  📊 Checking sample data..."
supabase db remote sql "SELECT COUNT(*) FROM tenants" > /dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Sample data loaded successfully"
else
    echo "  ❌ Sample data not loaded properly"
fi

echo "  🔐 Checking RLS policies..."
supabase db remote sql "SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('tenants', 'users', 'jobs', 'applications')" > /dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ RLS policies applied successfully"
else
    echo "  ❌ RLS policies not applied properly"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update your .env.local with Supabase credentials"
echo "  2. Configure Clerk authentication"
echo "  3. Set up Resend for email notifications"
echo "  4. Configure Anthropic API for AI scoring"
echo ""
echo "🔗 Useful commands:"
echo "  - Reset database: supabase db reset"
echo "  - View logs: supabase logs"
echo "  - Generate types: npm run db:generate"
echo "  - Start local dev: supabase start"
echo ""
echo "📖 See database/README.md for detailed documentation"
echo ""
echo "✅ Setup complete! Your ATS platform database is ready to use."
