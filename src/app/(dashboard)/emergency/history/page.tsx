"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Save,
  AlertCircle,
  Heart,
  Pill,
  ShieldAlert,
  Users,
  Coffee,
} from "lucide-react";

// Mock data - replace with actual API calls
const mockPatients = [
  { id: "1", name: "John Doe", mrn: "MRN001", age: 45, gender: "Male" },
  { id: "2", name: "Jane Smith", mrn: "MRN002", age: 32, gender: "Female" },
  { id: "3", name: "Robert Johnson", mrn: "MRN003", age: 67, gender: "Male" },
];

interface MedicalHistory {
  previousDiagnoses: string;
  surgicalHistory: string;
  currentMedications: string;
  allergies: string;
  familyHistory: string;
  socialHistory: string;
}

export default function EmergencyHistoryPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    previousDiagnoses: "",
    surgicalHistory: "",
    currentMedications: "",
    allergies: "",
    familyHistory: "",
    socialHistory: "",
  });

  // Mock hospital info - replace with actual auth data
  const hospitalName = "St. Mary's General Hospital";
  const hospitalId = "hospital_123";

  const selectedPatientData = mockPatients.find(
    (p) => p.id === selectedPatient
  );

  const handleInputChange = (field: keyof MedicalHistory, value: string) => {
    setMedicalHistory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      alert("Medical history saved successfully!");
      setIsSaving(false);
    }, 1000);
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId);

    // In production, fetch existing medical history for this patient
    // For now, simulate loading existing data for patient ID 1
    if (patientId === "1") {
      setMedicalHistory({
        previousDiagnoses: "Hypertension (2018), Type 2 Diabetes (2020)",
        surgicalHistory: "Appendectomy (2015), Knee arthroscopy (2019)",
        currentMedications:
          "Metformin 500mg BID, Lisinopril 10mg daily, Atorvastatin 20mg daily",
        allergies: "Penicillin (rash), Shellfish (anaphylaxis)",
        familyHistory: "Father: CAD, Mother: Breast cancer, Diabetes in family",
        socialHistory:
          "Former smoker (quit 5 years ago), Occasional alcohol use, Office worker",
      });
    } else {
      // Clear form for other patients
      setMedicalHistory({
        previousDiagnoses: "",
        surgicalHistory: "",
        currentMedications: "",
        allergies: "",
        familyHistory: "",
        socialHistory: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Past Medical History
              </h1>
              <p className="text-gray-600 mt-1">
                {hospitalName} - Emergency Department
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              Hospital ID: {hospitalId}
            </Badge>
          </div>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Selection
            </CardTitle>
            <CardDescription>
              Select a patient to view or update their medical history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-select">Patient</Label>
                <Select
                  value={selectedPatient}
                  onValueChange={handlePatientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatientData && (
                <div className="flex items-center space-x-4 pt-6">
                  <Badge variant="secondary">
                    Age: {selectedPatientData.age}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedPatientData.gender}
                  </Badge>
                  <Badge variant="secondary">
                    MRN: {selectedPatientData.mrn}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical History Form */}
        {selectedPatient ? (
          <div className="space-y-6">
            <Accordion
              type="multiple"
              defaultValue={["diagnoses", "medications", "allergies"]}
              className="space-y-4"
            >
              {/* Previous Diagnoses & Surgeries */}
              <AccordionItem value="diagnoses">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Heart className="h-5 w-5 text-red-500" />
                      Previous Diagnoses & Surgeries
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="diagnoses">Previous Diagnoses</Label>
                          <Textarea
                            id="diagnoses"
                            placeholder="List previous medical diagnoses with dates..."
                            value={medicalHistory.previousDiagnoses}
                            onChange={(e) =>
                              handleInputChange(
                                "previousDiagnoses",
                                e.target.value
                              )
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="surgeries">Surgical History</Label>
                          <Textarea
                            id="surgeries"
                            placeholder="List previous surgeries with dates and details..."
                            value={medicalHistory.surgicalHistory}
                            onChange={(e) =>
                              handleInputChange(
                                "surgicalHistory",
                                e.target.value
                              )
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Current Medications */}
              <AccordionItem value="medications">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Pill className="h-5 w-5 text-blue-500" />
                      Current Medications
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="medications">Current Medications</Label>
                        <Textarea
                          id="medications"
                          placeholder="List current medications, dosages, and frequency..."
                          value={medicalHistory.currentMedications}
                          onChange={(e) =>
                            handleInputChange(
                              "currentMedications",
                              e.target.value
                            )
                          }
                          rows={4}
                        />
                        <p className="text-sm text-gray-500">
                          Include medication name, dosage, frequency, and route
                          of administration
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Allergies */}
              <AccordionItem value="allergies">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <ShieldAlert className="h-5 w-5 text-orange-500" />
                      Allergies
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Known Allergies</Label>
                        <Textarea
                          id="allergies"
                          placeholder="List known allergies and reactions..."
                          value={medicalHistory.allergies}
                          onChange={(e) =>
                            handleInputChange("allergies", e.target.value)
                          }
                          rows={3}
                        />
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠️ Critical: Include specific reactions and severity
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Family History */}
              <AccordionItem value="family">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Users className="h-5 w-5 text-green-500" />
                      Family History
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="family-history">
                          Family Medical History
                        </Label>
                        <Textarea
                          id="family-history"
                          placeholder="List significant family medical history (parents, siblings, grandparents)..."
                          value={medicalHistory.familyHistory}
                          onChange={(e) =>
                            handleInputChange("familyHistory", e.target.value)
                          }
                          rows={3}
                        />
                        <p className="text-sm text-gray-500">
                          Include major conditions, age of onset, and
                          relationship to patient
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Social History */}
              <AccordionItem value="social">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Coffee className="h-5 w-5 text-purple-500" />
                      Social History
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="social-history">Social History</Label>
                        <Textarea
                          id="social-history"
                          placeholder="Include smoking, alcohol use, drug use, occupation, living situation..."
                          value={medicalHistory.socialHistory}
                          onChange={(e) =>
                            handleInputChange("socialHistory", e.target.value)
                          }
                          rows={4}
                        />
                        <p className="text-sm text-gray-500">
                          Include smoking status, alcohol/substance use,
                          occupation, exercise, diet
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Changes are saved automatically to the patient's record
                    </span>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Medical History
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Patient
                </h3>
                <p className="text-gray-500">
                  Choose a patient from the dropdown above to view or update
                  their medical history.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
