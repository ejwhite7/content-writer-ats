#!/bin/bash

# Deployment script for Vercel
# This script handles the complete deployment process with all necessary checks

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    echo "Please install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

print_success "Vercel CLI is ready"

# Check for required files
required_files=(".env.production.local" "next.config.js" "vercel.json")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_warning "Missing $file"
        if [[ "$file" == ".env.production.local" ]]; then
            echo "Please copy .env.production.example to .env.production.local and configure it"
        fi
    else
        print_success "Found $file"
    fi
done

# Run pre-deployment checks
print_status "Running pre-deployment checks..."

# Type checking
print_status "Running TypeScript type check..."
if npm run type-check; then
    print_success "TypeScript types are valid"
else
    print_error "TypeScript type check failed"
    exit 1
fi

# Linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting issues found - continuing with deployment"
fi

# Build test
print_status "Testing production build..."
if npm run build; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Clean build artifacts (Vercel will rebuild)
rm -rf .next

print_success "All pre-deployment checks passed"

# Environment validation
print_status "Validating environment variables..."

required_env_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "ANTHROPIC_API_KEY"
    "RESEND_API_KEY"
    "SENTRY_DSN"
)

missing_vars=()
for var in "${required_env_vars[@]}"; do
    if [[ -z "${!var}" ]] && ! grep -q "^$var=" .env.production.local 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    print_warning "Missing environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    echo "Make sure to set these in your Vercel project settings or .env.production.local"
fi

# Choose deployment type
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (default)"
echo "2) Production deployment"
read -p "Enter your choice (1 or 2): " deployment_choice

case $deployment_choice in
    2)
        print_status "Deploying to production..."
        deployment_args="--prod"
        ;;
    *)
        print_status "Creating preview deployment..."
        deployment_args=""
        ;;
esac

# Deploy to Vercel
print_status "Deploying to Vercel..."
if deployment_url=$(vercel $deployment_args --confirm 2>&1); then
    print_success "Deployment successful!"
    
    # Extract deployment URL from output
    url=$(echo "$deployment_url" | grep -E 'https://.*\.vercel\.app' | tail -1 | sed 's/.*\(https:\/\/[^ ]*\.vercel\.app\).*/\1/')
    
    if [[ -n "$url" ]]; then
        print_success "Deployment URL: $url"
        
        # Wait a moment for deployment to be ready
        print_status "Waiting for deployment to be ready..."
        sleep 10
        
        # Test deployment health
        print_status "Testing deployment health..."
        if curl -s -f "$url/api/health" > /dev/null; then
            print_success "Deployment health check passed"
        else
            print_warning "Deployment health check failed - may need time to start up"
        fi
        
        # Open deployment in browser (optional)
        read -p "Open deployment in browser? (y/N): " open_browser
        if [[ "$open_browser" =~ ^[Yy]$ ]]; then
            if command -v open &> /dev/null; then
                open "$url"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$url"
            else
                echo "Please open $url manually"
            fi
        fi
    fi
    
else
    print_error "Deployment failed"
    echo "$deployment_url"
    exit 1
fi

# Post-deployment tasks
print_status "Running post-deployment tasks..."

# Set up Cloudflare (if configured)
if [[ -n "$CLOUDFLARE_API_TOKEN" ]] && [[ -n "$CLOUDFLARE_ZONE_ID" ]]; then
    print_status "Setting up Cloudflare security rules..."
    if npm run setup:cloudflare; then
        print_success "Cloudflare security configured"
    else
        print_warning "Cloudflare setup failed - check your configuration"
    fi
else
    print_warning "Cloudflare not configured - skipping security setup"
fi

print_success "🎉 Deployment completed successfully!"

echo ""
echo "📋 Deployment Summary:"
echo "   URL: ${url:-'Check Vercel dashboard'}"
echo "   Type: $([ "$deployment_choice" = "2" ] && echo "Production" || echo "Preview")"
echo "   Environment: Production"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test all functionality on the deployed application"
echo "   2. Configure your domain in Vercel dashboard (if production)"
echo "   3. Set up monitoring and alerts"
echo "   4. Configure Cloudflare DNS (if using custom domain)"
echo ""
print_success "Deployment script completed!"