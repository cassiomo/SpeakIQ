export interface AnalysisResult {
  id: string;
  createdAt: string;
  transcription: string;
  overallScore: number;
  fillerWords: {
    umCount: number;
    ahCount: number;
    likeCount: number;
    otherFillerWords: Record<string, number>;
    total: number;
  };
  vocabulary: {
    vocabularyRichnessScore: number;
    feedback: string;
  };
  structure: {
    coherenceScore: number;
    strengths: string;
    weaknesses: string;
    recommendations: string;
  };
  sentiment: {
    sentiment: string;
    score: number;
  };
  improvementTips: string[];
  complexity: {
    sentenceComplexityScore: number;
    feedback: string;
  };
  pacing: {
    wordsPerMinute: number;
    feedback: string;
  };
  expertComparison: {
    clarity: number;
    engagement: number;
    confidence: number;
  };
}
