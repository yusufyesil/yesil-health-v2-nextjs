"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizontal, Bot, Loader2, X, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { ConsultationProcess } from "./ConsultationProcess";
import { ThinkingIndicator } from './ThinkingIndicator';
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from './Header';

interface Consultation {
  specialty: string;
  response: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  consultations: Consultation[];
  stage?: string;
  processingStage?: string;
  specialtyStatuses?: SpecialtyStatus[];
}

// Add new interface for specialty status
interface SpecialtyStatus {
  specialty: string;
  status: 'pending' | 'consulting' | 'completed';
}

export function YesilAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [consultingSpecialties, setConsultingSpecialties] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [specialtyStatuses, setSpecialtyStatuses] = useState<SpecialtyStatus[]>([]);

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
    setMessages((prev) => [...prev, { 
      role: "assistant", 
      content: "", 
      consultations: [], 
      specialtyStatuses: [], 
      stage: "Processing your question..." 
    }]);
    setIsLoading(true);
    setConsultingSpecialties(new Set());
    setSpecialtyStatuses([]); 

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let buffer = '';
      let currentSpecialty = '';
      let isCollectingConsultation = false;
      let consultationText = '';
      let isCollectingFinalResponse = false;
      let finalResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += new TextDecoder().decode(value);
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          console.log('Processing line:', trimmedLine); // Debug log

          if (trimmedLine.includes('Processing the question')) {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  processingStage: 'Analyzing your question...',
                  stage: 'Initial Analysis'
                }];
              }
              return prev;
            });
          }
          else if (trimmedLine.includes('Specialties determined:')) {
            const specialtiesText = trimmedLine.split('Specialties determined:')[1].trim();
            const specialties = specialtiesText.split(',').map(s => s.trim());
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  specialtyStatuses: specialties.map(specialty => ({
                    specialty,
                    status: 'pending'
                  })),
                  processingStage: `Consulting ${specialties.length} specialists...`,
                  stage: 'Specialist Consultation'
                }];
              }
              return prev;
            });
          }
          else if (trimmedLine.includes('Processing consultation for')) {
            // Save previous consultation if exists
            if (currentSpecialty && consultationText) {
              updateConsultation(currentSpecialty, consultationText);
              consultationText = '';
            }
            
            currentSpecialty = trimmedLine.split('Processing consultation for')[1].split('...')[0].trim();
            isCollectingConsultation = false;
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                const updatedStatuses = (lastMessage.specialtyStatuses || []).map(s => 
                  s.specialty === currentSpecialty ? { ...s, status: 'consulting' } : s
                );
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  specialtyStatuses: updatedStatuses
                }];
              }
              return prev;
            });
          }
          else if (trimmedLine.includes('consultation:')) {
            isCollectingConsultation = true;
            isCollectingFinalResponse = false;
            consultationText = '';
          }
          else if (trimmedLine === 'Compiling final response...') {
            // Save last consultation if exists
            if (currentSpecialty && consultationText) {
              updateConsultation(currentSpecialty, consultationText);
              consultationText = '';
            }
            isCollectingConsultation = false;
            isCollectingFinalResponse = false;
            
            // Update message to show thinking state
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  processingStage: 'Analyzing consultations...',
                  stage: 'Final Analysis',
                  content: '⌛ Yesil AI is thinking on consultations...' // This will be replaced by ThinkingIndicator
                }];
              }
              return prev;
            });
          }
          else if (trimmedLine.includes('Final Response:')) {
            isCollectingFinalResponse = true;
            finalResponseText = trimmedLine.split('Final Response:')[1].trim();
            
            // Update the stage to show it's completed
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  stage: 'Consultation completed'  // This will trigger "Report" in the header
                }];
              }
              return prev;
            });
          }
          else if (isCollectingFinalResponse) {
            // Add to final response
            finalResponseText += '\n' + trimmedLine;
          }
          else if (isCollectingConsultation && !trimmedLine.includes('Compiling final response')) {
            // Add line to consultation text
            consultationText += (consultationText ? '\n' : '') + trimmedLine;
          }
        }
      }

      // After the streaming is done, update the final response
      if (finalResponseText) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), { 
              ...lastMessage, 
              content: finalResponseText.trim(),
              stage: 'Consultation completed'
            }];
          }
          return prev;
        });
      }

      // Handle any remaining consultation
      if (currentSpecialty && consultationText) {
        updateConsultation(currentSpecialty, consultationText);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I apologize, but an error occurred. Please try again.",
          stage: "Error"
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update consultation in messages
  const updateConsultation = (specialty: string, consultationText: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Update specialty statuses for this specific message
        const updatedStatuses = lastMessage.specialtyStatuses?.map(s => 
          s.specialty === specialty ? { ...s, status: 'completed' } : s
        ) || [];

        const existingConsultations = lastMessage.consultations || [];
        const consultationIndex = existingConsultations.findIndex(c => c.specialty === specialty);
        
        const cleanedText = consultationText
          .replace(/^\s*consultation:\s*/i, '')
          .trim();
        
        const updatedConsultations = consultationIndex === -1 
          ? [...existingConsultations, { specialty, response: cleanedText }]
          : existingConsultations.map((c, i) => 
              i === consultationIndex ? { ...c, response: cleanedText } : c
            );

        return [...prev.slice(0, -1), { 
          ...lastMessage, 
          consultations: updatedConsultations,
          specialtyStatuses: updatedStatuses
        }];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Logo and Title - Desktop */}
      <div className="hidden md:block fixed top-0 left-0 p-6">
        <div className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
            alt="Yesil AI Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-900">Yesil AI</h1>
            <p className="text-sm text-gray-500">Virtual Hospital</p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-col h-screen max-w-4xl mx-auto pt-16 md:pt-4">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
              alt="Yesil AI Logo"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900">Yesil AI</h1>
              <p className="text-xs text-gray-500">Virtual Hospital</p>
            </div>
          </div>
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
                  {message.role === "assistant" && (
                    <>
                      {/* Header with logo and status - only for assistant messages */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
                            alt="Yesil AI Logo"
                            className="h-5 w-5 object-contain"
                          />
                          <span className="font-semibold text-gray-900">Yesil AI</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {message.stage === "Consultation completed" 
                            ? "Report" 
                            : message.processingStage || message.stage}
                        </span>
                      </div>

                      {/* Consultation Process without duplicate status */}
                    <ConsultationProcess
                      consultations={message.consultations}
                        specialtyStatuses={message.specialtyStatuses || []}
                      onConsultationClick={setActiveConsultation}
                      stage={message.stage}
                        showStatus={false} // Add this prop to hide status in ConsultationProcess
                      />
                    </>
                  )}

                  <div className="flex items-start">
                    {message.content.includes('Yesil AI is thinking on consultations') ? (
                      <div className="w-full space-y-3 mt-4">
                        <ThinkingIndicator />
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-[85%] bg-gray-200" />
                          <Skeleton className="h-4 w-[75%] bg-gray-200" />
                        </div>
                      </div>
                    ) : (
                      <ReactMarkdown 
                        className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-h3:text-base prose-h2:text-lg"
                      >
                      {message.content}
                    </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
                className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
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
                <ReactMarkdown 
                  className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1"
                >
                  {activeConsultation.response}
                </ReactMarkdown>
                <div className="mt-4 text-xs text-gray-400">
                  <p>For informational purposes only. Consult with a healthcare professional for medical advice.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

