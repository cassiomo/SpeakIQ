import os
import asyncio
import pandas as pd
import numpy as np
import faiss
import whisper
from textblob import TextBlob
from typing import Dict, Any

# --- 1. GOOGLE ADK & AUTH ---
from kaggle_secrets import UserSecretsClient
from google.adk.agents import LlmAgent, ParallelAgent, SequentialAgent
from google.adk.apps.app import App, EventsCompactionConfig
from google.adk.models.google_llm import Gemini
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.tools.tool_context import ToolContext

# --- IMPORT RAG VECTOR STORE MODULE ---
from ted_faiss_store import TedVectorStore

# --- SETUP API KEY ---
try:
    user_secrets = UserSecretsClient()
    os.environ["GOOGLE_API_KEY"] = user_secrets.get_secret("GOOGLE_API_KEY")
    print("✅ API Key loaded.")
except:
    print("⚠️ API Key not found in Secrets. Please set 'GOOGLE_API_KEY'.")

# --- 2. VECTOR STORE INSTANCE ---
vector_store = TedVectorStore()

# --- 3. SESSION STATE & TOOLS ---
DEFAULT_STATE = {
    "transcript": "",
    "reports": {
        "linguist": "Pending",
        "psychologist": "Pending",
        "researcher": "Pending"
    }
}

# --- NEW TOOL: AUDIO TO TEXT ---
def tool_transcribe_audio(context: ToolContext, audio_path: str) -> str:
    print(f"   🎤 [Tool] Processing Audio File: {audio_path}")

    if not os.path.exists(audio_path):
        print("   ⚠️ File missing → Using simulated transcript.")
        simulated = (
            "Um, hello everyone. I am recording this to talk about space travel. "
            "It is really fascinating but quite dangerous. "
            "I think we should go to Mars."
        )
        state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
        state["transcript"] = simulated
        context.session_service.set_state(context.session_id, state)
        return simulated

    try:
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        text = result["text"]

        state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
        state["transcript"] = text
        context.session_service.set_state(context.session_id, state)
        return text
    except Exception as e:
        return f"Error: {str(e)}"

# --- ANALYTICAL TOOLS ---
def tool_analyze_linguistics(context: ToolContext, text: str) -> str:
    fillers = ["um", "uh", "like", "you know", "actually"]
    words = text.lower().split()
    count = sum(1 for w in words if w in fillers)
    density = (count / len(words)) * 100 if words else 0

    result = f"Filler Count: {count}, Density: {density:.2f}%"
    state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
    state["reports"]["linguist"] = result
    context.session_service.set_state(context.session_id, state)
    return result

def tool_analyze_sentiment(context: ToolContext, text: str) -> str:
    pol = TextBlob(text).sentiment.polarity
    tone = "Positive" if pol > 0.1 else "Negative" if pol < -0.1 else "Neutral"
    result = f"Tone: {tone} (Polarity: {pol:.2f})"
    state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
    state["reports"]["psychologist"] = result
    context.session_service.set_state(context.session_id, state)
    return result

def tool_rag_search(context: ToolContext, query: str) -> str:
    match = vector_store.semantic_search(query)
    state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
    state["reports"]["researcher"] = f"Similar Talk: {match}"
    context.session_service.set_state(context.session_id, state)
    return match

def tool_fetch_team_reports(context: ToolContext) -> str:
    state = context.session_service.get_state(context.session_id) or DEFAULT_STATE
    return str(state["reports"])

# --- 4. AGENTS ---
gemini_config = Gemini(model="gemini-2.5-flash-lite", parameters={"temperature": 0.1})

# --- Enhanced Agents ---
transcriber = LlmAgent(
    name="AudioTranscriber",
    model=gemini_config,
    tools=[tool_transcribe_audio],
    instruction="""
        You are the Voice Ingestion Agent.
        Input: audio path.
        Call tool_transcribe_audio.
        Output: ONLY the raw transcript text.
    """
)

linguist = LlmAgent(
    name="Linguist",
    model=gemini_config,
    tools=[tool_analyze_linguistics],
    instruction="""
        You are a Linguist Agent. Tasks:
        1. Analyze transcript for fillers, clarity, sentence complexity, and pace.
        2. Summarize linguistic strengths and weaknesses.
        3. Suggest 2-3 actionable improvements.
        4. Call tool_analyze_linguistics for filler metrics and integrate in report.
        Reply 'Linguistics filed' after completing the report.
    """
)

psychologist = LlmAgent(
    name="Psychologist",
    model=gemini_config,
    tools=[tool_analyze_sentiment],
    instruction="""
        You are a Psychologist Agent. Tasks:
        1. Analyze transcript for sentiment and emotional cues.
        2. Identify moments of confidence, hesitation, or uncertainty.
        3. Provide 2-3 tips for improving audience engagement.
        4. Call tool_analyze_sentiment and integrate polarity and tone in report.
        Reply 'Psychology filed' after completing the report.
    """
)

researcher = LlmAgent(
    name="Researcher",
    model=gemini_config,
    tools=[tool_rag_search],
    instruction="""
        You are a Researcher Agent. Tasks:
        1. Identify key topics and arguments in transcript.
        2. Retrieve top 3 related talks using tool_rag_search.
        3. Summarize insights and suggest 1-2 supporting points to strengthen the talk.
        Reply 'Research filed' after completing the report.
    """
)

coach = LlmAgent(
    name="HeadCoach",
    model=gemini_config,
    tools=[tool_fetch_team_reports],
    instruction="""
        You are the Head Coach Agent.
        1. Fetch all team reports.
        2. Assign 0-100 score based on quality of each area.
        3. Provide 3 actionable coaching tips per area.
        4. Summarize final recommendations in a coherent report.
    """
)

analysis_team = ParallelAgent(
    name="AnalysisTeam",
    sub_agents=[linguist, psychologist, researcher]
)

full_pipeline = SequentialAgent(
    name="VoicePipeline",
    sub_agents=[transcriber, analysis_team, coach]
)

# --- 5. APP ---
class TedCoachApp(App):
    def __init__(self):
        super().__init__(
            agents=[full_pipeline],
            session_service=InMemorySessionService(),
            events_compaction_config=EventsCompactionConfig(max_history_size=20)
        )

    async def process_voice_recording(self, audio_path: str):
        runner = Runner(session_service=self.session_service, app=self)

        print(f"\n🎤 Starting pipeline for: {audio_path}")
        print("1️⃣ Transcribing...")
        print("2️⃣ Parallel Team Analysis...")
        print("3️⃣ Coaching Synthesis...")

        result = await runner.run(full_pipeline, f"Process audio: {audio_path}")
        return result.content

# --- 6. MAIN ENTRYPOINT ---
async def main():
    csv = "/kaggle/input/ted-talk-transcripts-2006-2021/transcripts.csv"
    vector_store.ingest_data(csv)

    app = TedCoachApp()
    audio_fake = "user_input.mp3"

    final = await app.process_voice_recording(audio_fake)

    print("\n" + "=" * 50)
    print("📢 FINAL VOICE COACH REPORT")
    print("=" * 50)
    print(final)

if __name__ == "__main__":
    asyncio.run(main())
