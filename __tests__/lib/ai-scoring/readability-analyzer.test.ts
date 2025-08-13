import { ReadabilityAnalyzer } from '@/lib/ai-scoring/readability-analyzer'

describe('ReadabilityAnalyzer', () => {
  let analyzer: ReadabilityAnalyzer

  beforeEach(() => {
    analyzer = new ReadabilityAnalyzer()
  })

  describe('analyze', () => {
    it('should analyze simple text correctly', () => {
      const text = 'This is a simple sentence. It is easy to read. The content is clear.'
      const result = analyzer.analyze(text)

      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('grade_level')
      expect(result).toHaveProperty('reading_ease')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('feedback')

      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should handle complex text', () => {
      const complexText = `
        The utilization of sophisticated algorithmic methodologies in contemporary 
        computational paradigms necessitates comprehensive understanding of multifaceted 
        architectural frameworks that facilitate optimal performance enhancement through 
        systematic optimization of resource allocation mechanisms.
      `
      const result = analyzer.analyze(complexText)

      expect(result.score).toBeLessThan(80) // Complex text should score lower
      expect(result.grade_level).toBeGreaterThan(12) // Should indicate college level or higher
    })

    it('should handle empty text', () => {
      const result = analyzer.analyze('')
      
      expect(result.score).toBe(0)
      expect(result.feedback).toContain('No content')
    })

    it('should handle very short text', () => {
      const result = analyzer.analyze('Short.')
      
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should provide appropriate feedback for different readability levels', () => {
      const easyText = 'The cat sat on the mat. It was a sunny day. Birds sang in the trees.'
      const easyResult = analyzer.analyze(easyText)

      expect(easyResult.feedback).toContain('excellent readability' || 'very readable')

      const hardText = `
        Notwithstanding the aforementioned considerations pertaining to the 
        implementation of sophisticated methodological approaches, it remains 
        imperative to acknowledge the inherent complexities associated with 
        multidimensional analytical frameworks.
      `
      const hardResult = analyzer.analyze(hardText)

      expect(hardResult.feedback).toContain('difficult' || 'complex' || 'improve')
    })

    it('should calculate metrics correctly', () => {
      const text = 'This is a test. It has two sentences. Both are simple.'
      const result = analyzer.analyze(text)

      expect(result.metrics).toHaveProperty('sentences')
      expect(result.metrics).toHaveProperty('words')
      expect(result.metrics).toHaveProperty('syllables')
      expect(result.metrics).toHaveProperty('avg_sentence_length')
      expect(result.metrics).toHaveProperty('avg_syllables_per_word')

      expect(result.metrics.sentences).toBe(3)
      expect(result.metrics.words).toBeGreaterThan(0)
      expect(result.metrics.avg_sentence_length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle text with special characters', () => {
      const text = 'This is a test! Does it work? Yes, it does... perfectly.'
      const result = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should handle text with numbers', () => {
      const text = 'In 2024, we analyzed 1,000 documents with 50 different metrics.'
      const result = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.metrics.words).toBeGreaterThan(0)
    })

    it('should handle text with contractions', () => {
      const text = "It's a wonderful day. We can't wait to see what happens next."
      const result = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.metrics.words).toBeGreaterThan(0)
    })
  })
})