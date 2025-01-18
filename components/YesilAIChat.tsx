"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SendHorizontal, Bot, Loader2, X, Brain, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { ConsultationProcess } from "./ConsultationProcess";
import { ThinkingIndicator } from './ThinkingIndicator';
import { Skeleton } from "@/components/ui/skeleton";
import { CreditBalance } from './CreditBalance';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Consultation {
  specialty: string;
  response: string;
}

interface SpecialtyStatus {
  specialty: string;
  status: 'pending' | 'consulting' | 'completed';
}

interface Message {
  role: "user" | "assistant";
  content: string;
  consultations: Consultation[];
  stage?: string;
  processingStage?: string;
  specialtyStatuses?: SpecialtyStatus[];
  error?: boolean;
}

export function YesilAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [consultingSpecialties, setConsultingSpecialties] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [specialtyStatuses, setSpecialtyStatuses] = useState<SpecialtyStatus[]>([]);
  const { credits, updateCredits, user } = useAuth();
  const router = useRouter();
  const [lastErrorQuestion, setLastErrorQuestion] = useState<string>("");

  useEffect(() => {
    // Redirect to onboarding if not authenticated
    if (!user) {
      router.push('/onboarding');
    }
  }, [user, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, consultingSpecialties]);

  const processQuestion = async (question: string, isRetry: boolean = false) => {
    if (!isRetry) {
      setMessages(prev => [...prev, { 
        role: "user", 
        content: question,
        consultations: [] 
      }]);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "", 
        consultations: [], 
        specialtyStatuses: [], 
        stage: "Processing your question..." 
      }]);
    }

    setIsLoading(true);
    setConsultingSpecialties(new Set());
    setSpecialtyStatuses([]); 

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
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
            
            // Handle non-health case
            if (specialtiesText === 'Nohealth') {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  return [...prev.slice(0, -1), { 
                    ...lastMessage, 
                    specialtyStatuses: [],
                    processingStage: 'Non-health question detected',
                    stage: 'Not Health Related'
                  }];
                }
                return prev;
              });
              continue;
            }
            
            // Regular health-related case
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
                  s.specialty === currentSpecialty 
                    ? { ...s, status: 'consulting' as const } 
                    : s
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
                  stage: 'Final Analysis'
                }];
              }
              return prev;
            });
          }
          else if (trimmedLine.includes('Final Response:')) {
            isCollectingFinalResponse = true;
            finalResponseText = trimmedLine.split('Final Response:')[1].trim();
            
            // Immediately update the message with the final response and clear processing stage
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  content: finalResponseText.trim(),
                  stage: 'Consultation completed',
                  processingStage: undefined
                }];
              }
              return prev;
            });
          }
          else if (isCollectingFinalResponse) {
            // Add to final response and update immediately
            finalResponseText += '\n' + trimmedLine;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { 
                  ...lastMessage, 
                  content: finalResponseText.trim(),
                  stage: 'Consultation completed',
                  processingStage: undefined
                }];
              }
              return prev;
            });
          }
          else if (isCollectingConsultation && !trimmedLine.includes('Compiling final response')) {
            // Add line to consultation text
            consultationText += (consultationText ? '\n' : '') + trimmedLine;
          }
        }
      }

      // Handle any remaining consultation
      if (currentSpecialty && consultationText) {
        updateConsultation(currentSpecialty, consultationText);
      }

    } catch (error) {
      console.error('Error:', error);
      setLastErrorQuestion(question);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "I apologize, but an error occurred while processing your question. Would you like to try again?",
          stage: "Error",
          consultations: [],
          specialtyStatuses: [],
          error: true
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Check authentication first
    if (!user) {
      router.push('/onboarding');
      return;
    }
    
    // Check credits
    if (credits <= 0) {
      const baseUrl = "https://yesilhealth.lemonsqueezy.com/buy/17283596-b745-4deb-bf66-f4492bfddb11";
      const params = new URLSearchParams({
        'embed': '1',
        'media': '0',
        'discount': '0',
        'checkout[email]': user?.email || ''
      });
      const checkoutUrl = `${baseUrl}?${params.toString()}`;
      
      const link = document.createElement('a');
      link.href = checkoutUrl;
      link.className = 'lemonsqueezy-button';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Deduct credits
    await updateCredits(credits - 1);
    
    const userMessage = input.trim();
    setInput("");
    await processQuestion(userMessage);
  };

  const handleRetry = async () => {
    if (!lastErrorQuestion || isLoading) return;
    await processQuestion(lastErrorQuestion, true);
  };

  // Helper function to update consultation in messages
  const updateConsultation = (specialty: string, consultationText: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        const updatedStatuses = lastMessage.specialtyStatuses?.map(s => 
          s.specialty === specialty 
            ? { ...s, status: 'completed' as const } 
            : s
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex items-center justify-between py-4 sm:py-6 px-4 sm:px-6 border-b bg-gradient-to-r from-teal-50 to-white">
        <div className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
            alt="Yesil AI Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Yesil AI</h1>
            <p className="text-xs sm:text-sm text-gray-500">Virtual Hospital</p>
          </div>
        </div>
        <CreditBalance credits={credits} />
      </div>

      <ScrollArea className="flex-1 px-2 sm:px-4" ref={scrollAreaRef}>
        <div className="space-y-6 py-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-gray-500 mt-8 px-4"
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
                  "flex flex-col max-w-[95%] sm:max-w-[85%] rounded-lg p-3 sm:p-4",
                  message.role === "user"
                    ? "ml-auto bg-[#40E0D0]/10"
                    : "bg-white border border-gray-100 shadow-sm"
                )}
              >
                {message.role === "assistant" && message.error ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{message.content}</span>
                    </div>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 w-fit"
                      disabled={isLoading}
                    >
                      <RefreshCcw className="h-3 w-3" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Header with logo/user and status */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {message.role === "assistant" ? (
                          <>
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo200px-RHm9VN8wUaVd9WkNDzpDhPBeUG4JYr.png"
                              alt="Yesil AI Logo"
                              className="h-5 w-5 object-contain"
                            />
                            <span className="font-semibold text-gray-900">Yesil AI</span>
                          </>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-[#40E0D0] flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      {message.role === "assistant" && (
                        <span className="text-sm text-gray-500">
                          {message.stage === "Consultation completed" 
                            ? "Report" 
                            : message.processingStage || message.stage}
                        </span>
                      )}
                    </div>

                    {/* Consultation Process - only for assistant messages */}
                    {message.role === "assistant" && (
                      <ConsultationProcess
                        consultations={message.consultations}
                        specialtyStatuses={message.specialtyStatuses || []}
                        onConsultationClick={setActiveConsultation}
                        stage={message.stage || ''}
                        showStatus={false}
                      />
                    )}

                    {message.role === "assistant" && 
                     !message.error && 
                     message.stage === "Consultation completed" && (
                      <div className="mt-4 mb-4 p-3 bg-gradient-to-r from-teal-50/80 to-white rounded-lg border border-teal-100">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#14ca9e]">
                              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 text-sm">
                            <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based Medical AI</h4>
                            <p className="text-gray-600">
                              Our AI analyzes specialized medical databases for each specialty, ensuring responses are grounded in peer-reviewed literature, clinical guidelines, and medical textbooks.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {message.role === "assistant" && message.processingStage ? (
                        <div className="w-full space-y-4 mt-4">
                          <div className="flex items-center gap-2 text-[#14ca9e] animate-pulse">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-medium">
                              {message.processingStage || "Processing your question..."}
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-[#14ca9e]/20 animate-pulse"></div>
                              <div className="h-2.5 w-[70%] bg-gray-200/70 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-[#14ca9e]/20 animate-pulse"></div>
                              <div className="h-2.5 w-[85%] bg-gray-200/70 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-[#14ca9e]/20 animate-pulse"></div>
                              <div className="h-2.5 w-[60%] bg-gray-200/70 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ReactMarkdown 
                            className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-h3:text-base prose-h2:text-lg"
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.role === "assistant" && 
                           !message.error && 
                           message.stage === "Consultation completed" && (
                            <div className="text-xs text-gray-400 mt-4 pt-4 border-t">
                              This response is for informational purposes only and should not be considered as medical advice. While our AI system uses evidence-based medical databases, each patient's situation is unique. Always consult with a qualified healthcare professional for personalized medical advice, diagnosis, or treatment. In case of emergency, contact your local emergency services immediately.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-2 sm:p-4 bg-white">
        <div className="flex gap-2 items-start">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your health concerns..."
            className="flex-1 min-h-[48px] max-h-[200px] resize-none rounded-md border-gray-200 focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0]/20 text-sm"
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
            className="shrink-0 h-[38px] w-[38px] rounded-md bg-[#14ca9e] hover:bg-[#14ca9e]/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Popup for consultation details */}
      <AnimatePresence>
        {activeConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            onClick={() => setActiveConsultation(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full sm:w-[90%] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {getSpecialtyIcon(activeConsultation.specialty)}
                  {activeConsultation.specialty} AI - Consultation Report
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

              <div className="mb-4 p-3 bg-gradient-to-r from-teal-50/80 to-white rounded-lg border border-teal-100">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#14ca9e]">
                      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 text-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based {activeConsultation.specialty} AI</h4>
                    <p className="text-gray-600">
                      This consultation is powered by our specialized {activeConsultation.specialty.toLowerCase()} database, ensuring responses are grounded in peer-reviewed literature, clinical guidelines, and medical textbooks.
                    </p>
                  </div>
                </div>
              </div>

              <ReactMarkdown 
                className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1"
              >
                {activeConsultation.response}
              </ReactMarkdown>

              <div className="text-xs text-gray-400 mt-4 pt-4 border-t">
                This consultation report is for informational purposes only and should not be considered as medical advice. While our AI system uses evidence-based medical databases, each patient's situation is unique. Always consult with a qualified healthcare professional for personalized medical advice, diagnosis, or treatment. In case of emergency, contact your local emergency services immediately.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

