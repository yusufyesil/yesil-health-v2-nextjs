import { motion } from "framer-motion";
import { getSpecialtyIcon } from "@/lib/specialtyIcons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Consultation {
  specialty: string;
  response: string;
}

interface ConsultationProcessProps {
  consultations: Consultation[];
  consultingSpecialties: Set<string>;
  onConsultationClick: (consultation: Consultation) => void;
  stage: string;
}

export function ConsultationProcess({
  consultations,
  consultingSpecialties,
  onConsultationClick,
  stage,
}: ConsultationProcessProps) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{stage || "Yesil AI thinking on your question"}</h3>
      {consultations && consultations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {consultations.map((consultation, i) => (
            <Button
              key={i}
              onClick={() => onConsultationClick(consultation)}
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-1 text-left justify-start text-xs",
                consultingSpecialties.has(consultation.specialty)
                  ? "cursor-wait"
                  : "hover:bg-transparent hover:underline"
              )}
            >
              <span className="flex items-center">
                {getSpecialtyIcon(consultation.specialty)}
                <span className="ml-1">{consultation.specialty}</span>
                <span className="ml-1">
                  {consultingSpecialties.has(consultation.specialty) ? "⌛" : "✅"}
                </span>
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Analyzing your query...</p>
      )}
    </div>
  );
}

