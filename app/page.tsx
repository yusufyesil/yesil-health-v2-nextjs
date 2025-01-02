import { YesilAIChat } from '@/components/yesil-ai-chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Yesil AI Health Assistant</h1>
          <p className="text-muted-foreground">Your intelligent healthcare companion powered by specialized medical AI</p>
        </header>
        <YesilAIChat />
      </div>
    </main>
  );
}