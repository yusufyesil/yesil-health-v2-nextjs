import { YesilAIChat } from "@/components/YesilAIChat";

export default function Home() {
  return (
    <main className="flex flex-col h-[100vh]">
      <div className="flex-1 w-full max-w-5xl mx-auto">
        <YesilAIChat />
      </div>
    </main>
  );
}

