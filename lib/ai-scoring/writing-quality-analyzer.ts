export interface WritingQualityResult {
  score: number
  grammar_score: number
  structure_score: number
  vocabulary_score: number
  coherence_score: number
  issues: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
    suggestion?: string
  }>
  feedback: string[]
}

export class WritingQualityAnalyzer {
  analyze(text: string): WritingQualityResult {
    const grammarScore = this.analyzeGrammar(text)
    const structureScore = this.analyzeStructure(text)
    const vocabularyScore = this.analyzeVocabulary(text)
    const coherenceScore = this.analyzeCoherence(text)

    const issues = [
      ...this.findGrammarIssues(text),
      ...this.findStructureIssues(text),
      ...this.findVocabularyIssues(text),
    ]

    const overallScore = Math.round(
      (grammarScore + structureScore + vocabularyScore + coherenceScore) / 4
    )

    const feedback = this.generateFeedback(
      grammarScore,
      structureScore,
      vocabularyScore,
      coherenceScore,
      issues
    )

    return {
      score: overallScore,
      grammar_score: grammarScore,
      structure_score: structureScore,
      vocabulary_score: vocabularyScore,
      coherence_score: coherenceScore,
      issues,
      feedback
    }
  }

  private analyzeGrammar(text: string): number {
    let score = 100
    const issues = []

    // Check for common grammar issues
    const commonErrors = [
      { pattern: /\\b(there|their|they're)\\b/gi, type: 'there/their/they\'re confusion' },
      { pattern: /\\b(your|you're)\\b/gi, type: 'your/you\'re confusion' },
      { pattern: /\\b(its|it's)\\b/gi, type: 'its/it\'s confusion' },
      { pattern: /\\b(affect|effect)\\b/gi, type: 'affect/effect confusion' },
      { pattern: /\\b(loose|lose)\\b/gi, type: 'loose/lose confusion' },
      { pattern: /[.]{2,}/g, type: 'multiple periods' },
      { pattern: /[!]{2,}/g, type: 'multiple exclamation marks' },
      { pattern: /[?]{2,}/g, type: 'multiple question marks' },
      { pattern: /\\b(alot|alright|aswell)\\b/gi, type: 'common misspellings' },
    ]

    for (const error of commonErrors) {
      const matches = text.match(error.pattern)
      if (matches) {
        score -= matches.length * 2
        issues.push(`Potential ${error.type} (${matches.length} instances)`)
      }
    }

    // Check for sentence fragments (very basic)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    let fragments = 0
    for (const sentence of sentences) {
      if (sentence.trim().split(' ').length < 3) {
        fragments++
      }
    }
    if (fragments > 0) {
      score -= fragments * 3
      issues.push(`${fragments} potential sentence fragments`)
    }

    // Check for run-on sentences
    let runOnSentences = 0
    for (const sentence of sentences) {
      if (sentence.trim().split(' ').length > 40) {
        runOnSentences++
      }
    }
    if (runOnSentences > 0) {
      score -= runOnSentences * 5
      issues.push(`${runOnSentences} very long sentences (potential run-ons)`)
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeStructure(text: string): number {
    let score = 80 // Base score

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\\s+/).filter(w => w.trim().length > 0)
    const paragraphs = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0)

    // Sentence length variety
    const sentenceLengths = sentences.map(s => s.trim().split(' ').length)
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    const sentenceVariety = this.calculateVariance(sentenceLengths)

    if (avgSentenceLength > 15 && avgSentenceLength < 25) score += 5
    if (sentenceVariety > 20) score += 10

    // Paragraph structure
    if (paragraphs.length > 1) {
      score += 10
      const paragraphLengths = paragraphs.map(p => p.split(' ').length)
      const avgParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
      
      if (avgParagraphLength > 30 && avgParagraphLength < 150) score += 5
    }

    // Transition words and coherence markers
    const transitionWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'consequently',
      'meanwhile', 'similarly', 'in contrast', 'on the other hand',
      'for example', 'in addition', 'as a result', 'in conclusion'
    ]
    
    let transitionCount = 0
    const lowerText = text.toLowerCase()
    for (const transition of transitionWords) {
      if (lowerText.includes(transition)) {
        transitionCount++
      }
    }
    
    if (transitionCount > words.length / 200) score += 5

    // Check for proper introduction and conclusion
    if (text.length > 500) {
      const firstParagraph = paragraphs[0]?.toLowerCase() || ''
      const lastParagraph = paragraphs[paragraphs.length - 1]?.toLowerCase() || ''
      
      const introWords = ['introduction', 'first', 'begin', 'start', 'today', 'this article']
      const conclusionWords = ['conclusion', 'finally', 'in summary', 'to conclude', 'overall']
      
      const hasIntro = introWords.some(word => firstParagraph.includes(word))
      const hasConclusion = conclusionWords.some(word => lastParagraph.includes(word))
      
      if (hasIntro) score += 5
      if (hasConclusion) score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeVocabulary(text: string): number {
    let score = 75 // Base score

    const words = text.toLowerCase().match(/\\b\\w+\\b/g) || []
    const uniqueWords = new Set(words)
    const vocabularyRichness = uniqueWords.size / words.length

    // Vocabulary diversity
    if (vocabularyRichness > 0.7) score += 15
    else if (vocabularyRichness > 0.6) score += 10
    else if (vocabularyRichness > 0.5) score += 5

    // Check for sophisticated vocabulary
    const sophisticatedWords = [
      'analyze', 'synthesize', 'comprehensive', 'innovative', 'strategic',
      'collaborate', 'facilitate', 'optimize', 'leverage', 'implement',
      'substantial', 'significant', 'efficient', 'effective', 'dynamic'
    ]
    
    let sophisticatedCount = 0
    for (const word of sophisticatedWords) {
      if (text.toLowerCase().includes(word)) {
        sophisticatedCount++
      }
    }
    
    if (sophisticatedCount > 0) score += Math.min(10, sophisticatedCount * 2)

    // Check for overuse of weak words
    const weakWords = ['very', 'really', 'quite', 'pretty', 'just', 'maybe', 'perhaps']
    let weakWordCount = 0
    for (const word of weakWords) {
      const matches = text.toLowerCase().match(new RegExp(`\\\\b${word}\\\\b`, 'g'))
      if (matches) weakWordCount += matches.length
    }
    
    if (weakWordCount > words.length / 100) {
      score -= Math.min(15, weakWordCount)
    }

    // Check for repetitive words (excluding common words)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'])
    const wordFreq: { [key: string]: number } = {}
    
    for (const word of words) {
      if (!commonWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }
    
    const overusedWords = Object.entries(wordFreq).filter(([_, count]) => count > 5)
    if (overusedWords.length > 0) {
      score -= Math.min(10, overusedWords.length * 2)
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeCoherence(text: string): number {
    let score = 80 // Base score

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0)

    // Check for logical flow indicators
    const flowIndicators = [
      'first', 'second', 'third', 'next', 'then', 'finally',
      'before', 'after', 'during', 'while', 'meanwhile',
      'because', 'since', 'therefore', 'thus', 'consequently',
      'although', 'however', 'nevertheless', 'despite'
    ]
    
    let flowCount = 0
    const lowerText = text.toLowerCase()
    for (const indicator of flowIndicators) {
      if (lowerText.includes(indicator)) {
        flowCount++
      }
    }
    
    if (flowCount > sentences.length / 10) score += 10

    // Check for topic consistency (basic keyword analysis)
    const words = text.toLowerCase().match(/\\b\\w+\\b/g) || []
    const wordFreq: { [key: string]: number } = {}
    
    for (const word of words) {
      if (word.length > 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }
    
    const topWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
    
    // Check if top words appear throughout the text (consistency)
    let consistencyScore = 0
    for (const word of topWords.slice(0, 5)) {
      const positions = []
      let index = lowerText.indexOf(word)
      while (index !== -1) {
        positions.push(index / text.length)
        index = lowerText.indexOf(word, index + 1)
      }
      
      if (positions.length > 1) {
        const spread = Math.max(...positions) - Math.min(...positions)
        if (spread > 0.5) consistencyScore += 2 // Word appears throughout
      }
    }
    
    score += consistencyScore

    return Math.max(0, Math.min(100, score))
  }

  private findGrammarIssues(text: string): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; suggestion?: string }> {
    const issues = []

    // Passive voice detection
    const passivePatterns = [
      /\\b(was|were|is|are|am|be|been|being)\\s+\\w+ed\\b/gi,
      /\\b(was|were|is|are|am|be|been|being)\\s+\\w+en\\b/gi
    ]
    
    for (const pattern of passivePatterns) {
      const matches = text.match(pattern)
      if (matches && matches.length > 3) {
        issues.push({
          type: 'style',
          message: `Frequent passive voice usage (${matches.length} instances)`,
          severity: 'medium',
          suggestion: 'Consider using more active voice constructions'
        })
        break
      }
    }

    return issues
  }

  private findStructureIssues(text: string): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const issues = []
    const paragraphs = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0)

    // Single paragraph issue
    if (paragraphs.length === 1 && text.length > 300) {
      issues.push({
        type: 'structure',
        message: 'Consider breaking long content into multiple paragraphs',
        severity: 'medium'
      })
    }

    // Very short paragraphs
    const shortParagraphs = paragraphs.filter(p => p.split(' ').length < 20)
    if (shortParagraphs.length > paragraphs.length / 2) {
      issues.push({
        type: 'structure',
        message: 'Many paragraphs are quite short - consider expanding ideas',
        severity: 'low'
      })
    }

    return issues
  }

  private findVocabularyIssues(text: string): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const issues = []

    // Repetitive word usage
    const words = text.toLowerCase().match(/\\b\\w{4,}\\b/g) || []
    const wordCounts: { [key: string]: number } = {}
    
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    }

    const overusedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 4 && !['that', 'with', 'this', 'they', 'have', 'will', 'from', 'been', 'more', 'some', 'like', 'what', 'time', 'very', 'when', 'much', 'would', 'there', 'could', 'other'].includes(word))
      .sort(([, a], [, b]) => b - a)

    if (overusedWords.length > 0) {
      const [word, count] = overusedWords[0]
      issues.push({
        type: 'vocabulary',
        message: `Word "${word}" appears ${count} times - consider using synonyms`,
        severity: count > 6 ? 'medium' : 'low'
      })
    }

    return issues
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  }

  private generateFeedback(
    grammarScore: number,
    structureScore: number,
    vocabularyScore: number,
    coherenceScore: number,
    issues: Array<{ type: string; message: string; severity: string }>
  ): string[] {
    const feedback = []

    if (grammarScore >= 90) feedback.push('Excellent grammar and mechanics')
    else if (grammarScore >= 80) feedback.push('Good grammar with minor issues')
    else if (grammarScore >= 70) feedback.push('Adequate grammar, some improvement needed')
    else feedback.push('Grammar needs significant improvement')

    if (structureScore >= 90) feedback.push('Well-structured and organized content')
    else if (structureScore >= 80) feedback.push('Good structure with clear flow')
    else if (structureScore >= 70) feedback.push('Adequate structure, could be improved')
    else feedback.push('Structure needs significant improvement')

    if (vocabularyScore >= 90) feedback.push('Rich and varied vocabulary')
    else if (vocabularyScore >= 80) feedback.push('Good vocabulary usage')
    else if (vocabularyScore >= 70) feedback.push('Adequate vocabulary, consider expanding')
    else feedback.push('Vocabulary could be more varied and sophisticated')

    if (coherenceScore >= 90) feedback.push('Excellent coherence and flow')
    else if (coherenceScore >= 80) feedback.push('Good logical flow')
    else if (coherenceScore >= 70) feedback.push('Generally coherent with some gaps')
    else feedback.push('Coherence and logical flow need improvement')

    // Add specific issue feedback
    const highSeverityIssues = issues.filter(i => i.severity === 'high')
    if (highSeverityIssues.length > 0) {
      feedback.push('Address critical writing issues identified')
    }

    return feedback
  }
}