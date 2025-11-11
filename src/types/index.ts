export type ContentType = 'text' | 'image' | 'video';

export type VerificationResult = 'true' | 'fake' | 'pending' | 'uncertain';

export type Classification = 'man_made' | 'ai_generated' | 'authentic' | 'uncertain';

export interface VerificationResponse {
  id: string;
  result: VerificationResult;
  classification: Classification;
  confidence: number;
  details: {
    title_en?: string;
    title_ta?: string;
    source_name_en?: string;
    source_name_ta?: string;
    published_date?: string;
    original_url?: string;
    analysis_en?: string;
    analysis_ta?: string;
  };
}
