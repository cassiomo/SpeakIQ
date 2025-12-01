import type { AnalysisResult } from './types';

export const sampleAnalyses: AnalysisResult[] = [
  {
    id: 'sample-high',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    transcription: 'Good morning. I am thrilled to unveil a project that represents not just an advancement, but a revolution in our industry. Through rigorous research and relentless innovation, we have developed a solution that is both powerful and intuitive, set to redefine the user experience. Our journey was challenging, but our purpose was clear: to create value and drive progress. This is that future.',
    overallScore: 92,
    fillerWords: {
      umCount: 0,
      ahCount: 0,
      likeCount: 0,
      otherFillerWords: {},
      total: 0,
    },
    vocabulary: {
      vocabularyRichnessScore: 95,
      feedback: 'Exceptional vocabulary. Your word choice is precise, professional, and impactful.',
    },
    structure: {
      coherenceScore: 94,
      strengths: 'The speech is exceptionally well-structured with a powerful opening and a clear, logical flow.',
      weaknesses: 'No significant weaknesses detected.',
      recommendations: 'Continue to use this strong structural model in future presentations.',
    },
    sentiment: {
      sentiment: 'positive',
      score: 0.9,
    },
    improvementTips: [
      'Excellent performance with no filler words. Keep it up!',
      'Your command of language is a key strength. Continue leveraging strong verbs and precise nouns.',
      'Your speech structure serves as a great model for others.',
    ],
    complexity: {
      sentenceComplexityScore: 88,
      feedback: 'You masterfully blend complex and simple sentences, creating a rhythm that is engaging and easy to follow.',
    },
    pacing: {
      wordsPerMinute: 150,
      feedback: 'Your pacing is ideal—energetic and confident, yet perfectly clear.',
    },
    expertComparison: {
      clarity: 95,
      engagement: 90,
      confidence: 98,
    },
  },
  {
    id: 'sample-mid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    transcription: 'So, like, I think the most important thing is that we need to, um, focus on the user experience. It\'s really, ah, critical to our success. We have some good ideas, and I feel that if we work together, we can make it happen. It\'s a good opportunity for us.',
    overallScore: 73,
    fillerWords: {
      umCount: 1,
      ahCount: 1,
      likeCount: 1,
      otherFillerWords: { so: 1 },
      total: 4,
    },
    vocabulary: {
      vocabularyRichnessScore: 72,
      feedback: 'Your vocabulary is clear but could be more impactful. Try incorporating stronger verbs to replace phrases like "make it happen".',
    },
    structure: {
      coherenceScore: 70,
      strengths: 'The main point about user experience is identifiable.',
      weaknesses: 'The opening is hesitant and the conclusion is abrupt. The argument could be better supported.',
      recommendations: 'Start with a declarative statement instead of "So, like, I think". Plan a concluding sentence to summarize your point.',
    },
    sentiment: {
      sentiment: 'neutral',
      score: 0.2,
    },
    improvementTips: [
      'Practice pausing instead of using filler words like "um" and "like".',
      'Strengthen your opening and closing statements to frame your message more effectively.',
      'Replace common words like "good" with more descriptive alternatives like "valuable" or "significant".',
    ],
    complexity: {
      sentenceComplexityScore: 65,
      feedback: 'Most sentences are simple. Varying sentence length can make your speech more engaging.',
    },
    pacing: {
      wordsPerMinute: 165,
      feedback: 'Your pace is a little fast. Slowing down can help you articulate more clearly and reduce filler words.',
    },
    expertComparison: {
      clarity: 70,
      engagement: 65,
      confidence: 75,
    },
  },
  {
    id: 'sample-low',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    transcription: 'Um, okay, so, the thing is... it\'s, like, really important. We did a lot of stuff. And, ah, the stuff we did, right, it was hard. So... yeah. That\'s pretty much it.',
    overallScore: 48,
    fillerWords: {
      umCount: 1,
      ahCount: 1,
      likeCount: 1,
      otherFillerWords: { so: 2, right: 1, yeah: 1 },
      total: 7,
    },
    vocabulary: {
      vocabularyRichnessScore: 45,
      feedback: 'Vocabulary is very basic. Words like "thing" and "stuff" are vague and weaken your message.',
    },
    structure: {
      coherenceScore: 40,
      strengths: 'The speaker attempted to present a topic.',
      weaknesses: 'There is no clear structure, introduction, or conclusion. The core message is very difficult to understand.',
      recommendations: 'Before speaking, write down your single main point. Then, write one sentence to introduce it and one to conclude it. Build from there.',
    },
    sentiment: {
      sentiment: 'neutral',
      score: -0.1,
    },
    improvementTips: [
      'Focus on reducing filler words; this is the quickest way to sound more confident.',
      'Define your key message before you start talking. What is the one "thing" you want your audience to know?',
      'Use specific nouns instead of "stuff" to make your points clear.',
    ],
    complexity: {
      sentenceComplexityScore: 35,
      feedback: 'Sentences are fragmented and often incomplete. Focus on speaking in complete thoughts.',
    },
    pacing: {
      wordsPerMinute: 110,
      feedback: 'Your pace is quite slow and hesitant, which can signal a lack of confidence. Planning your thoughts can help improve this.',
    },
    expertComparison: {
      clarity: 40,
      engagement: 30,
      confidence: 35,
    },
  },
];
