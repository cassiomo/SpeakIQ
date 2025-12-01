import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle2, Mic, BarChart, BrainCircuit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Mic className="h-8 w-8 text-accent" />,
    title: "AI-Powered Analysis",
    description: "Our advanced AI transcribes and analyzes your speech for filler words, vocabulary, and sentiment.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-accent" />,
    title: "In-depth Metrics",
    description: "Receive detailed scores and visualizations on your performance, from pacing to word choice.",
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-accent" />,
    title: "Actionable Feedback",
    description: "Get personalized tips and recommendations to improve your structure, clarity, and impact.",
  },
];

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="container grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24">
        <div className="flex flex-col gap-6 items-start text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-primary tracking-tighter">
            Transform Your Speaking Skills with AI
          </h1>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            SpeakIQ evaluates your speech, compares it with top performers, and delivers personalized feedback to help you become a more confident and effective speaker.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/record">Start Analyzing for Free</Link>
            </Button>
          </div>
        </div>
        <div className="w-full h-auto">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              width={600}
              height={400}
              data-ai-hint={heroImage.imageHint}
              className="rounded-lg shadow-2xl object-cover aspect-[3/2]"
            />
          )}
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our comprehensive toolset provides deep insights into every aspect of your public speaking.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-left">
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight text-primary">
              How It Works: Simple as 1, 2, 3
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Start improving in minutes with our streamlined process.
            </p>
          </div>
          <div className="relative mt-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Record or Upload</h3>
                <p className="text-muted-foreground">Record your speech directly in the browser or upload an existing audio file.</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Receive Analysis</h3>
                <p className="text-muted-foreground">Our AI agents analyze your speech, providing scores and detailed feedback.</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Track & Improve</h3>
                <p className="text-muted-foreground">Review your history, track your progress, and apply our tips to get better.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
