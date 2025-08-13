#!/bin/bash

# Test runner script for the ATS Platform
# Runs different types of tests based on the environment and parameters

set -e  # Exit on any error

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

# Default values
TEST_TYPE="all"
COVERAGE=false
WATCH=false
CI_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --type TYPE     Test type: unit, integration, e2e, all (default: all)"
            echo "  --coverage      Generate coverage report"
            echo "  --watch         Run tests in watch mode"
            echo "  --ci            Run in CI mode (no interactive prompts)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Starting test suite for ATS Platform"
echo "Test type: $TEST_TYPE"
echo "Coverage: $COVERAGE"
echo "Watch mode: $WATCH"
echo "CI mode: $CI_MODE"
echo ""

# Check if required dependencies are installed
if [ ! -d "node_modules" ]; then
    print_error "Dependencies not installed. Run 'npm install' first."
    exit 1
fi

# Set environment variables for testing
export NODE_ENV=test
export NEXT_TELEMETRY_DISABLED=1

# Create test directories if they don't exist
mkdir -p coverage
mkdir -p test-results

run_unit_tests() {
    print_status "Running unit tests..."
    
    if [ "$WATCH" = true ]; then
        npm run test:watch
    elif [ "$COVERAGE" = true ]; then
        npm run test:coverage
    else
        npm run test
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

run_e2e_tests() {
    print_status "Running E2E tests..."
    
    # Check if development server is running
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_warning "Development server not running. E2E tests may fail."
        
        if [ "$CI_MODE" = false ]; then
            read -p "Start development server? (y/N): " start_server
            if [[ "$start_server" =~ ^[Yy]$ ]]; then
                print_status "Starting development server..."
                npm run dev &
                DEV_SERVER_PID=$!
                
                # Wait for server to start
                for i in {1..30}; do
                    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
                        print_success "Development server started"
                        break
                    fi
                    sleep 1
                done
            else
                print_warning "Skipping E2E tests (no dev server)"
                return 0
            fi
        else
            print_error "Development server required for E2E tests in CI"
            return 1
        fi
    fi
    
    # Install Playwright browsers if needed
    if [ ! -d "node_modules/@playwright/test" ]; then
        print_status "Installing Playwright browsers..."
        npx playwright install
    fi
    
    # Run E2E tests
    if [ "$CI_MODE" = true ]; then
        npm run test:e2e -- --reporter=json
    else
        npm run test:e2e
    fi
    
    local exit_code=$?
    
    # Cleanup development server if we started it
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server..."
        kill $DEV_SERVER_PID
    fi
    
    if [ $exit_code -eq 0 ]; then
        print_success "E2E tests passed"
        return 0
    else
        print_error "E2E tests failed"
        return 1
    fi
}

run_lint_and_typecheck() {
    print_status "Running linting and type checking..."
    
    # Run ESLint
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        return 1
    fi
    
    # Run TypeScript type checking
    if npm run type-check; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        return 1
    fi
    
    return 0
}

# Main test execution
case $TEST_TYPE in
    unit)
        run_unit_tests
        exit_code=$?
        ;;
    e2e)
        run_e2e_tests
        exit_code=$?
        ;;
    lint)
        run_lint_and_typecheck
        exit_code=$?
        ;;
    all)
        # Run all tests in sequence
        print_status "Running complete test suite..."
        
        # Lint and type check first
        if ! run_lint_and_typecheck; then
            print_error "Pre-checks failed, stopping test suite"
            exit 1
        fi
        
        # Unit tests
        if ! run_unit_tests; then
            print_error "Unit tests failed"
            exit_code=1
        else
            exit_code=0
        fi
        
        # E2E tests (only if unit tests passed and not in watch mode)
        if [ $exit_code -eq 0 ] && [ "$WATCH" = false ]; then
            if ! run_e2e_tests; then
                print_error "E2E tests failed"
                exit_code=1
            fi
        fi
        ;;
    *)
        print_error "Unknown test type: $TEST_TYPE"
        exit 1
        ;;
esac

# Print summary
echo ""
print_status "Test Summary"
echo "============"

if [ $exit_code -eq 0 ]; then
    print_success "All tests passed! 🎉"
    
    if [ "$COVERAGE" = true ] && [ -d "coverage" ]; then
        echo ""
        print_status "Coverage report generated in coverage/"
        
        if command -v open &> /dev/null && [ "$CI_MODE" = false ]; then
            read -p "Open coverage report? (y/N): " open_coverage
            if [[ "$open_coverage" =~ ^[Yy]$ ]]; then
                open coverage/lcov-report/index.html
            fi
        fi
    fi
    
    if [ -d "playwright-report" ] && [ "$CI_MODE" = false ]; then
        echo ""
        print_status "E2E test report available in playwright-report/"
    fi
    
else
    print_error "Some tests failed"
    echo ""
    echo "Check the output above for details on which tests failed."
    echo "Run specific test types with --type [unit|e2e|lint]"
fi

exit $exit_code