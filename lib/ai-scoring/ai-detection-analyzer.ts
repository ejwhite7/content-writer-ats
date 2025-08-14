export interface AIDetectionResult {
  score: number // 0-100, where 100 means likely human-written
  human_likelihood: number // 0-1 probability
  ai_likelihood: number // 0-1 probability
  confidence: 'high' | 'medium' | 'low'
  analysis: {
    perplexity_score: number
    burstiness_score: number
    vocabulary_diversity: number
    sentence_variation: number
    stylometry_score: number
  }
  indicators: Array<{
    type: 'human' | 'ai'
    feature: string
    confidence: number
    description: string
  }>
  feedback: string[]
}

export class AIDetectionAnalyzer {
  analyze(text: string): AIDetectionResult {
    const perplexityScore = this.calculatePerplexity(text)
    const burstinessScore = this.calculateBurstiness(text)
    const vocabularyDiversity = this.calculateVocabularyDiversity(text)
    const sentenceVariation = this.calculateSentenceVariation(text)
    const stylometryScore = this.calculateStylometry(text)
    
    const indicators = this.identifyIndicators(text, {
      perplexity: perplexityScore,
      burstiness: burstinessScore,
      vocabulary: vocabularyDiversity,
      sentences: sentenceVariation,
      stylometry: stylometryScore
    })

    // Weighted scoring (higher = more human-like)
    const humanScore = Math.round(
      perplexityScore * 0.25 +
      burstinessScore * 0.20 +
      vocabularyDiversity * 0.20 +
      sentenceVariation * 0.20 +
      stylometryScore * 0.15
    )

    const humanLikelihood = humanScore / 100
    const aiLikelihood = 1 - humanLikelihood
    
    const confidence = this.determineConfidence(humanScore, indicators)
    const feedback = this.generateFeedback(humanScore, indicators)

    return {
      score: humanScore,
      human_likelihood: humanLikelihood,
      ai_likelihood: aiLikelihood,
      confidence,
      analysis: {
        perplexity_score: perplexityScore,
        burstiness_score: burstinessScore,
        vocabulary_diversity: vocabularyDiversity,
        sentence_variation: sentenceVariation,
        stylometry_score: stylometryScore
      },
      indicators,
      feedback
    }
  }

  private calculatePerplexity(text: string): number {
    // Simplified perplexity calculation based on word prediction difficulty
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    if (words.length < 2) return 50

    let totalSurprise = 0
    const wordFreq: { [key: string]: number } = {}
    
    // Build frequency model
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }

    // Calculate bigram surprises
    let bigramCount = 0
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i]
      const nextWord = words[i + 1]
      const bigram = `${currentWord} ${nextWord}`
      
      // Simple probability estimation
      const currentWordFreq = wordFreq[currentWord]
      const bigramFreq = this.countBigram(words, currentWord, nextWord)
      const probability = bigramFreq / currentWordFreq
      
      // Calculate surprise (negative log probability)
      const surprise = -Math.log2(Math.max(probability, 0.001))
      totalSurprise += surprise
      bigramCount++
    }

    const avgPerplexity = totalSurprise / bigramCount
    
    // Convert to 0-100 score (higher = more human-like)
    // Human writing typically has higher perplexity (less predictable)
    let score = Math.min(100, avgPerplexity * 10)
    
    // AI text often has very consistent perplexity, so penalize that
    const perplexityVariance = this.calculatePerplexityVariance(words, wordFreq)
    if (perplexityVariance < 0.5) score -= 20 // Too consistent = AI-like
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateBurstiness(text: string): number {
    // Burstiness measures the irregularity of sentence lengths and structures
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length < 3) return 50

    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length)
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / sentenceLengths.length
    const stdDev = Math.sqrt(variance)
    
    // Calculate burstiness coefficient
    const burstiness = (stdDev - mean) / (stdDev + mean)
    
    // Human writing typically has more burstiness (varied sentence lengths)
    let score = Math.max(0, burstiness) * 100
    
    // Check for patterns that indicate AI generation
    const lengthPatterns = this.detectLengthPatterns(sentenceLengths)
    if (lengthPatterns.isRepeating) score -= 30
    if (lengthPatterns.isTooUniform) score -= 20
    
    return Math.max(0, Math.min(100, score + 50)) // Base score of 50
  }

  private calculateVocabularyDiversity(text: string): number {
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || []
    if (words.length < 10) return 50

    const uniqueWords = new Set(words)
    const typeTokenRatio = uniqueWords.size / words.length
    
    // Check for AI-like vocabulary patterns
    let score = typeTokenRatio * 100
    
    // AI often uses certain "filler" words frequently
    const aiFillerWords = [
      'furthermore', 'moreover', 'additionally', 'consequently',
      'therefore', 'indeed', 'certainly', 'undoubtedly',
      'comprehensive', 'innovative', 'cutting-edge', 'state-of-the-art'
    ]
    
    let aiWordCount = 0
    for (const word of aiFillerWords) {
      if (text.toLowerCase().includes(word)) aiWordCount++
    }
    
    if (aiWordCount > 3) score -= 20 // Too many AI-typical words
    
    // Check for unusual word frequency distributions
    const wordFreq: { [key: string]: number } = {}
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
    
    const frequencies = Object.values(wordFreq)
    const freqVariance = this.calculateVariance(frequencies)
    
    // AI often has very uniform word distributions
    if (freqVariance < 1) score -= 15
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateSentenceVariation(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length < 3) return 50

    let score = 70 // Base score
    
    // Analyze sentence starters
    const starters = sentences.map(s => {
      const words = s.trim().toLowerCase().split(/\s+/)
      return words[0] || ''
    })
    
    const starterFreq: { [key: string]: number } = {}
    for (const starter of starters) {
      if (starter) starterFreq[starter] = (starterFreq[starter] || 0) + 1
    }
    
    const uniqueStarters = Object.keys(starterFreq).length
    const starterVariety = uniqueStarters / sentences.length
    
    if (starterVariety > 0.7) score += 15
    else if (starterVariety < 0.3) score -= 20 // Too repetitive = AI-like
    
    // Analyze sentence structures
    const structures = sentences.map(s => this.analyzeSentenceStructure(s))
    const structureVariety = new Set(structures).size / structures.length
    
    if (structureVariety > 0.6) score += 15
    else if (structureVariety < 0.4) score -= 15
    
    // Check for AI-typical sentence patterns
    const aiPatterns = [
      /^(in conclusion|to summarize|in summary|overall|ultimately),?\s+/i,
      /^(it is important to note|it should be noted|it is worth mentioning),?\s+/i,
      /^(furthermore|moreover|additionally|in addition),?\s+/i
    ]
    
    let aiPatternCount = 0
    for (const sentence of sentences) {
      for (const pattern of aiPatterns) {
        if (pattern.test(sentence.trim())) {
          aiPatternCount++
          break
        }
      }
    }
    
    if (aiPatternCount > sentences.length * 0.3) score -= 25
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateStylometry(text: string): number {
    // Analyze writing style characteristics
    let score = 60 // Base score
    
    const words = text.match(/\b\w+\b/g) || []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    if (words.length === 0 || sentences.length === 0) return 50
    
    // Function word analysis (human writers have distinct patterns)
    const functionWords = [
      'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that',
      'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they',
      'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had',
      'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when'
    ]
    
    const functionWordCount = words.filter(word => 
      functionWords.includes(word.toLowerCase())
    ).length
    
    const functionWordRatio = functionWordCount / words.length
    
    // Human writing typically has 40-60% function words
    if (functionWordRatio >= 0.35 && functionWordRatio <= 0.65) score += 15
    else score -= 10
    
    // Analyze punctuation patterns
    const punctuation = text.match(/[,.;:!?-]/g) || []
    const punctuationRatio = punctuation.length / words.length
    
    // AI often over-punctuates or under-punctuates
    if (punctuationRatio >= 0.08 && punctuationRatio <= 0.25) score += 10
    else if (punctuationRatio > 0.3) score -= 15
    
    // Check for emotional expressions and personal touches
    const personalExpressions = [
      /\b(I think|I believe|in my opinion|personally|honestly)\b/gi,
      /\b(amazing|fantastic|terrible|awful|love|hate)\b/gi,
      /[!]{1,2}(?![!])/g, // Single or double exclamation (not triple+)
      /\?{1}(?![?])/g // Single question marks
    ]
    
    let personalityScore = 0
    for (const pattern of personalExpressions) {
      const matches = text.match(pattern)
      if (matches) personalityScore += matches.length
    }
    
    if (personalityScore > 0) score += Math.min(15, personalityScore * 3)
    
    return Math.max(0, Math.min(100, score))
  }

  private identifyIndicators(text: string, scores: any): Array<{
    type: 'human' | 'ai'
    feature: string
    confidence: number
    description: string
  }> {
    const indicators: Array<{
      type: 'human' | 'ai'
      feature: string
      confidence: number
      description: string
    }> = []
    
    // High perplexity = human-like
    if (scores.perplexity > 80) {
      indicators.push({
        type: 'human',
        feature: 'High perplexity',
        confidence: 0.8,
        description: 'Unpredictable word choices suggest human creativity'
      })
    } else if (scores.perplexity < 30) {
      indicators.push({
        type: 'ai',
        feature: 'Low perplexity',
        confidence: 0.7,
        description: 'Very predictable word patterns suggest AI generation'
      })
    }
    
    // High burstiness = human-like
    if (scores.burstiness > 75) {
      indicators.push({
        type: 'human',
        feature: 'High burstiness',
        confidence: 0.7,
        description: 'Varied sentence lengths indicate natural human writing'
      })
    } else if (scores.burstiness < 25) {
      indicators.push({
        type: 'ai',
        feature: 'Low burstiness',
        confidence: 0.6,
        description: 'Uniform sentence patterns suggest AI generation'
      })
    }
    
    // Check for AI-typical phrases
    const aiPhrases = [
      'it is important to note that',
      'in today\'s digital landscape',
      'cutting-edge technology',
      'comprehensive solution',
      'in conclusion, it can be said'
    ]
    
    const lowerText = text.toLowerCase()
    for (const phrase of aiPhrases) {
      if (lowerText.includes(phrase)) {
        indicators.push({
          type: 'ai',
          feature: 'AI-typical phrasing',
          confidence: 0.6,
          description: `Contains phrase commonly used by AI: "${phrase}"`
        })
      }
    }
    
    // Check for human-typical indicators
    const humanIndicators = [
      /\b(ugh|hmm|wow|oh|ah)\b/gi,
      /\b(totally|literally|basically|honestly)\b/gi,
      /[.]{2,5}(?!\.)/, // Ellipses
      /[!?]{2,3}/, // Multiple punctuation
    ]
    
    for (const pattern of humanIndicators) {
      const matches = text.match(pattern)
      if (matches) {
        indicators.push({
          type: 'human',
          feature: 'Colloquial expressions',
          confidence: 0.5,
          description: 'Contains informal expressions typical of human writing'
        })
        break
      }
    }
    
    return indicators
  }

  private determineConfidence(score: number, indicators: any[]): 'high' | 'medium' | 'low' {
    const strongIndicators = indicators.filter(i => i.confidence > 0.7).length
    
    if (strongIndicators >= 2) return 'high'
    if (strongIndicators >= 1 || indicators.length >= 3) return 'medium'
    return 'low'
  }

  private generateFeedback(score: number, indicators: any[]): string[] {
    const feedback = []
    
    if (score >= 80) {
      feedback.push('Strong indicators of human authorship')
    } else if (score >= 60) {
      feedback.push('Likely human-written with some AI characteristics')
    } else if (score >= 40) {
      feedback.push('Mixed indicators - could be human or AI')
    } else {
      feedback.push('Strong indicators suggest possible AI generation')
    }
    
    const aiIndicators = indicators.filter(i => i.type === 'ai')
    const humanIndicators = indicators.filter(i => i.type === 'human')
    
    if (humanIndicators.length > aiIndicators.length) {
      feedback.push('More human-like characteristics detected')
    } else if (aiIndicators.length > humanIndicators.length) {
      feedback.push('More AI-like patterns detected')
    }
    
    return feedback
  }

  private countBigram(words: string[], word1: string, word2: string): number {
    let count = 0
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i] === word1 && words[i + 1] === word2) {
        count++
      }
    }
    return Math.max(1, count) // Avoid zero counts
  }

  private calculatePerplexityVariance(words: string[], wordFreq: { [key: string]: number }): number {
    const perplexities = []
    
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i]
      const nextWord = words[i + 1]
      const bigramFreq = this.countBigram(words, currentWord, nextWord)
      const probability = bigramFreq / wordFreq[currentWord]
      const perplexity = -Math.log2(Math.max(probability, 0.001))
      perplexities.push(perplexity)
    }
    
    return this.calculateVariance(perplexities)
  }

  private detectLengthPatterns(lengths: number[]): { isRepeating: boolean; isTooUniform: boolean } {
    if (lengths.length < 4) return { isRepeating: false, isTooUniform: false }
    
    // Check for repeating patterns
    let isRepeating = false
    for (let patternLen = 2; patternLen <= lengths.length / 2; patternLen++) {
      const pattern = lengths.slice(0, patternLen)
      let matches = 0
      
      for (let i = patternLen; i < lengths.length; i += patternLen) {
        const segment = lengths.slice(i, i + patternLen)
        if (JSON.stringify(segment) === JSON.stringify(pattern)) {
          matches++
        }
      }
      
      if (matches >= 2) {
        isRepeating = true
        break
      }
    }
    
    // Check for too uniform lengths
    const variance = this.calculateVariance(lengths)
    const isTooUniform = variance < 4 // Very low variance
    
    return { isRepeating, isTooUniform }
  }

  private analyzeSentenceStructure(sentence: string): string {
    const trimmed = sentence.trim().toLowerCase()
    
    if (trimmed.includes('?')) return 'question'
    if (trimmed.includes('!')) return 'exclamation'
    if (trimmed.includes(',') && trimmed.includes(' and ')) return 'compound_complex'
    if (trimmed.includes(',')) return 'complex'
    if (trimmed.includes(' and ') || trimmed.includes(' but ') || trimmed.includes(' or ')) return 'compound'
    
    const words = trimmed.split(/\s+/)
    if (words.length > 20) return 'long_simple'
    if (words.length < 5) return 'short_simple'
    
    return 'simple'
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0
    
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  }
}