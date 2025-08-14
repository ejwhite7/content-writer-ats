export interface ReadabilityResult {
  score: number
  grade_level: number
  reading_ease: number
  flesch_kincaid_grade: number
  flesch_reading_ease: number
  gunning_fog_index: number
  smog_index: number
  automated_readability_index: number
  coleman_liau_index: number
  metrics: {
    sentences: number
    words: number
    syllables: number
    avg_sentence_length: number
    avg_syllables_per_word: number
  }
  feedback: string[]
}

export class ReadabilityAnalyzer {
  analyze(text: string): ReadabilityResult {
    // Handle empty text
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        grade_level: 0,
        reading_ease: 0,
        flesch_kincaid_grade: 0,
        flesch_reading_ease: 0,
        gunning_fog_index: 0,
        smog_index: 0,
        automated_readability_index: 0,
        coleman_liau_index: 0,
        metrics: {
          sentences: 0,
          words: 0,
          syllables: 0,
          avg_sentence_length: 0,
          avg_syllables_per_word: 0
        },
        feedback: ['No content to analyze']
      }
    }

    const sentences = this.countSentences(text)
    const words = this.countWords(text)
    const syllables = this.countSyllables(text)
    const complexWords = this.countComplexWords(text)
    const charactersNoSpaces = text.replace(/\s/g, '').length

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59

    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)

    // Gunning Fog Index
    const gunningFogIndex = 0.4 * ((words / sentences) + 100 * (complexWords / words))

    // SMOG Index
    const smogIndex = 1.0430 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291

    // Automated Readability Index
    const automatedReadabilityIndex = 4.71 * (charactersNoSpaces / words) + 0.5 * (words / sentences) - 21.43

    // Coleman-Liau Index
    const L = (charactersNoSpaces / words) * 100
    const S = (sentences / words) * 100
    const colemanLiauIndex = 0.0588 * L - 0.296 * S - 15.8

    // Calculate overall score (higher is better, 0-100)
    const averageGradeLevel = (fleschKincaidGrade + gunningFogIndex + smogIndex + automatedReadabilityIndex + colemanLiauIndex) / 5
    
    // Target grade level for content writing: 8-12
    let score = 100
    if (averageGradeLevel < 6) {
      score = 70 // Too simple
    } else if (averageGradeLevel <= 8) {
      score = 85 // Good for general audience
    } else if (averageGradeLevel <= 12) {
      score = 95 // Excellent for most content
    } else if (averageGradeLevel <= 16) {
      score = 80 // Academic but acceptable
    } else {
      score = 60 // Too complex
    }

    // Adjust for Flesch Reading Ease
    if (fleschReadingEase >= 90) score += 5 // Very easy
    else if (fleschReadingEase >= 80) score += 3 // Easy
    else if (fleschReadingEase >= 70) score += 1 // Fairly easy
    else if (fleschReadingEase < 30) score -= 10 // Very difficult

    const feedback = this.generateFeedback(fleschReadingEase, averageGradeLevel, words, sentences)

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      grade_level: Math.round(averageGradeLevel * 10) / 10,
      reading_ease: Math.round(fleschReadingEase * 10) / 10,
      flesch_kincaid_grade: Math.round(fleschKincaidGrade * 10) / 10,
      flesch_reading_ease: Math.round(fleschReadingEase * 10) / 10,
      gunning_fog_index: Math.round(gunningFogIndex * 10) / 10,
      smog_index: Math.round(smogIndex * 10) / 10,
      automated_readability_index: Math.round(automatedReadabilityIndex * 10) / 10,
      coleman_liau_index: Math.round(colemanLiauIndex * 10) / 10,
      metrics: {
        sentences,
        words,
        syllables,
        avg_sentence_length: Math.round((words / sentences) * 10) / 10,
        avg_syllables_per_word: Math.round((syllables / words) * 10) / 10
      },
      feedback
    }
  }

  private countSentences(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return Math.max(1, sentences.length)
  }

  private countWords(text: string): number {
    const words = text.split(/\s+/).filter(w => w.trim().length > 0)
    return Math.max(1, words.length)
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/)
    let totalSyllables = 0

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (cleanWord.length === 0) continue

      let syllables = cleanWord.match(/[aeiouy]+/g)?.length || 1
      
      // Adjust for silent e
      if (cleanWord.endsWith('e')) syllables--
      
      // Ensure at least 1 syllable
      syllables = Math.max(1, syllables)
      totalSyllables += syllables
    }

    return totalSyllables
  }

  private countComplexWords(text: string): number {
    const words = text.toLowerCase().split(/\s+/)
    let complexWords = 0

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (cleanWord.length === 0) continue

      // Skip common endings
      if (cleanWord.match(/(ed|ing|es|s)$/)) continue

      const syllables = this.countSyllablesInWord(cleanWord)
      if (syllables >= 3) {
        complexWords++
      }
    }

    return complexWords
  }

  private countSyllablesInWord(word: string): number {
    let syllables = word.match(/[aeiouy]+/g)?.length || 1
    if (word.endsWith('e')) syllables--
    return Math.max(1, syllables)
  }

  private generateFeedback(readingEase: number, gradeLevel: number, wordCount: number, sentenceCount: number): string[] {
    const feedback = []
    const avgWordsPerSentence = wordCount / sentenceCount

    // Reading ease feedback
    if (readingEase >= 90) {
      feedback.push('Excellent readability - very easy to understand')
    } else if (readingEase >= 80) {
      feedback.push('Good readability - easy to read')
    } else if (readingEase >= 70) {
      feedback.push('Fair readability - fairly easy to read')
    } else if (readingEase >= 60) {
      feedback.push('Acceptable readability - standard difficulty')
    } else if (readingEase >= 50) {
      feedback.push('Difficult to read - consider simplifying')
    } else {
      feedback.push('Very difficult to read - needs significant simplification')
    }

    // Grade level feedback
    if (gradeLevel <= 8) {
      feedback.push('Appropriate for general audiences')
    } else if (gradeLevel <= 12) {
      feedback.push('Good for educated general audience')
    } else if (gradeLevel <= 16) {
      feedback.push('Academic level - may be too complex for general audience')
    } else {
      feedback.push('Graduate level - likely too complex for most readers')
    }

    // Sentence length feedback
    if (avgWordsPerSentence > 25) {
      feedback.push('Consider shortening sentences for better readability')
    } else if (avgWordsPerSentence > 20) {
      feedback.push('Sentence length is good but could be more varied')
    } else {
      feedback.push('Good sentence length variety')
    }

    return feedback
  }
}