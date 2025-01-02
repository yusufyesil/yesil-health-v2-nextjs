"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizontal, Bot, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  consultations?: { specialty: string; response: string }[];
}

export function YesilAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<{
    specialty: string;
    response: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate an API response
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            final_consultation: "This is the final recommendation.",
            specialty_responses: {
              Neurology: "Neurological evaluation example response.",
              Cardiology: "Cardiological evaluation example response.",
            },
          });
        }, 1000)
      );

      const data = response as {
        final_consultation: string;
        specialty_responses: Record<string, string>;
      };

      const consultations = Object.entries(data.specialty_responses).map(
        ([specialty, response]) => ({ specialty, response })
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.final_consultation,
          consultations,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but an error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      {/* Yesil AI Logo */}
      <div className="flex justify-center py-4">
        <img
          src="logo.png"
          alt="Yesil AI Logo"
          className="h-12 w-auto object-contain"
        />
      </div>

      <ScrollArea className="flex-1 p-4 rounded-t-lg bg-card">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col max-w-[80%] rounded-lg p-4",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted/80"
              )}
            >
              {/* Display consultation icons with labels */}
              {message.role === "assistant" && message.consultations && (
                <div className="mb-2">
                  {/* Consultation bar */}
                  <div className="flex items-center gap-4 mb-2 bg-blue-100 p-2 rounded-lg">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Consultations:
                    </span>
                    <div className="flex gap-4 items-center flex-wrap">
                      {message.consultations.map((consultation, i) => (
                        <Button
                          key={i}
                          onClick={() => setActiveConsultation(consultation)}
                          variant="outline"
                          className="flex items-center gap-2 bg-white text-black border rounded-full p-3 hover:bg-gray-100"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-muted text-black rounded-full shadow">
                            <Info className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-black">
                            {consultation.specialty}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                {message.role === "assistant" && <Bot className="h-5 w-5 mt-1" />}
                <div className="mb-2">
                  <span className="text-sm font-semibold text-muted-foreground mb-2 block">
                    Final Recommendation:
                  </span>
                  <div className="flex flex-wrap gap-4 items-center">
                    <ReactMarkdown className="prose text-sm">{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Yesil AI is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-card border-t flex gap-2 items-end rounded-b-lg"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health concerns..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </form>

      {/* Popup for consultation details */}
      {activeConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {activeConsultation.specialty}
            </h2>
            <p className="text-sm">{activeConsultation.response}</p>
            <Button
              onClick={() => setActiveConsultation(null)}
              className="mt-4 w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
