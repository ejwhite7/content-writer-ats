#!/bin/bash

# Setup GitHub Repository for Content Writer ATS
# This script will initialize git, create the GitHub repo, and push the code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Repository details
REPO_NAME="content-writer-ats"
REPO_DESCRIPTION="A comprehensive ATS platform for hiring content writers with AI-powered assessment capabilities"

print_status "Setting up GitHub repository: $REPO_NAME"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    echo "Or run: brew install gh"
    exit 1
fi

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    print_error "Not logged in to GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

print_success "GitHub CLI is ready"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    git init
    print_success "Git repository initialized"
else
    print_warning "Git repository already exists"
fi

# Set up git config (if not set)
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    print_warning "Git user config not set. Please configure git:"
    echo "git config --global user.name 'Your Name'"
    echo "git config --global user.email 'your.email@example.com'"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    print_warning "Git remote 'origin' already exists:"
    git remote get-url origin
    read -p "Do you want to continue? This will overwrite the remote. (y/N): " continue_setup
    if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
fi

# Create GitHub repository
print_status "Creating GitHub repository..."
if gh repo create "$REPO_NAME" --public --description "$REPO_DESCRIPTION" --clone=false; then
    print_success "GitHub repository created: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
else
    print_error "Failed to create GitHub repository"
    print_warning "Repository might already exist. Checking..."
    
    # Check if repo exists
    if gh repo view "$REPO_NAME" &> /dev/null; then
        print_warning "Repository already exists. Continuing with existing repository..."
    else
        print_error "Repository creation failed for unknown reason"
        exit 1
    fi
fi

# Add remote origin
print_status "Setting up git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git"
print_success "Git remote added"

# Create initial commit
print_status "Staging files for commit..."

# Add all files
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    print_status "Creating initial commit..."
    git commit -m "🚀 Initial commit: Complete ATS Platform for Content Writers

Features:
✅ Next.js 14 with TypeScript
✅ Supabase database with multi-tenant architecture  
✅ Clerk authentication with role-based access
✅ AI-powered assessment scoring with Anthropic
✅ Real-time messaging system
✅ Email notifications with Resend
✅ Redis caching and session management
✅ Sentry error monitoring
✅ Cloudflare security integration
✅ Comprehensive testing suite
✅ Production deployment ready

🤖 Generated with Claude Code
https://claude.ai/code

Co-Authored-By: Claude <noreply@anthropic.com>"

    print_success "Initial commit created"
fi

# Push to GitHub
print_status "Pushing code to GitHub..."
git branch -M main
git push -u origin main

print_success "Code successfully pushed to GitHub!"

# Set up repository settings
print_status "Configuring repository settings..."

# Enable issues and projects
gh repo edit "$REPO_NAME" --enable-issues --enable-projects

# Add topics/tags
gh repo edit "$REPO_NAME" --add-topic "nextjs" \
    --add-topic "typescript" \
    --add-topic "supabase" \
    --add-topic "ats" \
    --add-topic "hiring" \
    --add-topic "ai" \
    --add-topic "content-writing" \
    --add-topic "clerk" \
    --add-topic "vercel" \
    --add-topic "anthropic"

print_success "Repository topics added"

# Create initial issues for setup
print_status "Creating initial setup issues..."

gh issue create --title "🚀 Initial Setup and Configuration" --body "## Initial Setup Tasks

This issue tracks the initial setup tasks for the ATS platform:

### Environment Setup
- [ ] Create Supabase production project
- [ ] Set up Clerk authentication
- [ ] Configure Anthropic API access
- [ ] Set up Resend email service
- [ ] Configure Redis (Upstash)
- [ ] Set up Sentry monitoring
- [ ] Configure Cloudflare security

### Deployment
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Configure webhooks

### Testing
- [ ] Run test suite
- [ ] Test all user flows
- [ ] Performance testing
- [ ] Security testing

### Documentation
- [ ] Update README with live demo links
- [ ] Create user documentation
- [ ] Document admin procedures

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions." --label "setup" --label "documentation"

gh issue create --title "🧪 Set up CI/CD Pipeline" --body "## CI/CD Pipeline Setup

Set up automated testing and deployment pipeline:

### GitHub Actions
- [ ] Set up test automation
- [ ] Add linting and type checking
- [ ] Configure E2E test runs
- [ ] Set up security scanning
- [ ] Add dependency updates (Dependabot)

### Deployment Automation
- [ ] Automatic deployments on main branch
- [ ] Preview deployments for PRs
- [ ] Rollback procedures
- [ ] Environment promotion

### Monitoring
- [ ] Health check monitoring
- [ ] Performance monitoring
- [ ] Error alerting
- [ ] Usage analytics" --label "ci-cd" --label "enhancement"

gh issue create --title "📊 Analytics and Monitoring Setup" --body "## Analytics and Monitoring

Implement comprehensive monitoring for the production system:

### Application Monitoring
- [ ] Set up application performance monitoring
- [ ] Configure error tracking and alerting
- [ ] Implement user analytics
- [ ] Set up uptime monitoring

### Business Metrics
- [ ] Track application submissions
- [ ] Monitor AI scoring accuracy
- [ ] Measure time-to-hire metrics
- [ ] User engagement analytics

### Security Monitoring
- [ ] Security event monitoring
- [ ] Rate limit monitoring
- [ ] Failed authentication tracking
- [ ] Vulnerability scanning" --label "monitoring" --label "analytics"

print_success "Initial issues created"

# Display summary
echo ""
echo "🎉 Repository setup complete!"
echo ""
echo "📋 Summary:"
echo "   Repository: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo "   Branch: main"
echo "   Files: $(git ls-files | wc -l | tr -d ' ') files committed"
echo "   Issues: 3 setup issues created"
echo ""
echo "🔧 Next Steps:"
echo "   1. Visit your repository on GitHub"
echo "   2. Review and close the setup issues as you complete them"
echo "   3. Follow the DEPLOYMENT_GUIDE.md for production deployment"
echo "   4. Set up branch protection rules (recommended)"
echo "   5. Configure team access if needed"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview and features"
echo "   - DEPLOYMENT_GUIDE.md - Complete deployment instructions"
echo "   - docs/ - Additional documentation"
echo ""
echo "🚀 Ready to deploy!"

# Open repository in browser (optional)
read -p "Open repository in browser? (y/N): " open_browser
if [[ "$open_browser" =~ ^[Yy]$ ]]; then
    gh repo view --web
fi

print_success "GitHub repository setup completed successfully!"