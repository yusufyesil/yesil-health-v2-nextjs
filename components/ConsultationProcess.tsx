import { motion } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ConsultationProcessProps {
  consultations: Array<{ specialty: string; response: string }>;
  specialtyStatuses: Array<{ specialty: string; status: 'pending' | 'consulting' | 'completed' }>;
  onConsultationClick: (consultation: { specialty: string; response: string }) => void;
  stage: string;
  processingStage?: string;
  showStatus?: boolean;
}

export function ConsultationProcess({
  consultations,
  specialtyStatuses,
  onConsultationClick,
  stage,
  showStatus = true,
}: ConsultationProcessProps) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-wrap gap-2">
        {specialtyStatuses.map((specialty, index) => (
          <button
            key={index}
            onClick={() => {
              const consultation = consultations.find(c => c.specialty === specialty.specialty);
              if (consultation) {
                onConsultationClick(consultation);
              }
            }}
            disabled={!consultations.find(c => c.specialty === specialty.specialty)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs sm:text-sm transition-colors",
              consultations.find(c => c.specialty === specialty.specialty)
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-default",
              specialty.status === 'consulting' && "animate-pulse"
            )}
          >
            <div className="flex items-center gap-1.5">
              {getSpecialtyIcon(specialty.specialty)}
              <span className="whitespace-nowrap">{specialty.specialty}</span>
            </div>
            {showStatus && (
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    specialty.status === 'pending' && "bg-gray-300",
                    specialty.status === 'consulting' && "bg-yellow-400",
                    specialty.status === 'completed' && "bg-green-400"
                  )}
                />
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {specialty.status === 'pending' && 'Pending'}
                  {specialty.status === 'consulting' && 'Consulting'}
                  {specialty.status === 'completed' && 'Completed'}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

