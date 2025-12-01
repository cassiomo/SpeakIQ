'use server';

import { speechToTextTranscription } from "@/ai/flows/speech-to-text-transcription";
import { analyzeFillerWords } from "@/ai/flows/analyze-filler-words";
import { assessVocabularyRichness } from "@/ai/flows/assess-vocabulary-richness";
import { evaluateSpeechStructure } from "@/ai/flows/evaluate-speech-structure";
import { performSentimentAnalysis } from "@/ai/flows/perform-sentiment-analysis";
import { generateImprovementTips } from "@/ai/flows/generate-improvement-tips";
import { analyzeSentenceComplexity } from "@/ai/flows/analyze-sentence-complexity";
import { calculatePacing } from "@/ai/flows/calculate-pacing";
import { generateExpertComparison } from "@/ai/flows/generate-expert-comparison";
import type { AnalysisResult } from "@/lib/types";

async function runAnalysis(transcription: string): Promise<AnalysisResult> {
    if (!transcription || transcription.trim().length < 5) {
      throw new Error("Transcription is too short to analyze.");
    }

    // 2. Parallelize analysis agents
    const [
      fillerWordsResult,
      vocabularyResult,
      structureResult,
      sentimentResult,
      complexityResult,
      pacingResult,
      expertComparisonResult,
    ] = await Promise.all([
      analyzeFillerWords({ speechText: transcription }),
      assessVocabularyRichness({ transcription }),
      evaluateSpeechStructure(transcription),
      performSentimentAnalysis({ transcription }),
      analyzeSentenceComplexity({ transcription }),
      calculatePacing({ transcription }),
      generateExpertComparison({ transcription }),
    ]);
    
    // 3. Generate improvement tips based on analysis
    const improvementTipsResult = await generateImprovementTips({
      fillerWordAnalysis: JSON.stringify(fillerWordsResult),
      vocabularyRichnessScore: vocabularyResult.vocabularyRichnessScore,
      speechStructureAssessment: structureResult.recommendations,
      sentimentAnalysis: sentimentResult.sentiment,
      comparativeAnalysis: JSON.stringify(expertComparisonResult),
    });

    // 4. Calculate total filler words and overall score
    const totalFillerWords = fillerWordsResult.umCount + fillerWordsResult.ahCount + fillerWordsResult.likeCount + Object.values(fillerWordsResult.otherFillerWords).reduce((a, b) => a + b, 0);
    
    // Normalize sentiment score from [-1, 1] to [0, 100]
    const normalizedSentimentScore = (sentimentResult.score + 1) * 50;
    
    const overallScore = Math.round(
        (vocabularyResult.vocabularyRichnessScore + structureResult.coherenceScore + normalizedSentimentScore + complexityResult.sentenceComplexityScore) / 4
    );

    // 5. Assemble result object
    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      transcription,
      overallScore,
      fillerWords: {
          ...fillerWordsResult,
          total: totalFillerWords,
      },
      vocabulary: vocabularyResult,
      structure: structureResult,
      sentiment: sentimentResult,
      improvementTips: improvementTipsResult.improvementTips,
      complexity: complexityResult,
      pacing: pacingResult,
      expertComparison: expertComparisonResult,
    };

    return result;
}


export async function processSpeech(audioDataUri: string): Promise<AnalysisResult> {
  try {
    // 1. Transcription
    const { transcription } = await speechToTextTranscription({ audioDataUri });
    return await runAnalysis(transcription);
  } catch(error) {
    console.error("Error processing speech:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process speech: ${error.message}`);
    }
    throw new Error("An unknown error occurred during speech processing.");
  }
}

export async function processTranscript(transcript: string): Promise<AnalysisResult> {
  try {
    return await runAnalysis(transcript);
  } catch(error) {
    console.error("Error processing transcript:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process transcript: ${error.message}`);
    }
    throw new Error("An unknown error occurred during transcript processing.");
  }
}
