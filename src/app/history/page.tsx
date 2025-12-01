"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { AnalysisResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  score: {
    label: "SpeakIQ Score",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function HistoryPage() {
  const [analyses, setAnalyses] = useLocalStorage<AnalysisResult[]>("speakiq-analyses", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // You can render a loading skeleton here if you want
    return null;
  }
  
  const sortedAnalyses = [...analyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const chartData = sortedAnalyses.map(a => ({
    date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: a.overallScore,
  })).reverse();

  return (
    <div className="container py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold font-headline">Analysis History</h1>
        <p className="text-lg text-muted-foreground">Review your past performances and track your progress.</p>
      </div>

      {analyses.length === 0 ? (
         <Card className="w-full py-20 flex flex-col items-center justify-center text-center">
            <CardHeader>
                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="mt-4 font-headline text-2xl">No Analyses Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You haven't analyzed any speeches. Let's get started!</p>
                <Button asChild className="mt-4">
                    <Link href="/record">Analyze First Speech</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-1">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Click on a row to see the detailed report.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead className="text-center">SpeakIQ Score</TableHead>
                      <TableHead className="text-center">Sentiment</TableHead>
                      <TableHead className="text-center">Structure</TableHead>
                      <TableHead className="text-center">Vocabulary</TableHead>
                      <TableHead className="text-center">Filler Words</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell>{new Date(analysis.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-center font-medium">{analysis.overallScore}</TableCell>
                        <TableCell className="text-center capitalize"><Badge variant="outline">{analysis.sentiment.sentiment}</Badge></TableCell>
                        <TableCell className="text-center">{analysis.structure.coherenceScore}/100</TableCell>
                        <TableCell className="text-center">{analysis.vocabulary.vocabularyRichnessScore}/100</TableCell>
                        <TableCell className="text-center">{analysis.fillerWords.total}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/analysis/${analysis.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {chartData.length > 1 && (
            <div className="lg:col-span-1">
              <Card>
                  <CardHeader>
                      <CardTitle>Progress Over Time</CardTitle>
                      <CardDescription>Your SpeakIQ score from recent analyses.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={chartConfig} className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                  <Area type="monotone" dataKey="score" stroke={chartConfig.score.color} fillOpacity={0.4} fill={chartConfig.score.color} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </ChartContainer>
                  </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
