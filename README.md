# SpeakIQ - Your AI-Powered Speech Coach

SpeakIQ is a web application built with Next.js that acts as your personal public speaking coach. It uses the power of Google's Gemini AI to analyze your speech and provide detailed, actionable feedback. Whether you're preparing for a presentation, interview, or just want to improve your daily communication, SpeakIQ is here to help you speak with confidence and clarity.

## ✨ Key Features

-   **Dual Input Modes**: Analyze your speech by either **recording audio directly** in the browser or **pasting a pre-written transcript**.
-   **Comprehensive AI Analysis**: Our backend, powered by Genkit and the Gemini model, processes your speech to deliver deep insights.
-   **The SpeakIQ Score**: Get a single, easy-to-understand score that represents your overall communication effectiveness.
-   **Detailed Metrics Panel**: Dive deep into the specifics with stats on:
    -   **Filler Words**: Counts of "um," "ah," "like," and other common filler words.
    -   **Sentence Complexity**: Analysis of the variety and structure of your sentences.
    -   **Vocabulary Richness**: A score on the diversity and impact of your word choice.
    -   **Pacing**: Your speaking rate measured in words per minute (WPM).
    -   **Sentiment**: An analysis of the emotional tone of your speech.
-   **Expert Comparison**: See how your speaking style stacks up against different **Expert Archetypes** (e.g., The Visionary, The Storyteller) with a visual radar chart.
-   **Personalized Recommendations**: Receive concrete, AI-generated tips tailored to your specific performance to help you improve.
-   **Analysis History**: Track your progress over time with a history of all your past analyses and see your SpeakIQ score evolve.

## 🚀 Getting Started

To run SpeakIQ locally, you'll need Node.js and a package manager (like npm or yarn).

### 1. Set Up Your Gemini API Key

The AI features of this application require a Google Gemini API key.

1.  Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  When you first run the application, you will be prompted to enter your API key. The app will automatically create and populate a `.env` file in the root of the project with your key.

    Alternatively, you can manually create a `.env` file in the project root and add the following line:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 2. Install Dependencies

In your terminal, navigate to the project directory and run:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed, start the Next.js development server:

```bash
npm run dev
```

The application will now be running at [http://localhost:9002](http://localhost:9002).

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with the [Google Gemini](https://deepmind.google/technologies/gemini/) model
-   **Charts**: [Recharts](https://recharts.org/)
