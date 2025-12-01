'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { expertProfiles, ExpertProfile } from "@/lib/expert-profiles";
import Image from "next/image";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

const radarChartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

function ExpertProfileCard({ profile }: { profile: ExpertProfile }) {
    const chartData = [
        { metric: 'Clarity', score: profile.scores.clarity },
        { metric: 'Engagement', score: profile.scores.engagement },
        { metric: 'Confidence', score: profile.scores.confidence },
    ];
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Image src={profile.avatar} alt={profile.name} width={80} height={80} className="rounded-full" />
                <div>
                    <CardTitle className="font-headline text-2xl">{profile.name}</CardTitle>
                    <CardDescription>{profile.title}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">{profile.description}</p>
                 <div className="h-52 w-full">
                    <ChartContainer config={radarChartConfig} className="w-full h-full">
                        <ResponsiveContainer>
                            <RadarChart data={chartData} >
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name={profile.name} dataKey="score" fill="var(--color-score)" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ExpertsPage() {
    return (
        <div className="container py-12">
            <div className="space-y-4 mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline">Expert Speaker Archetypes</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    See how your skills stack up against different styles of world-class communicators. Use these profiles to find your unique speaking voice.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {expertProfiles.map(profile => (
                    <ExpertProfileCard key={profile.name} profile={profile} />
                ))}
            </div>
        </div>
    )
}
