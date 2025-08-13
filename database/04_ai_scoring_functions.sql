-- AI Scoring Pipeline Functions
-- Functions to support AI analysis and scoring of writing assessments

-- Function to calculate reading level using Flesch-Kincaid and other metrics
CREATE OR REPLACE FUNCTION calculate_reading_level(content text)
RETURNS JSONB AS $$
DECLARE
  sentence_count INTEGER;
  word_count INTEGER;
  syllable_count INTEGER;
  flesch_score DECIMAL(5,2);
  flesch_kincaid_grade DECIMAL(5,2);
  result JSONB;
BEGIN
  -- Basic text analysis (this would be enhanced with actual NLP libraries)
  word_count := array_length(string_to_array(regexp_replace(content, '[^\w\s]', ' ', 'g'), ' '), 1);
  sentence_count := array_length(string_to_array(content, '.'), 1) - 1;
  
  -- Estimate syllable count (simplified)
  syllable_count := word_count * 1.5; -- Average syllables per word estimate
  
  -- Flesch Reading Ease Score
  IF sentence_count > 0 AND word_count > 0 THEN
    flesch_score := 206.835 - (1.015 * (word_count::DECIMAL / sentence_count)) - (84.6 * (syllable_count::DECIMAL / word_count));
  ELSE
    flesch_score := 0;
  END IF;
  
  -- Flesch-Kincaid Grade Level
  IF sentence_count > 0 AND word_count > 0 THEN
    flesch_kincaid_grade := (0.39 * (word_count::DECIMAL / sentence_count)) + (11.8 * (syllable_count::DECIMAL / word_count)) - 15.59;
  ELSE
    flesch_kincaid_grade := 0;
  END IF;
  
  -- Normalize to 0-1 scale (higher is better)
  result := jsonb_build_object(
    'flesch_score', LEAST(GREATEST(flesch_score, 0), 100),
    'flesch_kincaid_grade', LEAST(GREATEST(flesch_kincaid_grade, 0), 20),
    'normalized_score', LEAST(GREATEST((flesch_score / 100.0), 0), 1),
    'word_count', word_count,
    'sentence_count', sentence_count,
    'avg_words_per_sentence', CASE WHEN sentence_count > 0 THEN word_count::DECIMAL / sentence_count ELSE 0 END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze SEO elements
CREATE OR REPLACE FUNCTION analyze_seo_elements(content text, title text DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  h1_count INTEGER;
  h2_count INTEGER;
  h3_count INTEGER;
  word_count INTEGER;
  paragraph_count INTEGER;
  link_count INTEGER;
  bold_count INTEGER;
  italic_count INTEGER;
  seo_score DECIMAL(3,2);
  result JSONB;
BEGIN
  -- Count SEO elements
  h1_count := (length(content) - length(replace(lower(content), '<h1', ''))) / 3;
  h2_count := (length(content) - length(replace(lower(content), '<h2', ''))) / 3;
  h3_count := (length(content) - length(replace(lower(content), '<h3', ''))) / 3;
  
  link_count := (length(content) - length(replace(lower(content), '<a ', ''))) / 3;
  bold_count := (length(content) - length(replace(lower(content), '<strong', ''))) / 7;
  bold_count := bold_count + (length(content) - length(replace(lower(content), '<b>', ''))) / 3;
  italic_count := (length(content) - length(replace(lower(content), '<em>', ''))) / 4;
  italic_count := italic_count + (length(content) - length(replace(lower(content), '<i>', ''))) / 3;
  
  -- Count words and paragraphs
  word_count := array_length(string_to_array(regexp_replace(content, '<[^>]+>', ' ', 'g'), ' '), 1);
  paragraph_count := (length(content) - length(replace(lower(content), '<p', ''))) / 2;
  
  -- Calculate SEO score (0-1 scale)
  seo_score := 0;
  
  -- H1 heading (should have 1)
  IF h1_count = 1 THEN seo_score := seo_score + 0.2;
  ELSIF h1_count > 1 THEN seo_score := seo_score + 0.1;
  END IF;
  
  -- H2/H3 headings (good to have some)
  IF h2_count > 0 THEN seo_score := seo_score + 0.15;
  END IF;
  IF h3_count > 0 THEN seo_score := seo_score + 0.1;
  END IF;
  
  -- Links (good to have some internal/external links)
  IF link_count > 0 THEN seo_score := seo_score + 0.15;
  END IF;
  
  -- Text formatting
  IF bold_count > 0 THEN seo_score := seo_score + 0.1;
  END IF;
  IF italic_count > 0 THEN seo_score := seo_score + 0.05;
  END IF;
  
  -- Content length (aim for 300+ words)
  IF word_count >= 300 THEN 
    seo_score := seo_score + 0.15;
  ELSIF word_count >= 150 THEN 
    seo_score := seo_score + 0.1;
  END IF;
  
  -- Paragraph structure
  IF paragraph_count > 1 THEN seo_score := seo_score + 0.1;
  END IF;
  
  result := jsonb_build_object(
    'h1_count', h1_count,
    'h2_count', h2_count,
    'h3_count', h3_count,
    'link_count', link_count,
    'bold_count', bold_count,
    'italic_count', italic_count,
    'word_count', word_count,
    'paragraph_count', paragraph_count,
    'seo_score', LEAST(seo_score, 1.0),
    'recommendations', CASE 
      WHEN h1_count = 0 THEN jsonb_build_array('Add an H1 heading')
      WHEN h1_count > 1 THEN jsonb_build_array('Use only one H1 heading')
      ELSE jsonb_build_array()
    END ||
    CASE WHEN h2_count = 0 THEN jsonb_build_array('Add H2 subheadings for better structure') ELSE jsonb_build_array() END ||
    CASE WHEN link_count = 0 THEN jsonb_build_array('Add relevant links to improve SEO') ELSE jsonb_build_array() END ||
    CASE WHEN word_count < 300 THEN jsonb_build_array('Increase content length to 300+ words') ELSE jsonb_build_array() END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to detect English proficiency patterns
CREATE OR REPLACE FUNCTION analyze_english_proficiency(content text)
RETURNS JSONB AS $$
DECLARE
  word_count INTEGER;
  sentence_count INTEGER;
  complex_word_count INTEGER;
  avg_sentence_length DECIMAL(5,2);
  vocabulary_complexity DECIMAL(3,2);
  grammar_score DECIMAL(3,2);
  proficiency_score DECIMAL(3,2);
  result JSONB;
BEGIN
  -- Basic metrics
  word_count := array_length(string_to_array(regexp_replace(content, '[^\w\s]', ' ', 'g'), ' '), 1);
  sentence_count := GREATEST(array_length(string_to_array(content, '.'), 1) - 1, 1);
  
  -- Calculate average sentence length
  avg_sentence_length := word_count::DECIMAL / sentence_count;
  
  -- Estimate complex words (words with 3+ syllables - simplified)
  complex_word_count := (SELECT COUNT(*) 
                        FROM unnest(string_to_array(lower(regexp_replace(content, '[^\w\s]', ' ', 'g')), ' ')) AS word 
                        WHERE length(word) > 6);
  
  -- Vocabulary complexity score
  vocabulary_complexity := LEAST((complex_word_count::DECIMAL / word_count) * 3, 1.0);
  
  -- Grammar patterns (simplified heuristics)
  grammar_score := 1.0;
  
  -- Check for common ESL patterns
  IF content ~* '\ba\s+lot\s+of' THEN grammar_score := grammar_score - 0.1; END IF;
  IF content ~* '\bvery\s+much' THEN grammar_score := grammar_score - 0.05; END IF;
  IF content ~* '\bmore\s+better' THEN grammar_score := grammar_score - 0.15; END IF;
  
  -- Check for good patterns
  IF content ~* '\b(however|therefore|furthermore|moreover|nevertheless)\b' THEN 
    grammar_score := grammar_score + 0.1; 
  END IF;
  
  -- Sentence length variety (good English has variety)
  IF avg_sentence_length BETWEEN 15 AND 25 THEN
    grammar_score := grammar_score + 0.1;
  ELSIF avg_sentence_length < 10 OR avg_sentence_length > 30 THEN
    grammar_score := grammar_score - 0.1;
  END IF;
  
  -- Overall proficiency score
  proficiency_score := (vocabulary_complexity * 0.4) + (LEAST(grammar_score, 1.0) * 0.6);
  
  result := jsonb_build_object(
    'word_count', word_count,
    'sentence_count', sentence_count,
    'avg_sentence_length', avg_sentence_length,
    'complex_word_ratio', complex_word_count::DECIMAL / word_count,
    'vocabulary_complexity', vocabulary_complexity,
    'grammar_score', LEAST(grammar_score, 1.0),
    'proficiency_score', LEAST(GREATEST(proficiency_score, 0), 1.0),
    'proficiency_level', CASE 
      WHEN proficiency_score >= 0.8 THEN 'Advanced'
      WHEN proficiency_score >= 0.6 THEN 'Intermediate'
      WHEN proficiency_score >= 0.4 THEN 'Basic'
      ELSE 'Beginner'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to estimate AI generation likelihood
CREATE OR REPLACE FUNCTION analyze_ai_generation_likelihood(content text)
RETURNS JSONB AS $$
DECLARE
  word_count INTEGER;
  sentence_count INTEGER;
  unique_word_count INTEGER;
  repetition_score DECIMAL(3,2);
  pattern_score DECIMAL(3,2);
  complexity_score DECIMAL(3,2);
  ai_likelihood DECIMAL(3,2);
  result JSONB;
BEGIN
  -- Basic metrics
  word_count := array_length(string_to_array(regexp_replace(content, '[^\w\s]', ' ', 'g'), ' '), 1);
  sentence_count := GREATEST(array_length(string_to_array(content, '.'), 1) - 1, 1);
  
  -- Calculate unique words
  unique_word_count := (SELECT COUNT(DISTINCT word) 
                       FROM unnest(string_to_array(lower(regexp_replace(content, '[^\w\s]', ' ', 'g')), ' ')) AS word 
                       WHERE length(word) > 2);
  
  -- Repetition analysis
  repetition_score := 1.0 - (unique_word_count::DECIMAL / word_count);
  
  -- AI pattern detection (simplified heuristics)
  pattern_score := 0.0;
  
  -- Common AI phrases
  IF content ~* '\b(in conclusion|to summarize|furthermore|moreover)\b' THEN 
    pattern_score := pattern_score + 0.2; 
  END IF;
  
  IF content ~* '\b(it is important to note|it should be noted)\b' THEN 
    pattern_score := pattern_score + 0.3; 
  END IF;
  
  IF content ~* '\b(various|numerous|several|multiple)\b' THEN 
    pattern_score := pattern_score + 0.1; 
  END IF;
  
  -- Very structured/formulaic writing
  IF content ~* '\b(firstly|secondly|thirdly|finally)\b' THEN 
    pattern_score := pattern_score + 0.2; 
  END IF;
  
  -- Complexity patterns
  complexity_score := 0.0;
  
  -- Very uniform sentence lengths (AI tends to be consistent)
  -- This would need actual sentence parsing in production
  
  -- Overly perfect grammar/structure
  IF content ~* '^[A-Z][^.!?]*[.!?]\s*[A-Z][^.!?]*[.!?]' THEN
    complexity_score := complexity_score + 0.1;
  END IF;
  
  -- Calculate overall AI likelihood
  ai_likelihood := (repetition_score * 0.3) + (pattern_score * 0.5) + (complexity_score * 0.2);
  
  result := jsonb_build_object(
    'word_count', word_count,
    'unique_word_count', unique_word_count,
    'repetition_score', repetition_score,
    'pattern_score', LEAST(pattern_score, 1.0),
    'complexity_score', complexity_score,
    'ai_likelihood', LEAST(ai_likelihood, 1.0),
    'confidence_level', CASE 
      WHEN ai_likelihood >= 0.7 THEN 'High'
      WHEN ai_likelihood >= 0.4 THEN 'Medium'
      ELSE 'Low'
    END,
    'risk_factors', CASE 
      WHEN pattern_score > 0.5 THEN jsonb_build_array('High use of AI-typical phrases')
      ELSE jsonb_build_array()
    END ||
    CASE WHEN repetition_score > 0.6 THEN jsonb_build_array('High word repetition') ELSE jsonb_build_array() END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Main function to calculate composite AI score
CREATE OR REPLACE FUNCTION calculate_ai_assessment_score(assessment_id UUID)
RETURNS JSONB AS $$
DECLARE
  assessment_content text;
  reading_level JSONB;
  seo_analysis JSONB;
  english_proficiency JSONB;
  ai_detection JSONB;
  composite_score DECIMAL(3,2);
  result JSONB;
BEGIN
  -- Get assessment content
  SELECT submission_content INTO assessment_content 
  FROM assessments WHERE id = assessment_id;
  
  IF assessment_content IS NULL OR length(assessment_content) < 50 THEN
    RETURN jsonb_build_object(
      'error', 'Insufficient content for analysis',
      'composite_score', 0
    );
  END IF;
  
  -- Perform all analyses
  reading_level := calculate_reading_level(assessment_content);
  seo_analysis := analyze_seo_elements(assessment_content);
  english_proficiency := analyze_english_proficiency(assessment_content);
  ai_detection := analyze_ai_generation_likelihood(assessment_content);
  
  -- Calculate weighted composite score
  -- Reading level: 20%, SEO: 20%, English: 30%, AI detection: 30% (inverted)
  composite_score := 
    (reading_level->>'normalized_score')::DECIMAL * 0.20 +
    (seo_analysis->>'seo_score')::DECIMAL * 0.20 +
    (english_proficiency->>'proficiency_score')::DECIMAL * 0.30 +
    (1.0 - (ai_detection->>'ai_likelihood')::DECIMAL) * 0.30;
  
  -- Build result
  result := jsonb_build_object(
    'composite_score', ROUND(composite_score, 2),
    'reading_level', reading_level,
    'seo_analysis', seo_analysis,
    'english_proficiency', english_proficiency,
    'ai_detection', ai_detection,
    'recommendations', 
      (seo_analysis->'recommendations') ||
      CASE WHEN (ai_detection->>'ai_likelihood')::DECIMAL > 0.7 THEN 
        jsonb_build_array('High AI generation likelihood detected - manual review recommended')
      ELSE jsonb_build_array() END,
    'analyzed_at', to_jsonb(NOW())
  );
  
  -- Update the assessment record
  UPDATE assessments SET
    reading_level_score = (reading_level->>'normalized_score')::DECIMAL,
    seo_score = (seo_analysis->>'seo_score')::DECIMAL,
    english_proficiency_score = (english_proficiency->>'proficiency_score')::DECIMAL,
    ai_detection_score = (ai_detection->>'ai_likelihood')::DECIMAL,
    composite_score = ROUND(composite_score, 2),
    score_breakdown = result,
    updated_at = NOW()
  WHERE id = assessment_id;
  
  -- Update application AI scores
  UPDATE applications SET
    ai_composite_score = ROUND(composite_score, 2),
    ai_scores = jsonb_build_object(
      'reading_level', (reading_level->>'normalized_score')::DECIMAL,
      'seo_score', (seo_analysis->>'seo_score')::DECIMAL,
      'english_proficiency', (english_proficiency->>'proficiency_score')::DECIMAL,
      'ai_detection', (ai_detection->>'ai_likelihood')::DECIMAL
    ),
    ai_analysis = result,
    updated_at = NOW()
  WHERE id = (SELECT application_id FROM assessments WHERE id = assessment_id);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger automatic shortlisting based on AI score
CREATE OR REPLACE FUNCTION check_auto_shortlist(application_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  app_score DECIMAL(3,2);
  job_threshold DECIMAL(3,2);
  should_shortlist BOOLEAN := false;
BEGIN
  -- Get application score and job threshold
  SELECT 
    a.ai_composite_score,
    j.ai_scoring_threshold
  INTO app_score, job_threshold
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  WHERE a.id = application_id;
  
  -- Check if score meets threshold
  IF app_score IS NOT NULL AND job_threshold IS NOT NULL AND app_score >= job_threshold THEN
    should_shortlist := true;
    
    -- Update application status
    UPDATE applications SET
      is_shortlisted = true,
      shortlisted_at = NOW(),
      status = 'shortlisted',
      updated_at = NOW()
    WHERE id = application_id AND NOT is_shortlisted;
  END IF;
  
  RETURN should_shortlist;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically run AI scoring when assessment is submitted
CREATE OR REPLACE FUNCTION trigger_ai_scoring()
RETURNS TRIGGER AS $$
DECLARE
  scoring_result JSONB;
  shortlisted BOOLEAN;
BEGIN
  -- Only run if submission_content was added/updated and submitted_at is set
  IF NEW.submission_content IS NOT NULL AND NEW.submitted_at IS NOT NULL THEN
    -- Calculate AI scores
    scoring_result := calculate_ai_assessment_score(NEW.id);
    
    -- Check for auto-shortlisting
    shortlisted := check_auto_shortlist(NEW.application_id);
    
    -- Update application status to ai_reviewed
    UPDATE applications SET
      status = CASE WHEN shortlisted THEN 'shortlisted' ELSE 'ai_reviewed' END,
      updated_at = NOW()
    WHERE id = NEW.application_id AND status = 'assessment_submitted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic AI scoring
CREATE TRIGGER trigger_ai_scoring_on_submission
  AFTER INSERT OR UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION trigger_ai_scoring();

-- Function to get AI scoring statistics for analytics
CREATE OR REPLACE FUNCTION get_ai_scoring_stats(tenant_id UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  total_assessments INTEGER;
  avg_composite_score DECIMAL(3,2);
  avg_reading_level DECIMAL(3,2);
  avg_seo_score DECIMAL(3,2);
  avg_english_score DECIMAL(3,2);
  avg_ai_detection DECIMAL(3,2);
  high_ai_risk_count INTEGER;
  auto_shortlisted_count INTEGER;
  result JSONB;
BEGIN
  -- Set date range if not provided
  IF start_date IS NULL THEN start_date := CURRENT_DATE - INTERVAL '30 days'; END IF;
  IF end_date IS NULL THEN end_date := CURRENT_DATE; END IF;
  
  -- Get statistics
  SELECT 
    COUNT(*),
    AVG(composite_score),
    AVG(reading_level_score),
    AVG(seo_score),
    AVG(english_proficiency_score),
    AVG(ai_detection_score),
    COUNT(*) FILTER (WHERE ai_detection_score > 0.7),
    COUNT(*) FILTER (WHERE composite_score >= 0.75)
  INTO 
    total_assessments,
    avg_composite_score,
    avg_reading_level,
    avg_seo_score,
    avg_english_score,
    avg_ai_detection,
    high_ai_risk_count,
    auto_shortlisted_count
  FROM assessments a
  JOIN applications app ON app.id = a.application_id
  WHERE app.tenant_id = get_ai_scoring_stats.tenant_id
    AND a.submitted_at >= start_date
    AND a.submitted_at <= end_date
    AND a.composite_score IS NOT NULL;
  
  result := jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', start_date,
      'end_date', end_date
    ),
    'total_assessments', COALESCE(total_assessments, 0),
    'average_scores', jsonb_build_object(
      'composite', ROUND(COALESCE(avg_composite_score, 0), 2),
      'reading_level', ROUND(COALESCE(avg_reading_level, 0), 2),
      'seo', ROUND(COALESCE(avg_seo_score, 0), 2),
      'english_proficiency', ROUND(COALESCE(avg_english_score, 0), 2),
      'ai_detection_risk', ROUND(COALESCE(avg_ai_detection, 0), 2)
    ),
    'risk_analysis', jsonb_build_object(
      'high_ai_risk_count', COALESCE(high_ai_risk_count, 0),
      'high_ai_risk_percentage', CASE WHEN total_assessments > 0 THEN ROUND((high_ai_risk_count::DECIMAL / total_assessments) * 100, 1) ELSE 0 END
    ),
    'auto_shortlisted_count', COALESCE(auto_shortlisted_count, 0),
    'auto_shortlist_rate', CASE WHEN total_assessments > 0 THEN ROUND((auto_shortlisted_count::DECIMAL / total_assessments) * 100, 1) ELSE 0 END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for AI scoring performance
CREATE INDEX idx_assessments_submitted_content ON assessments(id) WHERE submission_content IS NOT NULL AND submitted_at IS NOT NULL;
CREATE INDEX idx_assessments_scores ON assessments(composite_score, ai_detection_score) WHERE composite_score IS NOT NULL;
CREATE INDEX idx_applications_ai_scores ON applications(ai_composite_score, is_shortlisted) WHERE ai_composite_score IS NOT NULL;