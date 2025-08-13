import { test, expect } from '@playwright/test'

test.describe('Job Board', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the job board
    await page.goto('/')
  })

  test('should display the job board homepage', async ({ page }) => {
    // Check for main heading
    await expect(page.locator('h1')).toContainText(/Find Your Next/i)
    
    // Check for search functionality
    await expect(page.locator('[data-testid="job-search"]')).toBeVisible()
    
    // Check for filter options
    await expect(page.locator('[data-testid="job-filters"]')).toBeVisible()
  })

  test('should be able to search for jobs', async ({ page }) => {
    // Enter search term
    const searchInput = page.locator('[data-testid="job-search"] input')
    await searchInput.fill('content writer')
    await searchInput.press('Enter')

    // Wait for search results
    await page.waitForLoadState('networkidle')
    
    // Check that jobs are filtered
    const jobCards = page.locator('[data-testid="job-card"]')
    if (await jobCards.count() > 0) {
      await expect(jobCards.first()).toContainText(/content writer/i)
    }
  })

  test('should be able to filter jobs by type', async ({ page }) => {
    // Open job type filter
    const jobTypeFilter = page.locator('[data-testid="job-type-filter"]')
    await jobTypeFilter.click()
    
    // Select full-time option
    await page.locator('text=Full Time').click()
    
    // Wait for results to update
    await page.waitForLoadState('networkidle')
    
    // Check that jobs are filtered
    const jobCards = page.locator('[data-testid="job-card"]')
    if (await jobCards.count() > 0) {
      await expect(jobCards.first()).toContainText('Full Time')
    }
  })

  test('should display job details when clicking on a job card', async ({ page }) => {
    const jobCards = page.locator('[data-testid="job-card"]')
    
    if (await jobCards.count() > 0) {
      // Click on the first job card
      await jobCards.first().click()
      
      // Should navigate to job details page
      await expect(page).toHaveURL(/\/jobs\/[^\/]+$/)
      
      // Check for job details elements
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="job-description"]')).toBeVisible()
      await expect(page.locator('[data-testid="apply-button"]')).toBeVisible()
    }
  })

  test('should show pagination when there are many jobs', async ({ page }) => {
    // Check if pagination is present (only if there are enough jobs)
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible()) {
      const nextButton = page.locator('[data-testid="pagination-next"]')
      if (await nextButton.isEnabled()) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')
        
        // URL should change to reflect new page
        await expect(page).toHaveURL(/page=2/)
      }
    }
  })

  test('should handle empty search results gracefully', async ({ page }) => {
    // Search for something that likely won't exist
    const searchInput = page.locator('[data-testid="job-search"] input')
    await searchInput.fill('xyznonexistentjob123')
    await searchInput.press('Enter')
    
    await page.waitForLoadState('networkidle')
    
    // Should show no results message
    await expect(page.locator('text=No jobs found')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that the layout adapts
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()
    
    // Job cards should stack vertically
    const jobCards = page.locator('[data-testid="job-card"]')
    if (await jobCards.count() > 1) {
      const firstCard = jobCards.first()
      const secondCard = jobCards.nth(1)
      
      const firstCardBox = await firstCard.boundingBox()
      const secondCardBox = await secondCard.boundingBox()
      
      if (firstCardBox && secondCardBox) {
        expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 10)
      }
    }
  })
})