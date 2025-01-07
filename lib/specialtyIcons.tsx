import { Activity, AlertCircle, BugIcon as Bacteria, Brain, Dna, Eye, AmbulanceIcon as FirstAid, Heart, TreesIcon as Lungs, Pill, Stethoscope, Syringe, Thermometer, Microscope, Droplet, Ear, SmileIcon as Tooth, Sun, Zap, Clipboard, Scale, Bed, Briefcase, BookOpen, Users, Building, WormIcon as Virus, TestTube, Smile, Baby, Scissors, Leaf, Feather, Moon, Smartphone, Coffee, Umbrella } from 'lucide-react';

export function getSpecialtyIcon(specialty: string) {
  const iconProps = { className: "h-5 w-5" };
  
  switch (specialty) {
    case "Pathology": return <Microscope {...iconProps} />;
    case "Hematology": return <Droplet {...iconProps} />;
    case "Allergy Immunology": return <AlertCircle {...iconProps} />;
    case "Audiology": return <Ear {...iconProps} />;
    case "Cardiology": return <Heart {...iconProps} />;
    case "Critical Care": return <Activity {...iconProps} />;
    case "Dentistry": return <Tooth {...iconProps} />;
    case "Dermatology": return <Sun {...iconProps} />;
    case "Elderly Care": return <Umbrella {...iconProps} />;
    case "Emergency": return <Zap {...iconProps} />;
    case "Endocrinology": return <Activity {...iconProps} />;
    case "Epidemiology": return <Users {...iconProps} />;
    case "Ethics": return <Scale {...iconProps} />;
    case "Fitness Sports": return <Activity {...iconProps} />;
    case "Gastroenterology": return <Thermometer {...iconProps} />;
    case "General Surgery": return <Scissors {...iconProps} />;
    case "Genetics": return <Dna {...iconProps} />;
    case "Head Neck Surgery": return <Scissors {...iconProps} />;
    case "Health AI": return <Brain {...iconProps} />;
    case "Health Economics": return <Briefcase {...iconProps} />;
    case "Health Education": return <BookOpen {...iconProps} />;
    case "Health Entrepreneurship": return <Briefcase {...iconProps} />;
    case "Hospital Management": return <Building {...iconProps} />;
    case "Infectious Diseases": return <Virus {...iconProps} />;
    case "Internal Medicine": return <Clipboard {...iconProps} />;
    case "Lab Medicine": return <TestTube {...iconProps} />;
    case "Mental Health": return <Brain {...iconProps} />;
    case "Neurology": return <Brain {...iconProps} />;
    case "Neuroscience": return <Brain {...iconProps} />;
    case "Nutrition": return <Leaf {...iconProps} />;
    case "Obstetrics Gynecology": return <Baby {...iconProps} />;
    case "Oncology": return <Thermometer {...iconProps} />;
    case "Ophthalmology": return <Eye {...iconProps} />;
    case "Orthopedics": return <Activity {...iconProps} />;
    case "Palliative Care": return <Feather {...iconProps} />;
    case "Pediatric Surgery": return <Scissors {...iconProps} />;
    case "Pediatrics": return <Baby {...iconProps} />;
    case "Pharmacy": return <Pill {...iconProps} />;
    case "Physical Medicine and Rehabilitation": return <Activity {...iconProps} />;
    case "Preventive Medicine": return <Umbrella {...iconProps} />;
    case "Psychiatry": return <Brain {...iconProps} />;
    case "Public Health": return <Users {...iconProps} />;
    case "Pulmonology": return <Lungs {...iconProps} />;
    case "Radiology": return <Eye {...iconProps} />;
    case "Rare Diseases": return <Dna {...iconProps} />;
    case "Rheumatology": return <Thermometer {...iconProps} />;
    case "Sleep": return <Moon {...iconProps} />;
    case "Social Media Addiction": return <Smartphone {...iconProps} />;
    case "Supplements": return <Pill {...iconProps} />;
    case "Vaccination": return <Syringe {...iconProps} />;
    case "Wearables": return <Smartphone {...iconProps} />;
    case "Wellbeing": return <Smile {...iconProps} />;
    case "Work Health": return <Briefcase {...iconProps} />;
    default: return <Stethoscope {...iconProps} />;
  }
}

