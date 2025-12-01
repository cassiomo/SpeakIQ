"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Upload, Loader2, AlertCircle, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { processSpeech, processTranscript } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiKey, setApiKey } from '../app/api-key-actions';

function ApiKeyDialog({ isOpen, setIsOpen }) {
  const [key, setKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await setApiKey(key);
    setIsSaving(false);
    setIsOpen(false);
    window.location.reload(); // Reload to make the new key available
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your Gemini API Key</DialogTitle>
          <DialogDescription>
            To use the AI features of this app, you need to provide a Gemini API key. You can get one from Google AI Studio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input id="apiKey" type="password" value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving || !key}>
            {isSaving ? <Loader2 className="animate-spin" /> : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function AudioProcessor({ onAnalysisComplete }: { onAnalysisComplete: (result: AnalysisResult) => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkApiKey() {
      const key = await getApiKey();
      if (!key) {
        setIsApiKeyMissing(true);
      }
    }
    checkApiKey();
  }, []);

  const handleAnalysis = (res: AnalysisResult) => {
    onAnalysisComplete(res);
    router.push(`/analysis/${res.id}`);
  }

  const handleError = (e: any, defaultMessage: string) => {
    console.error(e);
    const message = e instanceof Error ? e.message : defaultMessage;
    setError(message);
    setStatus('error');
  }

  const processFile = async (file: File) => {
    setStatus('processing');
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const result = await processSpeech(reader.result as string);
          handleAnalysis(result);
        } catch (e) {
          handleError(e, "An unknown error occurred during speech analysis.");
        }
      };
    } catch (e) {
      handleError(e, "An unknown error occurred while reading the file.");
    }
  };

  const processText = async (text: string) => {
    if (!text.trim()) {
      setError("Transcript cannot be empty.");
      setStatus('error');
      return;
    }
    setStatus('processing');
    setError(null);
    try {
      const result = await processTranscript(text);
      handleAnalysis(result);
    } catch(e) {
      handleError(e, "An unknown error occurred during transcript analysis.");
    }
  }


  return (
    <Card className="w-full max-w-2xl">
      <ApiKeyDialog isOpen={isApiKeyMissing} setIsOpen={setIsApiKeyMissing} />
      <CardHeader>
        <CardTitle className="text-center font-headline text-3xl">Analyze Your Speech</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-accent" />
            <p className="font-semibold text-lg">Analyzing...</p>
            <p className="text-muted-foreground">This may take a moment. Our AI agents are hard at work.</p>
          </div>
        ) : (
          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audio"><Mic className="mr-2"/>Audio</TabsTrigger>
              <TabsTrigger value="transcript"><ClipboardPaste className="mr-2" />Transcript</TabsTrigger>
            </TabsList>
            <TabsContent value="audio" className="pt-4">
                <AudioInputProcessor setStatus={setStatus} setError={setError} onProcess={processFile} disabled={isApiKeyMissing} />
            </TabsContent>
            <TabsContent value="transcript" className="pt-4">
                <TranscriptInputProcessor setStatus={setStatus} setError={setError} onProcess={processText} disabled={isApiKeyMissing} />
            </TabsContent>
          </Tabs>
        )}

      </CardContent>
    </Card>
  );
}

function AudioInputProcessor({ setStatus, setError, onProcess, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => audioChunks.current.push(event.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        onProcess(file);
        audioChunks.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      setError("Could not start recording. Please ensure microphone permissions are granted.");
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      onProcess(event.target.files[0]);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            className="h-24 text-lg flex flex-col gap-2"
            variant={isRecording ? 'destructive' : 'default'}
            disabled={disabled}
          >
            {isRecording ? <><Square className="h-8 w-8" /><span>Stop Recording</span></> : <><Mic className="h-8 w-8" /><span>Record Audio</span></>}
          </Button>
          <Button asChild size="lg" variant="outline" className="h-24 text-lg flex flex-col gap-2" disabled={disabled}>
            <label className="cursor-pointer">
              <Upload className="h-8 w-8" />
              <span>Upload File</span>
              <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" disabled={disabled} />
            </label>
          </Button>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Record directly or upload an audio file (e.g., MP3, WAV, M4A).
      </p>
    </div>
  );
}

function TranscriptInputProcessor({ onProcess, disabled }) {
    const [transcript, setTranscript] = useState("");
    return (
        <div className="w-full space-y-4">
            <Textarea 
                placeholder="Paste your speech transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="h-32"
                disabled={disabled}
            />
            <Button onClick={() => onProcess(transcript)} className="w-full" disabled={disabled}>Analyze Transcript</Button>
             <p className="text-sm text-muted-foreground text-center">
              Paste your complete speech text for analysis.
            </p>
        </div>
    );
}

type Status = 'idle' | 'recording' | 'processing' | 'error';
