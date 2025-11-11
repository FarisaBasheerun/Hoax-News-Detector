import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VerifyRequest {
  contentType: 'text' | 'image' | 'video';
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { contentType, content }: VerifyRequest = await req.json();

    const contentHash = await generateHash(content);

    const { data: existingArticle } = await supabase
      .from('verified_articles')
      .select(`
        *,
        trusted_sources (*)
      `)
      .eq('content_hash', contentHash)
      .maybeSingle();

    let result: any;

    if (existingArticle) {
      result = {
        result: 'true',
        classification: 'authentic',
        confidence: 0.95,
        details: {
          title_en: existingArticle.title_en,
          title_ta: existingArticle.title_ta,
          source_name_en: existingArticle.trusted_sources.name_en,
          source_name_ta: existingArticle.trusted_sources.name_ta,
          published_date: existingArticle.published_date,
          original_url: existingArticle.original_url,
          analysis_en: `This content matches verified news from ${existingArticle.trusted_sources.name_en}, a trusted source with high reliability.`,
          analysis_ta: `இந்த உள்ளடக்கம் ${existingArticle.trusted_sources.name_ta} என்ற நம்பகமான ஆதாரத்தில் இருந்து சரிபார்க்கப்பட்ட செய்திகளுடன் பொருந்துகிறது.`,
        },
      };
    } else {
      const analysisResult = await analyzeContent(content, contentType);
      result = analysisResult;
    }

    const { data: verificationRecord } = await supabase
      .from('verification_requests')
      .insert({
        content_type: contentType,
        content_text: contentType === 'text' ? content : null,
        content_url: contentType !== 'text' ? content : null,
        verification_result: result.result,
        classification: result.classification,
        confidence_score: result.confidence,
        details: result.details,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ ...result, id: verificationRecord?.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify content' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function generateHash(content: string): Promise<string> {
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function analyzeContent(
  content: string,
  contentType: string
): Promise<any> {
  const keywords = {
    fake: ['breaking', 'shocking', 'unbelievable', 'urgent', 'viral', 'must see', 'you won\'t believe'],
    authentic: ['according to', 'reported by', 'official statement', 'confirmed by', 'study shows'],
  };

  const contentLower = content.toLowerCase();
  let fakeScore = 0;
  let authenticScore = 0;

  keywords.fake.forEach(keyword => {
    if (contentLower.includes(keyword)) fakeScore++;
  });

  keywords.authentic.forEach(keyword => {
    if (contentLower.includes(keyword)) authenticScore++;
  });

  const hasProperSources = /https?:\/\//i.test(content);
  const hasEmotionalLanguage = /(!{2,}|\?{2,}|[A-Z]{5,})/g.test(content);
  const isShortAndVague = content.length < 100;

  if (hasEmotionalLanguage) fakeScore += 2;
  if (isShortAndVague) fakeScore += 1;
  if (hasProperSources) authenticScore += 2;

  const totalScore = fakeScore + authenticScore;
  const fakePercentage = totalScore > 0 ? fakeScore / totalScore : 0.5;

  let result: 'true' | 'fake' | 'uncertain';
  let classification: 'man_made' | 'ai_generated' | 'authentic' | 'uncertain';
  let confidence: number;

  if (fakePercentage > 0.6) {
    result = 'fake';
    const hasRepetitivePatterns = /(\b\w+\b)(\s+\1){2,}/gi.test(content);
    classification = hasRepetitivePatterns ? 'ai_generated' : 'man_made';
    confidence = 0.65 + (fakePercentage - 0.6) * 0.5;
  } else if (fakePercentage < 0.4) {
    result = 'true';
    classification = 'authentic';
    confidence = 0.65 + (0.4 - fakePercentage) * 0.5;
  } else {
    result = 'uncertain';
    classification = 'uncertain';
    confidence = 0.5;
  }

  return {
    result,
    classification,
    confidence: Math.min(confidence, 0.95),
    details: {
      analysis_en:
        result === 'fake'
          ? `This content exhibits characteristics common in misinformation: ${hasEmotionalLanguage ? 'excessive emotional language, ' : ''}${isShortAndVague ? 'vague or incomplete information, ' : ''}${!hasProperSources ? 'lack of credible sources' : ''}. We recommend verifying with trusted news outlets.`
          : result === 'true'
          ? `This content shows indicators of reliable reporting: ${hasProperSources ? 'includes proper sources, ' : ''}balanced language, and verifiable claims. However, always cross-reference with multiple trusted sources.`
          : 'Unable to definitively classify this content. We recommend verifying with multiple trusted news sources before sharing.',
      analysis_ta:
          result === 'fake'
          ? `இந்த உள்ளடக்கம் தவறான தகவல்களில் பொதுவான பண்புகளை வெளிப்படுத்துகிறது: ${hasEmotionalLanguage ? 'அதிகப்படியான உணர்ச்சி மொழி, ' : ''}${isShortAndVague ? 'தெளிவற்ற அல்லது முழுமையற்ற தகவல், ' : ''}${!hasProperSources ? 'நம்பகமான ஆதாரங்கள் இல்லை' : ''}. நம்பகமான செய்தி நிறுவனங்களுடன் சரிபார்க்க பரிந்துரைக்கிறோம்.`
          : result === 'true'
          ? `இந்த உள்ளடக்கம் நம்பகமான அறிக்கையின் குறிகாட்டிகளைக் காட்டுகிறது: ${hasProperSources ? 'சரியான ஆதாரங்களை உள்ளடக்கியது, ' : ''}சமநிலையான மொழி மற்றும் சரிபார்க்கக்கூடிய கூற்றுகள். எனினும், எப்போதும் பல நம்பகமான ஆதாரங்களுடன் குறுக்கு குறிப்பு.`
          : 'இந்த உள்ளடக்கத்தை திட்டவட்டமாக வகைப்படுத்த முடியவில்லை. பகிர்வதற்கு முன் பல நம்பகமான செய்தி ஆதாரங்களுடன் சரிபார்க்க பரிந்துரைக்கிறோம்.',
    },
  };
}
