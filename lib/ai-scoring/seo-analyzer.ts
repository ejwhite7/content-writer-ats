export interface SEOResult {
  score: number
  heading_structure_score: number
  keyword_optimization_score: number
  internal_linking_score: number
  meta_elements_score: number
  content_length_score: number
  recommendations: string[]
  issues: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
}

export class SEOAnalyzer {
  analyze(content: string): SEOResult {
    const headingScore = this.analyzeHeadingStructure(content)
    const keywordScore = this.analyzeKeywordOptimization(content)
    const linkingScore = this.analyzeInternalLinking(content)
    const metaScore = this.analyzeMetaElements(content)
    const lengthScore = this.analyzeContentLength(content)

    const overallScore = Math.round(
      (headingScore + keywordScore + linkingScore + metaScore + lengthScore) / 5
    )

    const recommendations = this.generateRecommendations({
      headingScore,
      keywordScore,
      linkingScore,
      metaScore,
      lengthScore
    })

    const issues = this.identifyIssues(content)

    return {
      score: overallScore,
      heading_structure_score: headingScore,
      keyword_optimization_score: keywordScore,
      internal_linking_score: linkingScore,
      meta_elements_score: metaScore,
      content_length_score: lengthScore,
      recommendations,
      issues
    }
  }

  private analyzeHeadingStructure(content: string): number {
    let score = 60 // Base score

    const h1Tags = content.match(/<h1[^>]*>.*?<\/h1>/gi) || []
    const h2Tags = content.match(/<h2[^>]*>.*?<\/h2>/gi) || []
    const h3Tags = content.match(/<h3[^>]*>.*?<\/h3>/gi) || []
    const h4Tags = content.match(/<h4[^>]*>.*?<\/h4>/gi) || []

    // Check for proper heading hierarchy
    if (h1Tags.length === 1) score += 15 // Single H1
    else if (h1Tags.length === 0) score -= 10 // No H1
    else score -= 20 // Multiple H1s

    if (h2Tags.length > 0) score += 10 // Has subheadings
    if (h3Tags.length > 0) score += 5 // Has sub-subheadings

    // Analyze heading content for keywords
    const headingText = [...h1Tags, ...h2Tags, ...h3Tags, ...h4Tags]
      .map(tag => tag.replace(/<[^>]*>/g, '').toLowerCase())
      .join(' ')

    if (headingText.length > 0) {
      const words = content.toLowerCase().match(/\b\w{4,}\b/g) || []
      const wordFreq: { [key: string]: number } = {}
      for (const word of words) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
      
      const topWords = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word)
      
      let keywordInHeadings = 0
      for (const word of topWords) {
        if (headingText.includes(word)) keywordInHeadings++
      }
      
      if (keywordInHeadings > 2) score += 15
      else if (keywordInHeadings > 0) score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  private analyzeKeywordOptimization(content: string): number {
    let score = 70 // Base score
    
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || []
    if (words.length === 0) return 0

    // Calculate keyword density for top words
    const wordFreq: { [key: string]: number } = {}
    for (const word of words) {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }

    const topWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    for (const [word, count] of topWords) {
      const density = (count / words.length) * 100
      
      if (density >= 1 && density <= 3) {
        score += 10 // Optimal density
      } else if (density > 3 && density <= 5) {
        score += 5 // Acceptable but high
      } else if (density > 5) {
        score -= 10 // Keyword stuffing
      }
    }

    // Check for long-tail keywords (phrases)
    const phrases = content.toLowerCase().match(/\b\w+\s+\w+\s+\w+\b/g) || []
    const phraseFreq: { [key: string]: number } = {}
    
    for (const phrase of phrases) {
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1
    }
    
    const repeatedPhrases = Object.entries(phraseFreq)
      .filter(([, count]) => count > 1)
      .length
    
    if (repeatedPhrases > 0) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private analyzeInternalLinking(content: string): number {
    let score = 70 // Base score

    const links = content.match(/<a[^>]+href=["'][^"']*["'][^>]*>.*?<\/a>/gi) || []
    const internalLinks = links.filter(link => 
      !link.includes('http://') && !link.includes('https://') ||
      link.includes(process.env.NEXT_PUBLIC_APP_URL || '')
    )
    const externalLinks = links.filter(link => 
      link.includes('http://') || link.includes('https://') &&
      !link.includes(process.env.NEXT_PUBLIC_APP_URL || '')
    )

    // Score based on link presence
    if (internalLinks.length > 0) score += 15
    if (externalLinks.length > 0) score += 10
    
    // Check for descriptive anchor text
    const anchorTexts = links.map(link => {
      const match = link.match(/>([^<]*)</)
      return match ? match[1].toLowerCase() : ''
    })
    
    const genericAnchors = anchorTexts.filter(text => 
      ['click here', 'read more', 'here', 'this', 'link'].includes(text)
    )
    
    if (genericAnchors.length === 0 && links.length > 0) score += 15
    else if (genericAnchors.length < links.length / 2) score += 5
    else if (genericAnchors.length > 0) score -= 10

    return Math.max(0, Math.min(100, score))
  }

  private analyzeMetaElements(content: string): number {
    let score = 50 // Base score

    // Check for meta description-like content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const firstSentence = sentences[0]?.trim() || ''
    
    if (firstSentence.length >= 120 && firstSentence.length <= 160) {
      score += 20 // Good meta description length
    } else if (firstSentence.length >= 100 && firstSentence.length <= 200) {
      score += 10 // Acceptable length
    }

    // Check for title-like structure
    const titlePattern = /^.{30,60}$/
    const potentialTitle = content.split('\n')[0]?.replace(/<[^>]*>/g, '').trim() || ''
    
    if (titlePattern.test(potentialTitle)) {
      score += 20 // Good title length
    } else if (potentialTitle.length > 0) {
      score += 10 // Has title
    }

    // Check for structured data indicators
    const structuredIndicators = [
      'article', 'author', 'published', 'updated', 'category', 'tag'
    ]
    
    let structuredCount = 0
    const lowerContent = content.toLowerCase()
    for (const indicator of structuredIndicators) {
      if (lowerContent.includes(indicator)) structuredCount++
    }
    
    if (structuredCount > 2) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private analyzeContentLength(content: string): number {
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length

    if (wordCount >= 300 && wordCount <= 600) return 100 // Optimal for blog posts
    if (wordCount >= 600 && wordCount <= 1200) return 95 // Good for articles
    if (wordCount >= 200 && wordCount <= 300) return 85 // Acceptable minimum
    if (wordCount >= 1200 && wordCount <= 2000) return 90 // Long-form content
    if (wordCount < 200) return 60 // Too short
    if (wordCount > 2000) return 80 // Very long
    
    return 70 // Default
  }

  private generateRecommendations(scores: any): string[] {
    const recommendations = []

    if (scores.headingScore < 80) {
      recommendations.push('Improve heading structure with proper H1, H2, H3 hierarchy')
    }
    if (scores.keywordScore < 80) {
      recommendations.push('Optimize keyword usage and avoid over-optimization')
    }
    if (scores.linkingScore < 80) {
      recommendations.push('Add internal links with descriptive anchor text')
    }
    if (scores.metaScore < 80) {
      recommendations.push('Include meta-friendly introductory content')
    }
    if (scores.lengthScore < 80) {
      recommendations.push('Adjust content length for optimal SEO performance')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great SEO optimization! Consider A/B testing for further improvements')
    }

    return recommendations
  }

  private identifyIssues(content: string): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const issues = []

    // Check for keyword stuffing
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || []
    const wordFreq: { [key: string]: number } = {}
    for (const word of words) {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }

    const overOptimized = Object.entries(wordFreq)
      .filter(([, count]) => (count / words.length) * 100 > 5)
    
    if (overOptimized.length > 0) {
      issues.push({
        type: 'keyword-stuffing',
        message: `Potential keyword stuffing detected for: ${overOptimized.map(([word]) => word).join(', ')}`,
        severity: 'high'
      })
    }

    // Check for missing headings
    const hasHeadings = content.includes('<h1') || content.includes('<h2') || content.includes('<h3')
    if (!hasHeadings && content.length > 300) {
      issues.push({
        type: 'structure',
        message: 'No headings found - add H1, H2, H3 tags for better structure',
        severity: 'medium'
      })
    }

    return issues
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'that', 'this',
      'these', 'those', 'they', 'them', 'their', 'there', 'where', 'when', 'why', 'how',
      'what', 'which', 'who', 'whom', 'whose', 'if', 'then', 'else', 'while', 'until',
      'since', 'before', 'after', 'during', 'through', 'above', 'below', 'up', 'down',
      'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ])
    return stopWords.has(word)
  }
}