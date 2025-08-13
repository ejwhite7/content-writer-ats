import Anthropic from '@anthropic-ai/sdk'
import { ReadabilityAnalyzer } from './readability-analyzer'
import { WritingQualityAnalyzer } from './writing-quality-analyzer'
import { SEOAnalyzer } from './seo-analyzer'
import { EnglishProficiencyAnalyzer } from './english-proficiency-analyzer'
import { AIDetectionAnalyzer } from './ai-detection-analyzer'
import { cache } from '@/lib/redis/cache'
import crypto from 'crypto'

export interface AIScores {
  readability_score: number
  writing_quality_score: number
  seo_score: number
  english_proficiency_score: number
  ai_detection_score: number
  composite_score: number
  detailed_feedback: {
    readability: any
    writing_quality: any
    seo: any
    english_proficiency: any
    ai_detection: any
  }
  anthropic_analysis?: any
}

export class AIScorer {
  private anthropic: Anthropic
  private readabilityAnalyzer: ReadabilityAnalyzer
  private writingQualityAnalyzer: WritingQualityAnalyzer
  private seoAnalyzer: SEOAnalyzer
  private englishProficiencyAnalyzer: EnglishProficiencyAnalyzer
  private aiDetectionAnalyzer: AIDetectionAnalyzer

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    this.readabilityAnalyzer = new ReadabilityAnalyzer()
    this.writingQualityAnalyzer = new WritingQualityAnalyzer()
    this.seoAnalyzer = new SEOAnalyzer()
    this.englishProficiencyAnalyzer = new EnglishProficiencyAnalyzer()
    this.aiDetectionAnalyzer = new AIDetectionAnalyzer()
  }

  async scoreAssessment(content: string, jobSettings: any): Promise<AIScores> {
    try {
      // Generate cache key based on content and settings
      const cacheKey = this.generateCacheKey(content, jobSettings)
      
      // Try to get cached result
      const cachedResult = await cache.getCachedAIScores(cacheKey)
      if (cachedResult) {
        console.log('Using cached AI scoring result')
        return cachedResult
      }

      // Run all scoring analyses in parallel
      const [
        readabilityResult,
        writingQualityResult,
        seoResult,
        englishProficiencyResult,
        aiDetectionResult,
        anthropicAnalysis
      ] = await Promise.all([
        this.readabilityAnalyzer.analyze(content),
        this.writingQualityAnalyzer.analyze(content),
        this.seoAnalyzer.analyze(content),
        this.englishProficiencyAnalyzer.analyze(content),
        this.aiDetectionAnalyzer.analyze(content),
        this.getAnthropicAnalysis(content, jobSettings)
      ])

      // Calculate weighted composite score
      const weights = {
        readability: jobSettings?.readability_weight || 20,
        writing_quality: jobSettings?.writing_quality_weight || 30,
        seo: jobSettings?.seo_weight || 20,
        english_proficiency: jobSettings?.english_proficiency_weight || 15,
        ai_detection: jobSettings?.ai_detection_weight || 15
      }

      const compositeScore = (
        (readabilityResult.score * weights.readability) +
        (writingQualityResult.score * weights.writing_quality) +
        (seoResult.score * weights.seo) +
        (englishProficiencyResult.score * weights.english_proficiency) +
        (aiDetectionResult.score * weights.ai_detection)
      ) / 100

      const result: AIScores = {
        readability_score: readabilityResult.score,
        writing_quality_score: writingQualityResult.score,
        seo_score: seoResult.score,
        english_proficiency_score: englishProficiencyResult.score,
        ai_detection_score: aiDetectionResult.score,
        composite_score: Math.round(compositeScore),
        detailed_feedback: {
          readability: readabilityResult,
          writing_quality: writingQualityResult,
          seo: seoResult,
          english_proficiency: englishProficiencyResult,
          ai_detection: aiDetectionResult,
        },
        anthropic_analysis: anthropicAnalysis
      }

      // Cache the result for 24 hours (AI scores rarely change for same content)
      await cache.cacheAIScores(cacheKey, result, 86400)
      
      return result

    } catch (error) {
      console.error('Error in AI scoring:', error)
      throw error
    }
  }

  private generateCacheKey(content: string, jobSettings: any): string {
    // Create a hash of the content and relevant job settings
    const contentHash = crypto.createHash('sha256').update(content).digest('hex')
    const settingsHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        readability_weight: jobSettings?.readability_weight || 20,
        writing_quality_weight: jobSettings?.writing_quality_weight || 30,
        seo_weight: jobSettings?.seo_weight || 20,
        english_proficiency_weight: jobSettings?.english_proficiency_weight || 15,
        ai_detection_weight: jobSettings?.ai_detection_weight || 15,
        role_type: jobSettings?.role_type || 'content_writing'
      }))
      .digest('hex')
    
    return `${contentHash}_${settingsHash.substring(0, 8)}`
  }

  private async getAnthropicAnalysis(content: string, jobSettings: any) {
    try {
      const prompt = `
Analyze this content writing sample for a ${jobSettings?.role_type || 'content writing'} position.

Content to analyze:
"""
${content}
"""

Please provide a comprehensive analysis including:

1. **Overall Quality Assessment** (1-10 score)
   - Writing clarity and coherence
   - Argument structure and flow
   - Engagement and readability

2. **Technical Writing Skills** (1-10 score)
   - Grammar and syntax
   - Vocabulary usage
   - Sentence variety

3. **Content Strategy** (1-10 score)
   - Understanding of audience
   - Value proposition clarity
   - Call-to-action effectiveness

4. **SEO & Digital Marketing** (1-10 score)
   - Keyword usage (natural integration)
   - Meta descriptions and headings
   - Content structure for web

5. **Strengths and Areas for Improvement**
   - List 3 key strengths
   - List 3 areas that could be improved

6. **Hiring Recommendation**
   - Overall score (1-100)
   - Recommendation: STRONG_HIRE | HIRE | MAYBE | NO_HIRE
   - Brief justification (2-3 sentences)

Provide your analysis in JSON format.`

      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })

      const analysisText = message.content[0].type === 'text' ? message.content[0].text : ''
      
      try {
        return JSON.parse(analysisText)
      } catch (parseError) {
        console.error('Error parsing Anthropic response:', parseError)
        return {
          overall_quality: 75,
          technical_writing: 75,
          content_strategy: 75,
          seo_digital: 75,
          recommendation: 'MAYBE',
          raw_analysis: analysisText
        }
      }

    } catch (error) {
      console.error('Error getting Anthropic analysis:', error)
      return {
        error: 'Failed to get AI analysis',
        overall_quality: 70,
        recommendation: 'MAYBE'
      }
    }
  }
}