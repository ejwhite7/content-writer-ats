-- Seed Data for ATS Platform
-- Sample data for development and testing

-- Insert default tenant
INSERT INTO tenants (id, name, slug, domain, is_active, settings) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Agency', 
  'demo-agency',
  'demo-agency.localhost:3000',
  true,
  '{
    "company_type": "marketing_agency",
    "timezone": "UTC",
    "default_currency": "USD",
    "ai_scoring_enabled": true,
    "auto_shortlist_enabled": true
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Tech Startup',
  'tech-startup', 
  'tech-startup.localhost:3000',
  true,
  '{
    "company_type": "saas_company",
    "timezone": "America/New_York",
    "default_currency": "USD",
    "ai_scoring_enabled": true,
    "auto_shortlist_enabled": false
  }'
);

-- Insert branding settings
INSERT INTO branding_settings (tenant_id, company_name, tagline, primary_color, secondary_color, accent_color, email_sender_name, email_sender_address, social_links) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Agency',
  'Finding exceptional content writers for your brand',
  '#2563eb',
  '#64748b', 
  '#f59e0b',
  'Demo Agency Hiring',
  'hiring@demo-agency.com',
  '{
    "website": "https://demo-agency.com",
    "linkedin": "https://linkedin.com/company/demo-agency",
    "twitter": "https://twitter.com/demoagency"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Tech Startup',
  'Revolutionizing content through technology',
  '#7c3aed',
  '#6b7280',
  '#10b981', 
  'Tech Startup Team',
  'careers@techstartup.com',
  '{
    "website": "https://techstartup.com",
    "linkedin": "https://linkedin.com/company/techstartup"
  }'
);

-- Insert demo admin users
INSERT INTO users (id, tenant_id, clerk_id, email, first_name, last_name, role, is_active, email_verified_at, timezone, metadata) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  'clerk_admin_demo_001',
  'admin@demo-agency.com',
  'Sarah',
  'Johnson',
  'admin',
  true,
  NOW(),
  'America/New_York',
  '{
    "position": "Talent Acquisition Manager",
    "department": "HR",
    "hire_date": "2023-01-15"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440001',
  'clerk_admin_tech_001',
  'hiring@techstartup.com',
  'Alex',
  'Chen',
  'admin',
  true,
  NOW(),
  'America/Los_Angeles',
  '{
    "position": "Head of Content",
    "department": "Marketing"
  }'
);

-- Insert demo candidate users
INSERT INTO users (id, tenant_id, clerk_id, email, first_name, last_name, role, is_active, email_verified_at, timezone, locale, metadata) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  'clerk_candidate_001',
  'emma.writer@email.com',
  'Emma',
  'Rodriguez',
  'candidate',
  true,
  NOW(),
  'America/Chicago',
  'en',
  '{
    "experience_years": 5,
    "specialties": ["B2B SaaS", "Technology", "SEO"],
    "portfolio_url": "https://emmawriting.com",
    "linkedin": "https://linkedin.com/in/emmarodriguez"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440021', 
  '550e8400-e29b-41d4-a716-446655440000',
  'clerk_candidate_002',
  'james.content@email.com',
  'James',
  'Wilson',
  'candidate',
  true,
  NOW(),
  'Europe/London',
  'en',
  '{
    "experience_years": 3,
    "specialties": ["Finance", "Cryptocurrency", "Technical Writing"],
    "portfolio_url": "https://jameswrites.io"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440001',
  'clerk_candidate_003', 
  'priya.sharma@email.com',
  'Priya',
  'Sharma',
  'candidate',
  true,
  NOW(),
  'Asia/Kolkata',
  'en',
  '{
    "experience_years": 7,
    "specialties": ["Healthcare", "Wellness", "Medical Writing"],
    "certifications": ["Certified Medical Writer"]
  }'
);

-- Insert demo jobs
INSERT INTO jobs (id, tenant_id, title, slug, description, responsibilities, requirements, preferred_qualifications, work_type, is_remote, location_city, location_country, compensation_min, compensation_max, compensation_currency, compensation_frequency, experience_level, sample_topics, status, assessment_prompt, assessment_word_count_min, assessment_word_count_max, assessment_time_limit_hours, ai_scoring_threshold, posted_by, posted_at, seo_title, seo_description, tags) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440100',
  '550e8400-e29b-41d4-a716-446655440000',
  'Senior B2B SaaS Content Writer',
  'senior-b2b-saas-content-writer',
  'We are seeking an experienced B2B SaaS content writer to create compelling, conversion-focused content for our technology clients. This role involves writing blog posts, whitepapers, case studies, and marketing copy that drives engagement and generates leads.',
  '[
    "Write 8-12 high-quality blog posts per month (1,500-2,500 words each)",
    "Create compelling case studies and customer success stories", 
    "Develop whitepapers and in-depth guides on SaaS topics",
    "Collaborate with marketing and product teams on content strategy",
    "Research industry trends and incorporate insights into content",
    "Optimize content for SEO and conversion",
    "Edit and proofread content from junior writers"
  ]',
  '[
    "5+ years of B2B content writing experience",
    "Strong portfolio demonstrating SaaS industry expertise",
    "Excellent understanding of SEO best practices",
    "Experience with content management systems",
    "Ability to translate complex technical concepts into accessible content",
    "Strong research and analytical skills",
    "Native or near-native English proficiency"
  ]',
  '[
    "Experience with marketing automation platforms",
    "Background in technology or software",
    "Understanding of B2B sales funnels",
    "Experience with data analysis and reporting",
    "Familiarity with AI/ML concepts"
  ]',
  'contract',
  true,
  NULL,
  NULL,
  150.00,
  250.00,
  'USD',
  'per_article',
  'senior',
  '[
    "How AI is transforming customer support in SaaS companies",
    "The complete guide to SaaS onboarding best practices", 
    "ROI analysis: Comparing traditional software vs. cloud solutions",
    "Security considerations for enterprise SaaS adoption"
  ]',
  'published',
  'Write a 800-1200 word blog post about "The Future of Remote Work Technology". Your article should:

1. Include an engaging introduction that hooks the reader
2. Cover at least 3 key technology trends shaping remote work
3. Provide specific examples or case studies
4. Include actionable insights for business leaders
5. Conclude with a compelling call-to-action
6. Use proper headings (H2, H3) for structure
7. Naturally incorporate relevant keywords

Please write in a professional but conversational tone suitable for a B2B audience. Focus on providing value and insights rather than promotional content.',
  800,
  1200,
  NULL,
  0.75,
  '550e8400-e29b-41d4-a716-446655440010',
  NOW() - INTERVAL '3 days',
  'Senior B2B SaaS Content Writer - Remote Position',
  'Join our team as a Senior B2B SaaS Content Writer. Create compelling content for technology clients. $150-250 per article, remote work.',
  '["content-writing", "saas", "b2b", "senior", "remote", "technology"]'
),
(
  '550e8400-e29b-41d4-a716-446655440101',
  '550e8400-e29b-41d4-a716-446655440000',
  'Healthcare Content Specialist',
  'healthcare-content-specialist',
  'We are looking for a specialized healthcare content writer to create authoritative, compliant content for our medical and wellness clients. This role requires deep understanding of healthcare regulations and the ability to make complex medical information accessible to various audiences.',
  '[
    "Write evidence-based health and wellness articles",
    "Create patient education materials and resources",
    "Develop content for healthcare professionals",
    "Ensure all content meets regulatory compliance standards",
    "Collaborate with medical experts and reviewers",
    "Research latest medical studies and guidelines",
    "Adapt content for different audience levels"
  ]',
  '[
    "3+ years of healthcare content writing experience",
    "Understanding of medical terminology and concepts",
    "Knowledge of HIPAA and healthcare compliance",
    "Experience with medical research and citation",
    "Strong fact-checking and verification skills",
    "Ability to write for both B2B and B2C audiences"
  ]',
  '[
    "Medical or nursing background",
    "Certified Medical Writer credentials",
    "Experience with pharmaceutical content",
    "Understanding of FDA regulations"
  ]',
  'contract',
  true,
  NULL,
  NULL,
  100.00,
  180.00,
  'USD',
  'per_article',
  'mid',
  '[
    "Understanding diabetes management in the digital age",
    "Mental health resources for healthcare workers",
    "Telemedicine best practices for patient care",
    "Preventive care strategies for chronic conditions"
  ]',
  'published',
  'Write a 600-800 word article about "The Impact of Wearable Technology on Preventive Healthcare". Your article should:

1. Explain what wearable health technology includes
2. Discuss how these devices support preventive care
3. Address privacy and data security considerations
4. Include at least one specific example or case study
5. Maintain a professional, authoritative tone
6. Include proper medical citations where appropriate
7. End with actionable takeaways for readers

Ensure your content is accurate, evidence-based, and accessible to a general healthcare audience.',
  600,
  800,
  NULL,
  0.70,
  '550e8400-e29b-41d4-a716-446655440010',
  NOW() - INTERVAL '1 day',
  'Healthcare Content Specialist - Medical Writing Role',
  'Healthcare content specialist position for medical and wellness writing. $100-180 per article. Experience with compliance required.',
  '["healthcare", "medical-writing", "content", "compliance", "remote"]'
),
(
  '550e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440001',
  'Technical Content Writer - AI/ML Focus',
  'technical-content-writer-ai-ml',
  'Tech Startup is seeking a technical content writer with expertise in artificial intelligence and machine learning to create educational content, documentation, and thought leadership pieces for our developer and business audiences.',
  '[
    "Write technical tutorials and how-to guides",
    "Create API documentation and developer resources",
    "Develop thought leadership content on AI/ML trends",
    "Collaborate with engineering teams on technical accuracy",
    "Create content for multiple audience types (developers, executives, users)",
    "Maintain and update existing technical documentation"
  ]',
  '[
    "4+ years of technical writing experience",
    "Strong understanding of AI/ML concepts and applications",
    "Experience writing for developer audiences", 
    "Familiarity with programming concepts (Python, APIs, etc.)",
    "Ability to explain complex technical concepts clearly",
    "Experience with documentation tools and platforms"
  ]',
  '[
    "Computer science or engineering background",
    "Hands-on experience with ML frameworks",
    "Open source contribution experience",
    "Understanding of cloud platforms (AWS, GCP, Azure)"
  ]',
  'full_time',
  true,
  'San Francisco',
  'United States',
  70000.00,
  95000.00,
  'USD',
  'monthly',
  'senior',
  '[
    "Building your first machine learning model with Python",
    "Understanding transformer architectures in NLP",
    "MLOps best practices for production deployments",
    "Ethical considerations in AI development"
  ]',
  'published',
  'Write a 1000-1200 word technical article explaining "How to Choose the Right Machine Learning Algorithm for Your Use Case". Your article should:

1. Provide a clear framework for algorithm selection
2. Cover at least 4-5 different algorithm types with use cases
3. Include practical decision-making criteria
4. Provide code examples or pseudocode where helpful
5. Address common pitfalls and how to avoid them
6. Use technical accuracy while remaining accessible
7. Include a decision tree or flowchart concept

Write for an audience of developers and data scientists who are familiar with programming but may be new to ML.',
  1000,
  1200,
  NULL,
  0.80,
  '550e8400-e29b-41d4-a716-446655440011',
  NOW() - INTERVAL '5 days',
  'Technical Content Writer - AI/ML Focus | Tech Startup',
  'Technical writing role focused on AI/ML content. Full-time position with competitive salary. Join our innovative team.',
  '["technical-writing", "ai", "machine-learning", "full-time", "developer-content"]'
);

-- Insert demo applications
INSERT INTO applications (id, tenant_id, job_id, candidate_id, status, cover_letter, portfolio_url, desired_compensation_amount, desired_compensation_frequency, desired_compensation_currency, availability_date, location_city, location_country, time_zone, years_experience, languages, specialties, metadata) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440200',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440100',
  '550e8400-e29b-41d4-a716-446655440020',
  'assessment_submitted',
  'I am excited to apply for the Senior B2B SaaS Content Writer position. With 5 years of experience writing for technology companies, I have developed expertise in creating content that drives engagement and conversions. My portfolio includes work for major SaaS companies where I have successfully increased organic traffic by 150% and generated hundreds of qualified leads through strategic content marketing. I am particularly drawn to your focus on data-driven content strategy and would love to contribute to your clients'' success.',
  'https://emmawriting.com/portfolio',
  200.00,
  'per_article',
  'USD',
  CURRENT_DATE + INTERVAL '2 weeks',
  'Chicago',
  'United States',
  'America/Chicago',
  5,
  '[{"language": "English", "proficiency": "native"}, {"language": "Spanish", "proficiency": "conversational"}]',
  '["B2B SaaS", "SEO Content", "Technical Writing", "Lead Generation"]',
  '{
    "referral_source": "LinkedIn",
    "why_interested": "Company mission alignment",
    "availability": "Part-time initially, full-time potential"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440201',
  '550e8400-e29b-41d4-a716-446655440000', 
  '550e8400-e29b-41d4-a716-446655440101',
  '550e8400-e29b-41d4-a716-446655440022',
  'ai_reviewed',
  'As a certified medical writer with 7 years of healthcare content experience, I am well-suited for the Healthcare Content Specialist role. I have extensive experience creating patient education materials, regulatory-compliant content, and evidence-based articles for both healthcare professionals and consumers. My background includes work with pharmaceutical companies, medical device manufacturers, and healthcare providers. I am particularly skilled at making complex medical information accessible while maintaining scientific accuracy and regulatory compliance.',
  'https://priyamedicalwriting.com',
  150.00,
  'per_article',
  'USD',
  CURRENT_DATE + INTERVAL '1 week',
  'Mumbai',
  'India',
  'Asia/Kolkata',
  7,
  '[{"language": "English", "proficiency": "fluent"}, {"language": "Hindi", "proficiency": "native"}]',
  '["Medical Writing", "Regulatory Compliance", "Patient Education", "Healthcare Technology"]',
  '{
    "certifications": ["Certified Medical Writer (CMW)", "Regulatory Affairs Certification"],
    "specialization": "Digital health and telemedicine"
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440202',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440021',
  'applied',
  'I am very interested in the Technical Content Writer position focusing on AI/ML. My background combines technical writing expertise with hands-on experience in machine learning projects. I have written extensively about fintech and cryptocurrency, which has given me deep experience in explaining complex technical concepts to various audiences. I am excited about the opportunity to focus specifically on AI/ML content and contribute to thought leadership in this rapidly evolving field.',
  'https://jameswrites.io/tech-portfolio',
  75000.00,
  'monthly', 
  'USD',
  CURRENT_DATE + INTERVAL '1 month',
  'London',
  'United Kingdom',
  'Europe/London',
  3,
  '[{"language": "English", "proficiency": "native"}]',
  '["Technical Writing", "Fintech", "Blockchain", "Developer Documentation"]',
  '{
    "github": "https://github.com/jameswilson",
    "open_source_contributions": "Several ML-related documentation projects",
    "relocation_willing": true
  }'
);

-- Insert demo assessments
INSERT INTO assessments (id, tenant_id, application_id, prompt, submission_content, word_count, no_ai_attestation, submitted_at, time_spent_minutes) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440300',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440200',
  'Write a 800-1200 word blog post about "The Future of Remote Work Technology"...',
  '# The Future of Remote Work Technology: Transforming How We Collaborate

The landscape of remote work has undergone a dramatic transformation in recent years, accelerated by global events that forced millions of professionals to adapt to distributed work environments. As we look toward the future, emerging technologies are not just supporting remote work—they''re revolutionizing it entirely. Understanding these technological shifts is crucial for business leaders who want to stay competitive and create thriving remote-first organizations.

## The Rise of Immersive Collaboration Platforms

Traditional video conferencing tools, while functional, often fall short of replicating the nuanced interactions that occur in physical offices. Enter immersive collaboration platforms that leverage virtual and augmented reality technologies. Companies like Meta, Microsoft, and startups such as Spatial are developing virtual workspaces where teams can interact with 3D models, share screens in three-dimensional space, and engage in more natural, embodied conversations.

Consider the case of Accenture, which has invested heavily in virtual reality training and collaboration. Their "One Accenture Park" virtual environment allows thousands of employees to gather for meetings, training sessions, and social interactions in a shared digital space. Early results show increased engagement levels and improved knowledge retention compared to traditional video calls.

## AI-Powered Productivity and Workflow Optimization

Artificial intelligence is becoming the invisible backbone of remote work efficiency. Smart scheduling assistants automatically find optimal meeting times across time zones, while AI-powered project management tools predict bottlenecks before they occur. Tools like Notion AI and Jasper are already helping remote teams generate content, summarize meetings, and automate routine tasks.

The real game-changer lies in AI''s ability to understand context and provide personalized recommendations. Imagine an AI assistant that knows when you''re most productive, suggests the best times for deep work, and automatically blocks distractions during focused work sessions. This level of intelligent automation will free knowledge workers to focus on high-value creative and strategic tasks.

## Advanced Communication and Language Technologies

Real-time language translation and cultural context adaptation are removing barriers for global remote teams. Microsoft Teams and Google Meet have integrated live translation features, but the technology is evolving toward more sophisticated cultural nuance understanding. Future communication platforms will not only translate languages but also adapt communication styles to match cultural preferences and individual personality types.

Startups like Krisp are pioneering noise cancellation technology that goes beyond simple background noise removal to enhance voice clarity and even adjust for accents, making global communication more seamless than ever before.

## The Hybrid Reality: Bridging Physical and Digital Spaces

The future of remote work isn''t entirely virtual—it''s hybrid. Augmented reality applications are enabling remote workers to overlay digital information onto their physical environment, creating personalized workspaces anywhere. Smart home integration allows for seamless transitions between personal and professional modes, with lighting, temperature, and acoustics automatically adjusting for optimal productivity.

## Actionable Insights for Business Leaders

To prepare for this technological evolution, business leaders should:

**Invest in Infrastructure**: Ensure your organization has the bandwidth and security frameworks to support emerging technologies. This includes upgrading to cloud-native systems that can integrate with future tools.

**Foster Digital Literacy**: Provide ongoing training to help employees adapt to new technologies. The most sophisticated tools are only as effective as the people using them.

**Experiment Thoughtfully**: Start with pilot programs to test new technologies before company-wide rollouts. Measure impact on productivity, employee satisfaction, and collaboration quality.

**Prioritize Human Connection**: Remember that technology should enhance, not replace, human relationships. The most successful remote work strategies balance technological efficiency with meaningful human interaction.

## Conclusion: Embracing the Remote Work Revolution

The future of remote work technology is not just about better tools—it''s about creating work experiences that are more flexible, inclusive, and productive than traditional office environments ever were. Organizations that embrace these technological advances while maintaining focus on human-centered design will not only survive the remote work revolution but thrive in it.

The question isn''t whether your organization will adopt these technologies, but how quickly you can implement them strategically. Start by assessing your current remote work challenges, then explore how emerging technologies can address them. The future of work is being written now—make sure your organization is part of the story.

*Ready to transform your remote work strategy? Contact our team to learn how we can help you implement cutting-edge remote work technologies that drive results.*',
  987,
  true,
  NOW() - INTERVAL '2 days',
  125
),
(
  '550e8400-e29b-41d4-a716-446655440301',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440201',
  'Write a 600-800 word article about "The Impact of Wearable Technology on Preventive Healthcare"...',
  '# The Impact of Wearable Technology on Preventive Healthcare

Wearable health technology has emerged as a transformative force in preventive healthcare, empowering individuals to take proactive control of their health while providing healthcare providers with unprecedented insights into patient behavior and physiological patterns. As these devices become increasingly sophisticated and accessible, their impact on preventive care strategies continues to expand.

## Understanding Wearable Health Technology

Wearable health technology encompasses a broad range of devices designed to monitor various physiological parameters continuously. This includes fitness trackers that monitor steps and heart rate, smartwatches capable of detecting irregular heart rhythms, continuous glucose monitors for diabetes management, and specialized devices that track sleep patterns, stress levels, and even blood oxygen saturation.

Modern wearables extend far beyond simple step counting. Advanced devices can now detect falls, monitor medication adherence, track environmental exposures, and even identify early warning signs of illness through changes in baseline measurements.

## Supporting Preventive Care Through Continuous Monitoring

The primary advantage of wearable technology lies in its ability to provide continuous, real-time health monitoring outside clinical settings. Traditional healthcare operates on episodic encounters—patients visit healthcare providers when symptoms arise or for scheduled check-ups. Wearables transform this model by enabling continuous health surveillance.

For cardiovascular health, devices like the Apple Watch have demonstrated the ability to detect atrial fibrillation, a common heart rhythm disorder that often goes undiagnosed. Early detection through wearable monitoring can prevent serious complications such as stroke. Similarly, continuous blood pressure monitoring through wearable devices allows for better management of hypertension, a major risk factor for heart disease and stroke.

Sleep tracking capabilities help identify sleep disorders that contribute to numerous health conditions, including diabetes, cardiovascular disease, and mental health issues. By providing detailed sleep analytics, wearables enable users and healthcare providers to implement targeted interventions before these conditions develop or worsen.

## Privacy and Data Security Considerations

The collection and transmission of sensitive health data through wearable devices raises significant privacy and security concerns that must be carefully addressed. Health information collected by wearables is protected under various regulations, including HIPAA in the United States, but the regulatory landscape varies depending on how the data is used and shared.

Key privacy considerations include:

**Data Ownership and Control**: Users must understand who owns their health data and how it can be accessed or shared. Clear consent mechanisms should allow individuals to control data sharing with healthcare providers, insurers, and third parties.

**Security Infrastructure**: Manufacturers must implement robust encryption, secure data transmission protocols, and regular security updates to protect against data breaches.

**Algorithmic Transparency**: Users and healthcare providers should understand how devices make health determinations and recommendations, including the limitations and accuracy of these algorithms.

## Case Study: Diabetes Prevention and Management

The Diabetes Prevention Program (DPP) has successfully integrated wearable technology to support lifestyle interventions. Participants use fitness trackers to monitor physical activity levels, while smartphone applications provide personalized coaching based on wearable data. Studies have shown that participants using wearable technology demonstrate greater weight loss and improved glucose control compared to traditional intervention methods.

Continuous glucose monitors (CGMs) represent another breakthrough in diabetes care. These devices provide real-time glucose readings, allowing individuals with diabetes and prediabetes to understand how diet, exercise, and other factors immediately impact their blood sugar levels. This immediate feedback enables more effective lifestyle modifications and medication adjustments.

## Actionable Takeaways for Healthcare Stakeholders

**For Healthcare Providers**: Integrate wearable data into patient care plans while maintaining clinical judgment. Establish protocols for interpreting and acting on wearable-generated alerts and trends.

**For Patients**: Choose devices aligned with specific health goals and ensure data privacy settings match personal preferences. Share relevant wearable data with healthcare providers to enhance care coordination.

**For Healthcare Organizations**: Develop infrastructure to receive and analyze wearable data while ensuring compliance with privacy regulations. Train staff on interpreting wearable data and incorporating it into clinical decision-making.

**For Policymakers**: Create clear regulatory frameworks that protect patient privacy while enabling innovation in wearable health technology.

Wearable technology represents a paradigm shift toward personalized, data-driven preventive healthcare. When implemented thoughtfully with appropriate privacy protections, these devices have the potential to detect health issues earlier, enable more effective interventions, and ultimately improve health outcomes while reducing healthcare costs. The future of preventive care will increasingly rely on the seamless integration of wearable technology with traditional healthcare delivery models.',
  756,
  true,
  NOW() - INTERVAL '1 day',
  95
);

-- Insert demo messages
INSERT INTO messages (id, tenant_id, application_id, thread_id, sender_id, recipient_id, type, subject, content, is_read) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440400',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440200',
  uuid_generate_v5(uuid_ns_oid(), '550e8400-e29b-41d4-a716-446655440200'::text),
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440020',
  'admin_message',
  'Great assessment submission!',
  'Hi Emma,\n\nThank you for submitting your assessment for the Senior B2B SaaS Content Writer position. I was impressed by your article on remote work technology - it demonstrates excellent structure, engaging writing, and strong SEO optimization.\n\nYour piece scored very well in our AI analysis, particularly in the areas of readability and content quality. I''d love to schedule a brief call to discuss next steps and potentially move forward with a paid trial assignment.\n\nAre you available for a 30-minute call this week? I''m flexible with timing given our different time zones.\n\nBest regards,\nSarah Johnson\nTalent Acquisition Manager',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440401',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440200',
  uuid_generate_v5(uuid_ns_oid(), '550e8400-e29b-41d4-a716-446655440200'::text),
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440010',
  'candidate_message',
  'Re: Great assessment submission!',
  'Hi Sarah,\n\nThank you so much for the positive feedback! I''m thrilled that you found my assessment compelling and that the AI analysis scored well. \n\nI''m definitely interested in discussing next steps and would be happy to participate in a paid trial assignment. I''m available for a call this week - I can be flexible with timing to accommodate your schedule.\n\nHere are some times that work well for me (Central Time):\n- Tuesday 2-4 PM\n- Wednesday 10 AM - 12 PM\n- Thursday 1-3 PM\n- Friday 9-11 AM\n\nPlease let me know what works best for you, and feel free to send a calendar invite.\n\nI''m excited about the possibility of working with your team!\n\nBest,\nEmma Rodriguez',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440402',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440201',
  uuid_generate_v5(uuid_ns_oid(), '550e8400-e29b-41d4-a716-446655440201'::text),
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440022',
  'admin_message',
  'Healthcare Content Specialist Application Update',
  'Dear Priya,\n\nThank you for your application and assessment submission for our Healthcare Content Specialist position. Your medical writing background and certifications are exactly what we''re looking for.\n\nYour assessment on wearable technology in preventive healthcare was excellent - it demonstrated strong medical knowledge, regulatory awareness, and the ability to communicate complex concepts clearly to a general audience.\n\nWe''d like to move forward with a paid trial assignment focused on digital health content. The assignment would involve writing 2-3 articles over the next two weeks, with compensation at your requested rate of $150 per article.\n\nWould you be interested in proceeding? If so, I can send over the detailed brief and content guidelines.\n\nLooking forward to hearing from you.\n\nBest regards,\nSarah Johnson',
  false
);

-- Insert default email templates
INSERT INTO email_templates (tenant_id, name, subject, html_content, text_content, template_variables, event_trigger, is_active, created_by) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'application_received',
  'Application Received - {{job_title}}',
  '<h2>Thank you for your application!</h2><p>Hi {{candidate_name}},</p><p>We have received your application for the <strong>{{job_title}}</strong> position. We appreciate your interest in joining our team.</p><p><strong>Next Steps:</strong></p><ul><li>Our team will review your application and assessment</li><li>You will receive an update within 2-3 business days</li><li>If selected, we will reach out to discuss next steps</li></ul><p>You can track your application status anytime by logging into your account.</p><p>Best regards,<br>{{company_name}} Hiring Team</p>',
  'Thank you for your application!\n\nHi {{candidate_name}},\n\nWe have received your application for the {{job_title}} position. We appreciate your interest in joining our team.\n\nNext Steps:\n- Our team will review your application and assessment\n- You will receive an update within 2-3 business days\n- If selected, we will reach out to discuss next steps\n\nYou can track your application status anytime by logging into your account.\n\nBest regards,\n{{company_name}} Hiring Team',
  '["candidate_name", "job_title", "company_name"]',
  'application_created',
  true,
  '550e8400-e29b-41d4-a716-446655440010'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'assessment_reminder',
  'Assessment Reminder - {{job_title}}',
  '<h2>Assessment Reminder</h2><p>Hi {{candidate_name}},</p><p>This is a friendly reminder that your assessment for the <strong>{{job_title}}</strong> position is still pending.</p><p>To complete your application, please log in to your account and submit your assessment response.</p><p>If you have any questions about the assessment, please don''t hesitate to reach out.</p><p>Best regards,<br>{{company_name}} Team</p>',
  'Assessment Reminder\n\nHi {{candidate_name}},\n\nThis is a friendly reminder that your assessment for the {{job_title}} position is still pending.\n\nTo complete your application, please log in to your account and submit your assessment response.\n\nIf you have any questions about the assessment, please don''t hesitate to reach out.\n\nBest regards,\n{{company_name}} Team',
  '["candidate_name", "job_title", "company_name"]',
  'assessment_reminder',
  true,
  '550e8400-e29b-41d4-a716-446655440010'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'status_update',
  'Application Status Update - {{job_title}}',
  '<h2>Application Status Update</h2><p>Hi {{candidate_name}},</p><p>We wanted to update you on the status of your application for the <strong>{{job_title}}</strong> position.</p><p><strong>Current Status:</strong> {{status}}</p><p>{{status_message}}</p><p>You can view more details by logging into your account.</p><p>Best regards,<br>{{company_name}} Team</p>',
  'Application Status Update\n\nHi {{candidate_name}},\n\nWe wanted to update you on the status of your application for the {{job_title}} position.\n\nCurrent Status: {{status}}\n\n{{status_message}}\n\nYou can view more details by logging into your account.\n\nBest regards,\n{{company_name}} Team',
  '["candidate_name", "job_title", "status", "status_message", "company_name"]',
  'application_status_changed',
  true,
  '550e8400-e29b-41d4-a716-446655440010'
);

-- Update applications with some AI scores (simulating completed AI analysis)
UPDATE applications SET
  ai_composite_score = 0.87,
  ai_scores = '{
    "reading_level": 0.82,
    "seo_score": 0.91,
    "english_proficiency": 0.89,
    "ai_detection": 0.15
  }',
  ai_analysis = '{
    "overall_assessment": "Strong candidate with excellent writing skills",
    "strengths": ["Clear structure", "SEO optimization", "Engaging content"],
    "areas_for_improvement": ["Could include more data/statistics"],
    "confidence_level": "High"
  }',
  is_shortlisted = true,
  shortlisted_at = NOW() - INTERVAL '1 day',
  status = 'shortlisted'
WHERE id = '550e8400-e29b-41d4-a716-446655440200';

UPDATE applications SET
  ai_composite_score = 0.78,
  ai_scores = '{
    "reading_level": 0.85,
    "seo_score": 0.72,
    "english_proficiency": 0.88,
    "ai_detection": 0.25
  }',
  ai_analysis = '{
    "overall_assessment": "Solid medical writing with good compliance awareness",
    "strengths": ["Medical accuracy", "Regulatory compliance", "Patient-focused"],
    "areas_for_improvement": ["Could enhance SEO elements"],
    "confidence_level": "Medium-High"
  }',
  status = 'ai_reviewed'
WHERE id = '550e8400-e29b-41d4-a716-446655440201';

-- Update assessments with AI scores
UPDATE assessments SET
  reading_level_score = 0.82,
  writing_quality_score = 0.89,
  seo_score = 0.91,
  english_proficiency_score = 0.89,
  ai_detection_score = 0.15,
  composite_score = 0.87,
  score_breakdown = '{
    "reading_level": {
      "flesch_score": 68.2,
      "grade_level": 8.5,
      "assessment": "Accessible and professional"
    },
    "seo_analysis": {
      "headings": "Well-structured with H1, H2 elements",
      "keywords": "Natural keyword integration",
      "readability": "Excellent for target audience"
    },
    "english_proficiency": {
      "grammar": "Excellent",
      "vocabulary": "Advanced",
      "fluency": "Native-level"
    },
    "ai_detection": {
      "likelihood": "Low",
      "confidence": "High",
      "human_indicators": "Personal examples, varied sentence structure"
    }
  }',
  ai_feedback = 'Excellent submission demonstrating strong technical writing skills, proper SEO optimization, and engaging content structure. The writing shows clear human authorship with personal insights and varied sentence patterns.'
WHERE id = '550e8400-e29b-41d4-a716-446655440300';

UPDATE assessments SET
  reading_level_score = 0.85,
  writing_quality_score = 0.83,
  seo_score = 0.72,
  english_proficiency_score = 0.88,
  ai_detection_score = 0.25,
  composite_score = 0.78,
  score_breakdown = '{
    "reading_level": {
      "flesch_score": 62.8,
      "grade_level": 10.2,
      "assessment": "Appropriate for educated audience"
    },
    "seo_analysis": {
      "headings": "Good structure with clear headings",
      "keywords": "Medical terminology well integrated",
      "improvements": "Could benefit from more internal links"
    },
    "english_proficiency": {
      "grammar": "Very good",
      "vocabulary": "Strong medical terminology",
      "fluency": "Professional level"
    },
    "ai_detection": {
      "likelihood": "Low-Medium",
      "confidence": "Medium",
      "notes": "Some formulaic medical writing patterns"
    }
  }',
  ai_feedback = 'Strong medical writing with appropriate technical depth and regulatory awareness. Good balance of accessibility and professional authority. Some improvement possible in SEO optimization.'
WHERE id = '550e8400-e29b-41d4-a716-446655440301';

-- Add some audit log entries
INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, new_values, ip_address, user_agent) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440010',
  'INSERT',
  'jobs',
  '550e8400-e29b-41d4-a716-446655440100',
  '{"title": "Senior B2B SaaS Content Writer", "status": "published"}',
  '192.168.1.100',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440010',
  'UPDATE',
  'applications',
  '550e8400-e29b-41d4-a716-446655440200',
  '{"status": "shortlisted", "is_shortlisted": true}',
  '192.168.1.100',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
);

-- Set sequence values to avoid conflicts
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), 1000, true);