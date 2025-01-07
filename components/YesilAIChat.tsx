"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizontal, Bot, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { simulateAPIResponse } from "@/lib/apiSimulation";

interface Consultation {
  specialty: string;
  response: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  consultations?: Consultation[];
}

export function YesilAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [consultingSpecialties, setConsultingSpecialties] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, consultingSpecialties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setConsultingSpecialties(new Set());

    try {
      const finalResponse = await simulateAPIResponse(userMessage, (partialResponse) => {
        const latestSpecialty = partialResponse.specialty_responses[partialResponse.specialty_responses.length - 1];
        setConsultingSpecialties(prev => new Set(prev).add(latestSpecialty.specialty));
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, consultations: partialResponse.specialty_responses }
            ];
          } else {
            return [
              ...prev,
              { role: 'assistant', content: '', consultations: partialResponse.specialty_responses }
            ];
          }
        });
      });

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: finalResponse.final_consultation, consultations: finalResponse.specialty_responses }
          ];
        } else {
          return [
            ...prev,
            { role: 'assistant', content: finalResponse.final_consultation, consultations: finalResponse.specialty_responses }
          ];
        }
      });
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
      setConsultingSpecialties(new Set());
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex items-center justify-center py-4 border-b">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
          alt="Yesil AI Logo"
          className="h-8 w-8 object-contain mr-3"
        />
        <h1 className="text-xl font-medium text-gray-900">Yesil AI Virtual Hospital</h1>
      </div>

      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-6 py-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-gray-500 mt-8"
            >
              <Bot className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Welcome to our Virtual Hospital. How can we assist you today?</p>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3",
                  message.role === "user"
                    ? "ml-auto bg-[#40E0D0]/10"
                    : "bg-gray-50"
                )}
              >
                {message.role === "assistant" && message.consultations && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Our multi-specialty consultation process:</p>
                    <div className="space-y-2">
                      {message.consultations.map((consultation, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="bg-gray-100 rounded-full p-1">
                            {getSpecialtyIcon(consultation.specialty)}
                          </div>
                          <Button
                            onClick={() => !consultingSpecialties.has(consultation.specialty) && setActiveConsultation(consultation)}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-auto p-1 text-left justify-start text-sm",
                              consultingSpecialties.has(consultation.specialty)
                                ? "cursor-wait"
                                : "hover:bg-transparent hover:underline"
                            )}
                          >
                            <span className="font-medium">{consultation.specialty}</span>
                            {consultingSpecialties.has(consultation.specialty) && (
                              <span className="ml-2 text-xs text-gray-500">Consulting...</span>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  {message.role === "assistant" && <Bot className="h-4 w-4 mt-1 text-gray-400" />}
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-normal prose-p:my-0">
                    {message.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-500"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Processing your case...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your health concerns..."
            className="min-h-[48px] resize-none rounded-md border-gray-200 focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0]/20 text-sm"
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
            className="shrink-0 h-[38px] w-[38px] rounded-md bg-gray-900 hover:bg-gray-800"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Popup for consultation details */}
      <AnimatePresence>
        {activeConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setActiveConsultation(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {getSpecialtyIcon(activeConsultation.specialty)}
                  {activeConsultation.specialty}
                </h2>
                <Button
                  onClick={() => setActiveConsultation(null)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {activeConsultation.response}
              </p>
              <div className="mt-4 text-xs text-gray-400">
                <p>For informational purposes only. Consult with a healthcare professional for medical advice.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

