# Voice AI Agent

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

A modern voice-enabled AI agent built with Next.js that lets you have natural conversations with AI using speech recognition and text-to-speech capabilities.

## Features

- **Voice Interaction**: Speak to the AI and get audio responses
- **Live Mode**: Immersive, continuous "live" conversational experience
- **Interruptible Responses**: AI stops speaking immediately when you start talking
- **Real-time Speech Recognition**: Convert speech to text using browser APIs
- **Text-to-Speech**: AI responses are played back using free browser synthesis
- **Modern UI**: Clean interface built with Tailwind CSS and Radix UI

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini and Groq via LangChain
- **Speech**: Web Speech API for recognition and synthesis
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Google API key or Groq API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env.local`
4. Add your API keys:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Run the development server: `npm run dev`

## License

This project is licensed under the Apache License.
