"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  User,
  FileText,
  Pill,
  AlertTriangle,
  Users,
  Coffee,
  Calendar,
} from "lucide-react";

// Mock data - in production, this would come from your API
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  hospitalId: string;
  specialty: string;
}

interface MedicalHistory {
  patientId: string;
  previousDiagnoses: string;
  currentMedications: string;
  allergies: string;
  familyHistory: string;
  socialHistory: string;
  lastUpdated: string;
}

// Mock hospital context
const CURRENT_HOSPITAL_ID = "hospital_123";

// Mock patients data (filtered by hospital and specialty)
const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "John Smith",
    age: 45,
    gender: "Male",
    hospitalId: "hospital_123",
    specialty: "cardiology",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    age: 38,
    gender: "Female",
    hospitalId: "hospital_123",
    specialty: "cardiology",
  },
  {
    id: "3",
    name: "Michael Brown",
    age: 52,
    gender: "Male",
    hospitalId: "hospital_123",
    specialty: "cardiology",
  },
  {
    id: "4",
    name: "Emily Davis",
    age: 29,
    gender: "Female",
    hospitalId: "hospital_123",
    specialty: "orthopaedics",
  },
  {
    id: "5",
    name: "Robert Wilson",
    age: 65,
    gender: "Male",
    hospitalId: "hospital_123",
    specialty: "orthopaedics",
  },
];

const SPECIALTY_NAMES: { [key: string]: string } = {
  cardiology: "Cardiology",
  orthopaedics: "Orthopaedics",
  dermatology: "Dermatology",
  "general-surgery": "General Surgery",
  ophthalmology: "Ophthalmology",
  pediatrics: "Pediatrics",
  neurology: "Neurology",
  "internal-medicine": "Internal Medicine",
};

export default function ClinicHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const specialty = params?.specialty as string;
  const specialtyName = SPECIALTY_NAMES[specialty] || specialty;

  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    patientId: "",
    previousDiagnoses: "",
    currentMedications: "",
    allergies: "",
    familyHistory: "",
    socialHistory: "",
    lastUpdated: "",
  });

  // Filter patients by hospital and specialty
  const availablePatients = MOCK_PATIENTS.filter(
    (patient) =>
      patient.hospitalId === CURRENT_HOSPITAL_ID &&
      patient.specialty === specialty
  );

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    // In production, load existing medical history for this patient
    setMedicalHistory({
      patientId,
      previousDiagnoses: "",
      currentMedications: "",
      allergies: "",
      familyHistory: "",
      socialHistory: "",
      lastUpdated: "",
    });
  };

  const handleInputChange = (field: keyof MedicalHistory, value: string) => {
    setMedicalHistory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    // In production, save to API
    const updatedHistory = {
      ...medicalHistory,
      patientId: selectedPatient,
      lastUpdated: new Date().toISOString(),
    };

    console.log("Saving medical history:", updatedHistory);
    alert("Medical history saved successfully!");
  };

  const selectedPatientInfo = availablePatients.find(
    (p) => p.id === selectedPatient
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/clinic")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clinic
          </Button>
          <Badge variant="secondary">{specialtyName}</Badge>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Past Medical History
        </h1>
        <p className="text-gray-600 mt-1">
          Document structured medical history for {specialtyName.toLowerCase()}{" "}
          patients
        </p>

        <div className="text-xs text-gray-400 mt-2">
          Hospital ID: {CURRENT_HOSPITAL_ID}
        </div>
      </div>

      {/* Patient Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Selection
          </CardTitle>
          <CardDescription>
            Select a patient from {specialtyName} to document their medical
            history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-select">Patient</Label>
              <Select
                value={selectedPatient}
                onValueChange={handlePatientSelect}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.age}y, {patient.gender})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatientInfo && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {selectedPatientInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPatientInfo.age} years old •{" "}
                    {selectedPatientInfo.gender} • {specialtyName}
                  </p>
                </div>
                {medicalHistory.lastUpdated && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last updated:{" "}
                    {new Date(medicalHistory.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical History Sections */}
      {selectedPatient && (
        <div className="space-y-6">
          <Accordion
            type="multiple"
            defaultValue={[
              "diagnoses",
              "medications",
              "allergies",
              "family",
              "social",
            ]}
            className="space-y-4"
          >
            {/* Previous Diagnoses and Surgeries */}
            <AccordionItem value="diagnoses">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <h3 className="font-semibold">
                        Previous Diagnoses and Surgeries
                      </h3>
                      <p className="text-sm text-gray-600">
                        Past medical conditions and surgical procedures
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="Enter previous diagnoses, medical conditions, and surgical procedures..."
                      value={medicalHistory.previousDiagnoses}
                      onChange={(e) =>
                        handleInputChange("previousDiagnoses", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Current Medications */}
            <AccordionItem value="medications">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <h3 className="font-semibold">Current Medications</h3>
                      <p className="text-sm text-gray-600">
                        Active medications, dosages, and frequency
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="List current medications with dosages and frequencies..."
                      value={medicalHistory.currentMedications}
                      onChange={(e) =>
                        handleInputChange("currentMedications", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Allergies */}
            <AccordionItem value="allergies">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="text-left">
                      <h3 className="font-semibold">Allergies</h3>
                      <p className="text-sm text-gray-600">
                        Drug allergies, environmental sensitivities
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="Document known allergies, reactions, and severity..."
                      value={medicalHistory.allergies}
                      onChange={(e) =>
                        handleInputChange("allergies", e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Family History */}
            <AccordionItem value="family">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <h3 className="font-semibold">Family History</h3>
                      <p className="text-sm text-gray-600">
                        Hereditary conditions and family medical history
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="Record family medical history and hereditary conditions..."
                      value={medicalHistory.familyHistory}
                      onChange={(e) =>
                        handleInputChange("familyHistory", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Social History */}
            <AccordionItem value="social">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <div className="text-left">
                      <h3 className="font-semibold">Social History</h3>
                      <p className="text-sm text-gray-600">
                        Lifestyle factors, occupation, habits
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="Document smoking, alcohol use, occupation, exercise habits, etc..."
                      value={medicalHistory.socialHistory}
                      onChange={(e) =>
                        handleInputChange("socialHistory", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 px-8"
              size="lg"
            >
              <Save className="h-4 w-4" />
              Save Medical History
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedPatient && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Patient Selected
            </h3>
            <p className="text-gray-600">
              Please select a patient from the dropdown above to begin
              documenting their medical history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
