export interface EnglishProficiencyResult {
  score: number
  fluency_score: number
  grammar_accuracy_score: number
  vocabulary_usage_score: number
  sentence_complexity_score: number
  language_confidence: 'native' | 'advanced' | 'intermediate' | 'beginner'
  issues: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
    examples?: string[]
  }>
  feedback: string[]
}

export class EnglishProficiencyAnalyzer {
  analyze(text: string): EnglishProficiencyResult {
    const fluencyScore = this.analyzeFluency(text)
    const grammarScore = this.analyzeGrammarAccuracy(text)
    const vocabularyScore = this.analyzeVocabularyUsage(text)
    const complexityScore = this.analyzeSentenceComplexity(text)
    
    const overallScore = Math.round(
      (fluencyScore + grammarScore + vocabularyScore + complexityScore) / 4
    )
    
    const confidence = this.determineLanguageConfidence(overallScore)
    const issues = this.identifyLanguageIssues(text)
    const feedback = this.generateFeedback(fluencyScore, grammarScore, vocabularyScore, complexityScore)

    return {
      score: overallScore,
      fluency_score: fluencyScore,
      grammar_accuracy_score: grammarScore,
      vocabulary_usage_score: vocabularyScore,
      sentence_complexity_score: complexityScore,
      language_confidence: confidence,
      issues,
      feedback
    }
  }

  private analyzeFluency(text: string): number {
    let score = 80 // Base score

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/).filter(w => w.trim().length > 0)
    
    if (sentences.length === 0 || words.length === 0) return 0

    // Average words per sentence (fluency indicator)
    const avgWordsPerSentence = words.length / sentences.length
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) score += 10
    else if (avgWordsPerSentence < 5 || avgWordsPerSentence > 35) score -= 15

    // Check for natural flow indicators
    const flowWords = [
      'however', 'therefore', 'moreover', 'furthermore', 'nevertheless',
      'consequently', 'meanwhile', 'similarly', 'in addition', 'for example',
      'in contrast', 'on the other hand', 'as a result', 'in fact'
    ]
    
    let flowWordCount = 0
    const lowerText = text.toLowerCase()
    for (const word of flowWords) {
      if (lowerText.includes(word)) flowWordCount++
    }
    
    if (flowWordCount > 0) score += Math.min(10, flowWordCount * 2)

    // Check for repetitive sentence starters
    const sentenceStarters = sentences.map(s => {
      const words = s.trim().toLowerCase().split(/\s+/)
      return words[0] || ''
    })
    
    const starterFreq: { [key: string]: number } = {}
    for (const starter of sentenceStarters) {
      if (starter.length > 0) {
        starterFreq[starter] = (starterFreq[starter] || 0) + 1
      }
    }
    
    const repetitiveStarters = Object.values(starterFreq).filter(count => count > 3)
    if (repetitiveStarters.length > 0) score -= 15

    // Check for unnatural word combinations (common ESL patterns)
    const unnaturalPatterns = [
      /\bmake a research\b/gi, // should be "do research" or "conduct research"
      /\binformations\b/gi, // information is uncountable
      /\bequipments\b/gi, // equipment is uncountable
      /\badvices\b/gi, // advice is uncountable
      /\bfunny\s+(thing|story)\b/gi, // often misused instead of "interesting"
      /\bvery much\s+(like|want)\b/gi, // unnatural placement
      /\bmore better\b/gi, // double comparative
      /\bmost best\b/gi, // double superlative
    ]
    
    for (const pattern of unnaturalPatterns) {
      const matches = text.match(pattern)
      if (matches) score -= matches.length * 5
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeGrammarAccuracy(text: string): number {
    let score = 85 // Base score

    // Common ESL grammar errors
    const grammarErrors = [
      // Article errors
      { pattern: /\b(go to|at|in)\s+(hospital|school|university|work)\b/gi, weight: 2 },
      { pattern: /\ba\s+(hour|honest|honor)\b/gi, weight: 3 }, // should be "an"
      { pattern: /\ban\s+(university|user|uniform)\b/gi, weight: 3 }, // should be "a"
      
      // Preposition errors
      { pattern: /\bdepend of\b/gi, weight: 4 }, // should be "depend on"
      { pattern: /\binterested for\b/gi, weight: 4 }, // should be "interested in"
      { pattern: /\bdifferent than\b/gi, weight: 2 }, // should be "different from"
      { pattern: /\bmarried with\b/gi, weight: 3 }, // should be "married to"
      
      // Verb form errors
      { pattern: /\bI am agree\b/gi, weight: 5 }, // should be "I agree"
      { pattern: /\bI am understand\b/gi, weight: 5 }, // should be "I understand"
      { pattern: /\bI am knowing\b/gi, weight: 4 }, // should be "I know"
      
      // Word order errors
      { pattern: /\ball of them are\b/gi, weight: 2 }, // often "they all are"
      { pattern: /\bevery day life\b/gi, weight: 3 }, // should be "everyday life"
    ]

    let totalErrors = 0
    for (const error of grammarErrors) {
      const matches = text.match(error.pattern)
      if (matches) {
        totalErrors += matches.length * error.weight
      }
    }

    score -= Math.min(40, totalErrors)

    // Check for subject-verb agreement
    const svAgreementErrors = [
      /\b(he|she|it)\s+(are|were|have|do)\b/gi,
      /\b(they|we|you)\s+(is|was|has|does)\b/gi,
      /\b(I)\s+(are|is|am not|have not|has)\b/gi,
    ]
    
    for (const pattern of svAgreementErrors) {
      const matches = text.match(pattern)
      if (matches) score -= matches.length * 3
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeVocabularyUsage(text: string): number {
    let score = 75 // Base score

    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const uniqueWords = new Set(words)
    const vocabularyRichness = uniqueWords.size / words.length

    // Vocabulary diversity
    if (vocabularyRichness > 0.7) score += 15
    else if (vocabularyRichness > 0.6) score += 10
    else if (vocabularyRichness > 0.5) score += 5
    else if (vocabularyRichness < 0.4) score -= 10

    // Check for advanced vocabulary
    const advancedWords = [
      'analyze', 'synthesize', 'comprehensive', 'substantial', 'significant',
      'innovative', 'strategic', 'facilitate', 'implement', 'optimize',
      'collaborate', 'demonstrate', 'establish', 'maintain', 'enhance',
      'contribute', 'participate', 'investigate', 'determine', 'evaluate'
    ]
    
    let advancedCount = 0
    for (const word of advancedWords) {
      if (text.toLowerCase().includes(word)) advancedCount++
    }
    
    if (advancedCount > 3) score += 15
    else if (advancedCount > 1) score += 10
    else if (advancedCount > 0) score += 5

    // Check for overuse of simple words
    const simpleWords = ['good', 'bad', 'big', 'small', 'nice', 'very', 'really', 'things']
    let simpleWordCount = 0
    for (const word of simpleWords) {
      const matches = text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g'))
      if (matches) simpleWordCount += matches.length
    }
    
    if (simpleWordCount > words.length / 50) score -= 10

    // Check for word form errors (common ESL mistakes)
    const wordFormErrors = [
      /\bmore easy\b/gi, // should be "easier"
      /\bmore good\b/gi, // should be "better"
      /\bmore bad\b/gi, // should be "worse"
      /\bchilds\b/gi, // should be "children"
      /\bmans\b/gi, // should be "men"
      /\bwomans\b/gi, // should be "women"
      /\bpeoples\b/gi, // people is already plural
    ]
    
    for (const pattern of wordFormErrors) {
      const matches = text.match(pattern)
      if (matches) score -= matches.length * 4
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeSentenceComplexity(text: string): number {
    let score = 70 // Base score

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    if (sentences.length === 0) return 0

    let totalComplexity = 0
    let complexSentences = 0
    let simpleSentences = 0

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/)
      const clauses = sentence.split(/,|;|:|\s+(and|but|or|because|although|if|when|while|since|as|that|which|who)\s+/i).length
      
      let sentenceComplexity = 0
      
      // Length-based complexity
      if (words.length > 20) sentenceComplexity += 3
      else if (words.length > 15) sentenceComplexity += 2
      else if (words.length > 10) sentenceComplexity += 1
      else if (words.length < 5) sentenceComplexity -= 1
      
      // Clause-based complexity
      if (clauses > 3) sentenceComplexity += 2
      else if (clauses > 2) sentenceComplexity += 1
      
      // Check for complex grammatical structures
      const complexStructures = [
        /\b(having|having been|being|been)\s+\w+ed\b/gi, // participle constructions
        /\b(not only|neither|either)\b.*\b(but also|nor|or)\b/gi, // correlative conjunctions
        /\b(despite|although|whereas|nevertheless)\b/gi, // sophisticated conjunctions
        /\b(which|who|whom|whose|that)\b/gi, // relative clauses
      ]
      
      for (const pattern of complexStructures) {
        const matches = sentence.match(pattern)
        if (matches) sentenceComplexity += matches.length
      }
      
      totalComplexity += sentenceComplexity
      
      if (sentenceComplexity > 3) complexSentences++
      else if (sentenceComplexity < 1) simpleSentences++
    }

    const avgComplexity = totalComplexity / sentences.length
    
    // Optimal complexity range
    if (avgComplexity >= 1.5 && avgComplexity <= 3) score += 15
    else if (avgComplexity >= 1 && avgComplexity <= 4) score += 10
    else if (avgComplexity < 0.5) score -= 15 // Too simple
    else if (avgComplexity > 5) score -= 10 // Too complex

    // Balance of simple and complex sentences
    const complexRatio = complexSentences / sentences.length
    if (complexRatio >= 0.2 && complexRatio <= 0.6) score += 10
    else if (complexRatio > 0.8) score -= 5 // Too many complex sentences

    return Math.max(0, Math.min(100, score))
  }

  private determineLanguageConfidence(score: number): 'native' | 'advanced' | 'intermediate' | 'beginner' {
    if (score >= 90) return 'native'
    if (score >= 80) return 'advanced'
    if (score >= 65) return 'intermediate'
    return 'beginner'
  }

  private identifyLanguageIssues(text: string): Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
    examples?: string[]
  }> {
    const issues = []

    // Check for frequent basic errors
    const basicErrors = [
      { pattern: /\ba\s+hour\b/gi, message: 'Article usage: should be "an hour"', severity: 'medium' as const },
      { pattern: /\bmake a research\b/gi, message: 'Collocation error: should be "do research" or "conduct research"', severity: 'high' as const },
      { pattern: /\binformations\b/gi, message: 'Countability error: "information" is uncountable', severity: 'high' as const },
    ]

    for (const error of basicErrors) {
      const matches = text.match(error.pattern)
      if (matches) {
        issues.push({
          type: 'grammar',
          message: error.message,
          severity: error.severity,
          examples: matches.map(m => m.trim())
        })
      }
    }

    // Check for word order issues
    const wordOrderIssues = text.match(/\ball of them are\b/gi)
    if (wordOrderIssues) {
      issues.push({
        type: 'word-order',
        message: 'Unnatural word order detected',
        severity: 'medium',
        examples: wordOrderIssues
      })
    }

    return issues
  }

  private generateFeedback(
    fluencyScore: number,
    grammarScore: number,
    vocabularyScore: number,
    complexityScore: number
  ): string[] {
    const feedback = []

    if (fluencyScore >= 85) feedback.push('Excellent fluency and natural expression')
    else if (fluencyScore >= 75) feedback.push('Good fluency with minor issues')
    else if (fluencyScore >= 65) feedback.push('Adequate fluency, some improvement needed')
    else feedback.push('Fluency needs significant improvement')

    if (grammarScore >= 85) feedback.push('Strong grammatical accuracy')
    else if (grammarScore >= 75) feedback.push('Good grammar with minor errors')
    else if (grammarScore >= 65) feedback.push('Acceptable grammar, focus on common errors')
    else feedback.push('Grammar needs substantial work')

    if (vocabularyScore >= 85) feedback.push('Rich and appropriate vocabulary usage')
    else if (vocabularyScore >= 75) feedback.push('Good vocabulary range')
    else if (vocabularyScore >= 65) feedback.push('Adequate vocabulary, could be expanded')
    else feedback.push('Limited vocabulary range')

    if (complexityScore >= 85) feedback.push('Excellent sentence complexity and variety')
    else if (complexityScore >= 75) feedback.push('Good sentence structure variety')
    else if (complexityScore >= 65) feedback.push('Adequate complexity, add more variety')
    else feedback.push('Sentences are too simple or too complex')

    return feedback
  }
}