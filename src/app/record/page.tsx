'use client';

import { AudioProcessor } from "@/components/audio-processor";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { AnalysisResult } from "@/lib/types";
import { sampleAnalyses } from "@/lib/sample-analyses";
import { useEffect, useState } from "react";

export default function RecordPage() {
  const [analyses, setAnalyses] = useLocalStorage<AnalysisResult[]>("speakiq-analyses", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    // We need to check if the value from localStorage is the default empty array.
    // This effect runs on the client after hydration.
    if (isClient && analyses.length === 0) {
      const item = window.localStorage.getItem("speakiq-analyses");
      // If there's truly nothing in localStorage, initialize it.
      if (item === null || item === '[]') {
        setAnalyses(sampleAnalyses);
      }
    }
  }, [analyses, setAnalyses, isClient]);


  const handleAnalysisComplete = (result: AnalysisResult) => {
    // When a new analysis is complete, add it to the top of the list.
    // If the list only contains sample data, replace it.
    const isSampleData = analyses.every(a => a.id.startsWith('sample-'));
    if (isSampleData) {
      setAnalyses([result]);
    } else {
      setAnalyses([result, ...analyses]);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      {isClient && <AudioProcessor onAnalysisComplete={handleAnalysisComplete} />}
    </div>
  );
}
