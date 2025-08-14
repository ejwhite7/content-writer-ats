import { ReadabilityAnalyzer } from '@/lib/ai-scoring/readability-analyzer'
import type { ReadabilityResult } from '@/lib/ai-scoring/readability-analyzer'

describe('ReadabilityAnalyzer', () => {
  let analyzer: ReadabilityAnalyzer

  beforeEach(() => {
    analyzer = new ReadabilityAnalyzer()
  })

  describe('analyze', () => {
    it('should analyze simple text correctly', () => {
      const text = 'This is a simple sentence. It is easy to read. The content is clear.'
      const result: ReadabilityResult = analyzer.analyze(text)

      // Check that all required properties exist
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('grade_level')
      expect(result).toHaveProperty('reading_ease')
      expect(result).toHaveProperty('flesch_kincaid_grade')
      expect(result).toHaveProperty('flesch_reading_ease')
      expect(result).toHaveProperty('gunning_fog_index')
      expect(result).toHaveProperty('smog_index')
      expect(result).toHaveProperty('automated_readability_index')
      expect(result).toHaveProperty('coleman_liau_index')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('feedback')

      // Check types and ranges
      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      
      expect(typeof result.grade_level).toBe('number')
      expect(typeof result.reading_ease).toBe('number')
      expect(Array.isArray(result.feedback)).toBe(true)
    })

    it('should handle complex text', () => {
      const complexText = `
        The utilization of sophisticated algorithmic methodologies in contemporary 
        computational paradigms necessitates comprehensive understanding of multifaceted 
        architectural frameworks that facilitate optimal performance enhancement through 
        systematic optimization of resource allocation mechanisms.
      `
      const result: ReadabilityResult = analyzer.analyze(complexText)

      expect(result.score).toBeLessThan(80) // Complex text should score lower
      expect(result.grade_level).toBeGreaterThan(12) // Should indicate college level or higher
      expect(typeof result.flesch_kincaid_grade).toBe('number')
      expect(typeof result.gunning_fog_index).toBe('number')
    })

    it('should handle empty text', () => {
      const result: ReadabilityResult = analyzer.analyze('')
      
      expect(result.score).toBe(0)
      expect(result.feedback).toContain('No content to analyze')
      expect(result.metrics.sentences).toBe(0)
      expect(result.metrics.words).toBe(0)
    })

    it('should handle very short text', () => {
      const result: ReadabilityResult = analyzer.analyze('Short.')
      
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.feedback.length).toBeGreaterThan(0)
      expect(typeof result.smog_index).toBe('number')
      expect(typeof result.automated_readability_index).toBe('number')
    })

    it('should provide appropriate feedback for different readability levels', () => {
      const easyText = 'The cat sat on the mat. It was a sunny day. Birds sang in the trees.'
      const easyResult: ReadabilityResult = analyzer.analyze(easyText)

      // Check if feedback contains positive readability indicators
      const feedbackString = easyResult.feedback.join(' ').toLowerCase()
      expect(
        feedbackString.includes('excellent') || 
        feedbackString.includes('good') || 
        feedbackString.includes('easy')
      ).toBe(true)

      const hardText = `
        Notwithstanding the aforementioned considerations pertaining to the 
        implementation of sophisticated methodological approaches, it remains 
        imperative to acknowledge the inherent complexities associated with 
        multidimensional analytical frameworks.
      `
      const hardResult: ReadabilityResult = analyzer.analyze(hardText)

      // Check if feedback contains indicators of difficulty
      const hardFeedbackString = hardResult.feedback.join(' ').toLowerCase()
      expect(
        hardFeedbackString.includes('difficult') || 
        hardFeedbackString.includes('complex') || 
        hardFeedbackString.includes('academic') ||
        hardFeedbackString.includes('graduate')
      ).toBe(true)
    })

    it('should calculate metrics correctly', () => {
      const text = 'This is a test. It has two sentences. Both are simple.'
      const result: ReadabilityResult = analyzer.analyze(text)

      // Check that metrics object has all required properties
      expect(result.metrics).toHaveProperty('sentences')
      expect(result.metrics).toHaveProperty('words')
      expect(result.metrics).toHaveProperty('syllables')
      expect(result.metrics).toHaveProperty('avg_sentence_length')
      expect(result.metrics).toHaveProperty('avg_syllables_per_word')

      // Check specific values for the test text
      expect(result.metrics.sentences).toBe(3)
      expect(result.metrics.words).toBeGreaterThan(0)
      expect(result.metrics.syllables).toBeGreaterThan(0)
      expect(result.metrics.avg_sentence_length).toBeGreaterThan(0)
      expect(result.metrics.avg_syllables_per_word).toBeGreaterThan(0)

      // Check that averages are reasonable
      expect(result.metrics.avg_sentence_length).toBeLessThan(20)
      expect(result.metrics.avg_syllables_per_word).toBeLessThan(5)
    })
  })

  describe('edge cases', () => {
    it('should handle text with special characters', () => {
      const text = 'This is a test! Does it work? Yes, it does... perfectly.'
      const result: ReadabilityResult = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(typeof result.coleman_liau_index).toBe('number')
      expect(result.metrics.sentences).toBeGreaterThan(0)
    })

    it('should handle text with numbers', () => {
      const text = 'In 2024, we analyzed 1,000 documents with 50 different metrics.'
      const result: ReadabilityResult = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.metrics.words).toBeGreaterThan(0)
      expect(result.metrics.sentences).toBe(1)
      expect(Array.isArray(result.feedback)).toBe(true)
    })

    it('should handle text with contractions', () => {
      const text = "It's a wonderful day. We can't wait to see what happens next."
      const result: ReadabilityResult = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.metrics.words).toBeGreaterThan(0)
      expect(result.metrics.sentences).toBe(2)
      expect(typeof result.flesch_reading_ease).toBe('number')
    })

    it('should handle very long sentences', () => {
      const text = 'This is a very long sentence that contains many words and clauses and phrases and should test how the analyzer handles sentences with excessive length and complexity that might occur in academic or technical writing where authors tend to create overly complex sentence structures.'
      const result: ReadabilityResult = analyzer.analyze(text)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.metrics.sentences).toBe(1)
      expect(result.metrics.avg_sentence_length).toBeGreaterThan(20)
      
      // Long sentences should typically result in lower readability
      const feedbackString = result.feedback.join(' ').toLowerCase()
      expect(
        feedbackString.includes('shortening') || 
        feedbackString.includes('sentence') ||
        result.score < 90
      ).toBe(true)
    })

    it('should handle whitespace-only text', () => {
      const result: ReadabilityResult = analyzer.analyze('   \n\t   ')
      
      expect(result.score).toBe(0)
      expect(result.feedback).toContain('No content to analyze')
      expect(result.metrics.words).toBe(0)
    })

    it('should provide consistent results for the same input', () => {
      const text = 'Consistency test. This should return the same results every time.'
      const result1: ReadabilityResult = analyzer.analyze(text)
      const result2: ReadabilityResult = analyzer.analyze(text)

      expect(result1.score).toBe(result2.score)
      expect(result1.grade_level).toBe(result2.grade_level)
      expect(result1.reading_ease).toBe(result2.reading_ease)
      expect(result1.metrics.sentences).toBe(result2.metrics.sentences)
      expect(result1.metrics.words).toBe(result2.metrics.words)
    })
  })

  describe('scoring validation', () => {
    it('should always return scores within valid ranges', () => {
      const testTexts = [
        'Simple.',
        'This is a moderately complex sentence with some technical terminology.',
        'The implementation of sophisticated algorithmic methodologies necessitates comprehensive understanding.',
        'A very simple text. Easy to read. Good for all.',
        'Supercalifragilisticexpialidocious antidisestablishmentarianism pseudopseudohypoparathyroidism.'
      ]

      testTexts.forEach(text => {
        const result: ReadabilityResult = analyzer.analyze(text)
        
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
        expect(result.grade_level).toBeGreaterThanOrEqual(0)
        expect(result.reading_ease).toBeFinite()
        expect(result.flesch_kincaid_grade).toBeFinite()
        expect(result.gunning_fog_index).toBeFinite()
        expect(result.smog_index).toBeFinite()
        expect(result.automated_readability_index).toBeFinite()
        expect(result.coleman_liau_index).toBeFinite()
      })
    })
  })
})