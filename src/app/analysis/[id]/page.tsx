"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { AnalysisResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle, ListChecks, MicVocal, BotMessageSquare, BarChartBig, Smile, Meh, Frown, Brain, Zap, Gauge, User, Award } from "lucide-react";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import Loading from "./loading";
import { expertProfiles, ExpertProfile } from "@/lib/expert-profiles";
import { cn } from "@/lib/utils";


const fillerWordsChartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const radarChartConfig = {
  user: {
    label: "You",
    color: "hsl(var(--chart-1))",
  },
  expert: {
    label: "Expert",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const sentimentIcon = (sentiment: string) => {
    switch(sentiment.toLowerCase()){
        case 'positive': return <Smile className="h-6 w-6 text-green-500" />;
        case 'negative': return <Frown className="h-6 w-6 text-red-500" />;
        default: return <Meh className="h-6 w-6 text-yellow-500" />;
    }
}

// Function to find the closest expert
function findClosestExpert(userScores: { clarity: number; engagement: number; confidence: number }): ExpertProfile {
  let closestExpert = expertProfiles[0];
  let minDistance = Infinity;

  for (const expert of expertProfiles) {
    const distance = Math.sqrt(
      Math.pow(userScores.clarity - expert.scores.clarity, 2) +
      Math.pow(userScores.engagement - expert.scores.engagement, 2) +
      Math.pow(userScores.confidence - expert.scores.confidence, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestExpert = expert;
    }
  }
  return closestExpert;
}

export default function AnalysisPage() {
  const params = useParams();
  const { id } = params;
  const [analyses] = useLocalStorage<AnalysisResult[]>("speakiq-analyses", []);
  const [analysis, setAnalysis] = useState<AnalysisResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (analyses && id) {
      const foundAnalysis = analyses.find((a) => a.id === id);
      setAnalysis(foundAnalysis);
      setIsLoading(false);
    }
  }, [analyses, id]);

  if (isLoading) {
    return <Loading />;
  }

  if (!analysis) {
    return notFound();
  }

  const fillerWordsData = [
    { word: "um", count: analysis.fillerWords.umCount },
    { word: "ah", count: analysis.fillerWords.ahCount },
    { word: "like", count: analysis.fillerWords.likeCount },
    ...Object.entries(analysis.fillerWords.otherFillerWords).map(([word, count]) => ({ word, count })),
  ].filter(item => item.count > 0);
  
  const closestExpert = findClosestExpert(analysis.expertComparison);

  const expertComparisonData = [
      { metric: 'Clarity', user: analysis.expertComparison.clarity, expert: closestExpert.scores.clarity },
      { metric: 'Engagement', user: analysis.expertComparison.engagement, expert: closestExpert.scores.engagement },
      { metric: 'Confidence', user: analysis.expertComparison.confidence, expert: closestExpert.scores.confidence },
  ]
  
  const comparisonMetrics = [
    { name: "Clarity", user: analysis.expertComparison.clarity, expert: closestExpert.scores.clarity },
    { name: "Engagement", user: analysis.expertComparison.engagement, expert: closestExpert.scores.engagement },
    { name: "Confidence", user: analysis.expertComparison.confidence, expert: closestExpert.scores.confidence },
  ]

  return (
    <div className="container py-12">
      <header className="mb-8">
        <p className="text-muted-foreground">{new Date(analysis.createdAt).toLocaleString()}</p>
        <h1 className="text-4xl font-bold font-headline">Analysis Report</h1>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
             <CardHeader>
               <CardTitle className="text-2xl font-headline">SpeakIQ Score</CardTitle>
             </CardHeader>
             <CardContent className="flex items-center justify-center gap-6">
                <div className="text-7xl font-bold">{analysis.overallScore}</div>
                <div className="w-full">
                    <Progress value={analysis.overallScore} className="h-4" />
                    <p className="text-sm text-primary-foreground/80 mt-2">A single number indicating total communication effectiveness.</p>
                </div>
             </CardContent>
           </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MicVocal /> Transcription</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full rounded-md border p-4">
                <p className="text-foreground/90 leading-relaxed">{analysis.transcription}</p>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb /> Improvement Tips</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.improvementTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Metrics Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           {sentimentIcon(analysis.sentiment.sentiment)}
                           <span className="font-semibold">Sentiment</span>
                        </div>
                        <Badge variant="outline" className="capitalize">{analysis.sentiment.sentiment}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <BotMessageSquare />
                           <span className="font-semibold">Vocabulary</span>
                        </div>
                        <Badge variant="outline">{analysis.vocabulary.vocabularyRichnessScore}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <ListChecks />
                           <span className="font-semibold">Structure</span>
                        </div>
                        <Badge variant="outline">{analysis.structure.coherenceScore}/100</Badge>
                    </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <Brain />
                           <span className="font-semibold">Complexity</span>
                        </div>
                        <Badge variant="outline">{analysis.complexity.sentenceComplexityScore}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <Gauge />
                           <span className="font-semibold">Pacing (WPM)</span>
                        </div>
                        <Badge variant="outline">{analysis.pacing.wordsPerMinute}</Badge>
                    </div>
                </CardContent>
           </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap /> Visual Comparison</CardTitle>
              <CardDescription>How you stack up against the <span className="font-bold">{closestExpert.name}</span> archetype.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-6">
                  {comparisonMetrics.map(metric => (
                     <div key={metric.name}>
                        <h4 className="text-sm font-semibold mb-1">{metric.name}</h4>
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" style={{color: 'var(--color-user)'}} />
                            <span>You:</span>
                            <span className="font-bold" style={{color: 'var(--color-user)'}}>{metric.user}</span>
                          </div>
                           <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" style={{color: 'var(--color-expert)'}} />
                            <span>Expert:</span>
                            <span className="font-bold" style={{color: 'var(--color-expert)'}}>{metric.expert}</span>
                          </div>
                        </div>
                        <Progress value={(metric.user / (metric.expert + 5)) * 100} className="h-2 mt-2 [&>div]:bg-[--color-user]" />
                     </div>
                  ))}
                </div>
                <ChartContainer config={radarChartConfig} className="h-60 w-full">
                    <ResponsiveContainer>
                        <RadarChart data={expertComparisonData}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="You" dataKey="user" fill="var(--color-user)" fillOpacity={0.6} stroke="var(--color-user)" />
                            <Radar name={closestExpert.name} dataKey="expert" fill="var(--color-expert)" fillOpacity={0.6} stroke="var(--color-expert)" />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChartBig /> Filler Words</CardTitle>
              <CardDescription>Total Count: {analysis.fillerWords.total}</CardDescription>
            </CardHeader>
            <CardContent>
              {fillerWordsData.length > 0 ? (
                <ChartContainer config={fillerWordsChartConfig} className="h-48 w-full">
                  <ResponsiveContainer>
                    <BarChart data={fillerWordsData} layout="vertical" margin={{left: -10, right: 30}}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="word" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} width={60} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No filler words detected. Great job!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
