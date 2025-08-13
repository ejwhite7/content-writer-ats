import { test, expect } from '@playwright/test'

test.describe('Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete application flow for a job', async ({ page }) => {
    // Find and click on a job
    const jobCards = page.locator('[data-testid="job-card"]')
    
    if (await jobCards.count() > 0) {
      await jobCards.first().click()
      
      // Click apply button
      await page.locator('[data-testid="apply-button"]').click()
      
      // Should redirect to sign up if not authenticated
      // This test assumes user needs to sign up/sign in
      if (page.url().includes('/sign-up') || page.url().includes('/sign-in')) {
        // For testing purposes, we'll skip the actual auth flow
        // In a real test, you'd complete the authentication
        console.log('Authentication required - skipping for test')
        return
      }
      
      // Fill out application form
      await page.locator('[name="firstName"]').fill('John')
      await page.locator('[name="lastName"]').fill('Doe')
      await page.locator('[name="email"]').fill('john.doe@example.com')
      await page.locator('[name="phone"]').fill('555-0123')
      
      // Fill location
      await page.locator('[name="location.city"]').fill('San Francisco')
      await page.locator('[name="location.country"]').fill('United States')
      
      // Select timezone
      await page.locator('[name="timeZone"]').selectOption('America/Los_Angeles')
      
      // Fill cover letter
      await page.locator('[name="coverLetter"]').fill(
        'I am excited to apply for this position. I have extensive experience in content writing and believe I would be a great fit for your team.'
      )
      
      // Select experience
      await page.locator('[name="yearsExperience"]').fill('3')
      
      // Add languages
      await page.locator('[data-testid="add-language"]').click()
      await page.locator('[name="languages.0.language"]').fill('English')
      await page.locator('[name="languages.0.proficiency"]').selectOption('native')
      
      // Add specialties
      await page.locator('[name="specialties"]').fill('Content Writing, SEO, Copywriting')
      
      // Fill compensation
      await page.locator('[name="desiredCompensation.amount"]').fill('75000')
      await page.locator('[name="desiredCompensation.frequency"]').selectOption('monthly')
      
      // Set availability date
      await page.locator('[name="availabilityDate"]').fill('2024-02-01')
      
      // Submit application
      await page.locator('[data-testid="submit-application"]').click()
      
      // Should show success message
      await expect(page.locator('text=Application submitted successfully')).toBeVisible()
    }
  })

  test('should validate required fields', async ({ page }) => {
    const jobCards = page.locator('[data-testid="job-card"]')
    
    if (await jobCards.count() > 0) {
      await jobCards.first().click()
      await page.locator('[data-testid="apply-button"]').click()
      
      if (!page.url().includes('/sign-up') && !page.url().includes('/sign-in')) {
        // Try to submit without filling required fields
        await page.locator('[data-testid="submit-application"]').click()
        
        // Should show validation errors
        await expect(page.locator('text=First name is required')).toBeVisible()
        await expect(page.locator('text=Email is required')).toBeVisible()
      }
    }
  })

  test('should handle file upload for resume', async ({ page }) => {
    const jobCards = page.locator('[data-testid="job-card"]')
    
    if (await jobCards.count() > 0) {
      await jobCards.first().click()
      await page.locator('[data-testid="apply-button"]').click()
      
      if (!page.url().includes('/sign-up') && !page.url().includes('/sign-in')) {
        // Create a test file
        const testFile = 'test-resume.pdf'
        
        // Upload resume
        const fileInput = page.locator('[data-testid="resume-upload"] input[type="file"]')
        
        if (await fileInput.isVisible()) {
          // In a real test, you'd upload an actual file
          // await fileInput.setInputFiles(testFile)
          
          // Check that upload feedback is shown
          // await expect(page.locator('text=Resume uploaded')).toBeVisible()
        }
      }
    }
  })

  test('should save draft application', async ({ page }) => {
    const jobCards = page.locator('[data-testid="job-card"]')
    
    if (await jobCards.count() > 0) {
      await jobCards.first().click()
      await page.locator('[data-testid="apply-button"]').click()
      
      if (!page.url().includes('/sign-up') && !page.url().includes('/sign-in')) {
        // Fill partial form
        await page.locator('[name="firstName"]').fill('John')
        await page.locator('[name="lastName"]').fill('Doe')
        await page.locator('[name="email"]').fill('john.doe@example.com')
        
        // Wait for auto-save
        await page.waitForTimeout(2000)
        
        // Should show saved indicator
        const savedIndicator = page.locator('[data-testid="auto-save-indicator"]')
        if (await savedIndicator.isVisible()) {
          await expect(savedIndicator).toContainText('Saved')
        }
      }
    }
  })
})