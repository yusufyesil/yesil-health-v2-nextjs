import { motion } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ConsultationProcessProps {
  consultations: Array<{ specialty: string; response: string }>;
  specialtyStatuses: Array<{ specialty: string; status: 'pending' | 'consulting' | 'completed' }>;
  onConsultationClick: (consultation: { specialty: string; response: string }) => void;
  stage: string;
  processingStage?: string;
}

export function ConsultationProcess({
  consultations,
  specialtyStatuses,
  onConsultationClick,
  stage,
  processingStage
}: ConsultationProcessProps) {
  return (
    <div className="space-y-2 mb-3">
      {/* Processing Stage Indicator */}
      <div className="text-sm text-gray-500 mb-2">
        {processingStage || stage}
      </div>

      {/* Specialties Progress */}
      <div className="flex flex-wrap gap-2">
        {specialtyStatuses.map(({ specialty, status }) => (
          <motion.button
            key={specialty}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              const consultation = consultations.find(c => c.specialty === specialty);
              if (consultation) {
                onConsultationClick(consultation);
              }
            }}
            disabled={status === 'pending'}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
              {
                'bg-gray-100 text-gray-500': status === 'pending',
                'bg-orange-100 text-orange-700 animate-pulse': status === 'consulting',
                'bg-gray-900 text-white hover:bg-gray-800': status === 'completed',
                'cursor-pointer': status === 'completed',
                'cursor-not-allowed': status === 'pending'
              }
            )}
          >
            {getSpecialtyIcon(specialty)}
            <span>{specialty}</span>
            {status === 'consulting' && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {status === 'completed' && (
              <span className="w-3 h-3 rounded-full bg-green-500 ml-1" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

