/**
 * Jest Configuration Validation Tests
 * These tests ensure that the Jest environment is properly configured
 */

describe('Jest Configuration Validation', () => {
  describe('TypeScript Support', () => {
    it('should compile TypeScript files correctly', () => {
      interface TestInterface {
        name: string
        value: number
      }

      const testData: TestInterface = {
        name: 'test',
        value: 42
      }

      expect(testData).toEqual({
        name: 'test',
        value: 42
      })
    })

    it('should support advanced TypeScript features', () => {
      // Generic functions
      function identity<T>(arg: T): T {
        return arg
      }

      expect(identity<string>('hello')).toBe('hello')
      expect(identity<number>(123)).toBe(123)

      // Union types
      type StringOrNumber = string | number
      const value: StringOrNumber = 'test'
      expect(typeof value).toBe('string')

      // Optional properties
      interface OptionalProps {
        required: string
        optional?: number
      }

      const obj: OptionalProps = { required: 'test' }
      expect(obj.required).toBe('test')
      expect(obj.optional).toBeUndefined()
    })
  })

  describe('Jest DOM Matchers', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div>
          <button id="test-button" class="primary" disabled>Click me</button>
          <input id="test-input" value="test value" />
          <p id="test-text">Hello World</p>
        </div>
      `
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should have toBeInTheDocument matcher', () => {
      const button = document.getElementById('test-button')
      expect(button).toBeInTheDocument()
    })

    it('should have toHaveClass matcher', () => {
      const button = document.getElementById('test-button')
      expect(button).toHaveClass('primary')
    })

    it('should have toBeDisabled matcher', () => {
      const button = document.getElementById('test-button')
      expect(button).toBeDisabled()
    })

    it('should have toHaveValue matcher', () => {
      const input = document.getElementById('test-input')
      expect(input).toHaveValue('test value')
    })

    it('should have toHaveTextContent matcher', () => {
      const text = document.getElementById('test-text')
      expect(text).toHaveTextContent('Hello World')
    })
  })

  describe('Module Resolution', () => {
    it('should resolve @/ alias paths', async () => {
      // This test ensures that our path aliases work correctly
      const moduleTest = () => import('@/lib/utils')
      
      await expect(moduleTest()).resolves.toBeDefined()
    })

    it('should handle React imports correctly', () => {
      const React = require('react')
      expect(React).toBeDefined()
      expect(typeof React.createElement).toBe('function')
    })

    it('should mock external dependencies', () => {
      // Test that our mocks are working
      const { formatDistanceToNow } = require('date-fns')
      expect(formatDistanceToNow).toBeDefined()
      expect(typeof formatDistanceToNow).toBe('function')
    })
  })

  describe('Environment Variables', () => {
    it('should have test environment variables set', () => {
      expect(process.env.NODE_ENV).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key')
    })
  })

  describe('Global Utilities', () => {
    it('should have global test utilities available', () => {
      expect(global.testUtils).toBeDefined()
      expect(typeof global.testUtils.createMockJob).toBe('function')
    })

    it('should create mock jobs correctly', () => {
      const mockJob = global.testUtils.createMockJob()
      
      expect(mockJob).toHaveProperty('id')
      expect(mockJob).toHaveProperty('title')
      expect(mockJob).toHaveProperty('company')
      expect(mockJob).toHaveProperty('description')
    })
  })

  describe('Error Handling', () => {
    it('should handle async errors properly', async () => {
      const asyncError = async () => {
        throw new Error('Test async error')
      }

      await expect(asyncError()).rejects.toThrow('Test async error')
    })

    it('should handle synchronous errors', () => {
      const syncError = () => {
        throw new Error('Test sync error')
      }

      expect(syncError).toThrow('Test sync error')
    })
  })

  describe('Mock Functions', () => {
    it('should support Jest mock functions', () => {
      const mockFn = jest.fn()
      mockFn('test arg')
      
      expect(mockFn).toHaveBeenCalledWith('test arg')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should support mock return values', () => {
      const mockFn = jest.fn().mockReturnValue('mocked value')
      
      expect(mockFn()).toBe('mocked value')
    })

    it('should support async mocks', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('async result')
      
      const result = await mockAsyncFn()
      expect(result).toBe('async result')
    })
  })

  describe('Browser APIs', () => {
    it('should have window object available', () => {
      expect(window).toBeDefined()
      expect(window.document).toBeDefined()
    })

    it('should have mocked window.matchMedia', () => {
      expect(window.matchMedia).toBeDefined()
      
      const mediaQuery = window.matchMedia('(min-width: 768px)')
      expect(mediaQuery).toHaveProperty('matches')
      expect(mediaQuery).toHaveProperty('addEventListener')
    })

    it('should have ResizeObserver mock', () => {
      expect(global.ResizeObserver).toBeDefined()
      
      const observer = new ResizeObserver(() => {})
      expect(observer).toHaveProperty('observe')
      expect(observer).toHaveProperty('disconnect')
    })
  })
})