/**
 * Basic setup test to verify Jest and TypeScript configuration
 */

describe('Test Environment Setup', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have TypeScript working', () => {
    const testObject: { name: string; age: number } = {
      name: 'Test',
      age: 25
    }
    
    expect(testObject.name).toBe('Test')
    expect(testObject.age).toBe(25)
  })

  it('should have proper environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key')
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe('pk_test_clerk')
  })

  it('should have global test utilities available', () => {
    expect(global.testUtils).toBeDefined()
    expect(typeof global.testUtils.createMockJob).toBe('function')
  })

  it('should handle async operations', async () => {
    const asyncOperation = () => Promise.resolve('success')
    const result = await asyncOperation()
    expect(result).toBe('success')
  })

  it('should support modern JavaScript features', () => {
    // Test destructuring
    const { name, age } = { name: 'John', age: 30 }
    expect(name).toBe('John')
    expect(age).toBe(30)

    // Test arrow functions
    const multiply = (a: number, b: number) => a * b
    expect(multiply(3, 4)).toBe(12)

    // Test template literals
    const message = `Hello, ${name}!`
    expect(message).toBe('Hello, John!')

    // Test array methods
    const numbers = [1, 2, 3, 4, 5]
    const doubled = numbers.map(n => n * 2)
    expect(doubled).toEqual([2, 4, 6, 8, 10])

    // Test spread operator
    const combined = [...numbers, ...doubled]
    expect(combined).toHaveLength(10)
  })

  it('should have proper mock implementations', () => {
    // Test date-fns mock
    const { formatDistanceToNow } = require('date-fns')
    expect(formatDistanceToNow()).toBe('2 days ago')

    // Test console mocks exist
    expect(jest.spyOn).toBeDefined()
  })
})