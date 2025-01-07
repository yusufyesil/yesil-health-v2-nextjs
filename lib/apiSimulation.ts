import { VALID_SPECIALTIES } from "@/lib/constants";

interface Consultation {
  specialty: string;
  response: string;
}

interface APIResponse {
  final_consultation: string;
  specialty_responses: Consultation[];
}

function getRandomSpecialties(count: number): string[] {
  const shuffled = [...VALID_SPECIALTIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSpecialtyResponse(specialty: string, userMessage: string): string {
  const responses = [
    `Based on your symptoms, our ${specialty} department recommends further investigation.`,
    `From a ${specialty} perspective, your condition might be related to...`,
    `The ${specialty} team suggests the following course of action...`,
    `Our ${specialty} specialists have analyzed your case and recommend...`,
    `Considering your symptoms, the ${specialty} department advises...`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function simulateAPIResponse(userMessage: string, onUpdate: (update: { specialty_responses: Consultation[] }) => void): Promise<APIResponse> {
  const specialties = getRandomSpecialties(Math.floor(Math.random() * 3) + 3);
  const specialty_responses: Consultation[] = [];

  for (const specialty of specialties) {
    // Simulate network latency for each specialty
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const response = generateSpecialtyResponse(specialty, userMessage);
    specialty_responses.push({ specialty, response });

    // Call the onUpdate callback with the current state of specialty_responses
    onUpdate({ specialty_responses: [...specialty_responses] });
  }

  const final_consultation = `Thank you for using our Virtual Hospital. Based on your symptoms, we've consulted with ${specialties.length} departments. Here's a summary of their findings:

${specialty_responses.map(sr => `- ${sr.specialty}: ${sr.response}`).join('\n')}

Please note that this is a preliminary assessment. We strongly recommend following up with your primary care physician for a comprehensive evaluation. If you experience any severe symptoms, please seek immediate medical attention.`;

  return {
    final_consultation,
    specialty_responses
  };
}

