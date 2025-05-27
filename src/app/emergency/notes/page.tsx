"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle, Clock, User } from "lucide-react";

interface EmergencyNotesData {
  patientId: string;
  chiefComplaint: string;
  historyPresentIllness: string;
  examinationFindings: string;
  assessmentPlan: string;
}

const EmergencyNotesPage: React.FC = () => {
  const [formData, setFormData] = useState<EmergencyNotesData>({
    patientId: "",
    chiefComplaint: "",
    historyPresentIllness: "",
    examinationFindings: "",
    assessmentPlan: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Mock patient data
  const mockPatients = [
    { id: "P001", name: "John Smith", age: 45, mrn: "MRN-001" },
    { id: "P002", name: "Sarah Johnson", age: 32, mrn: "MRN-002" },
    { id: "P003", name: "Michael Brown", age: 67, mrn: "MRN-003" },
    { id: "P004", name: "Emily Davis", age: 28, mrn: "MRN-004" },
  ];

  const handleInputChange = (
    field: keyof EmergencyNotesData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving notes:", formData);
    setIsSaving(false);
  };

  const handleCompleteVisit = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Completing visit:", formData);
    setIsSaving(false);
    // In real app, would redirect to patient list or next patient
  };

  const selectedPatient = mockPatients.find((p) => p.id === formData.patientId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Emergency Visit Notes
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Dr. Emergency Physician</span>
            </div>
          </div>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleInputChange("patientId", value)}
              >
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (Age: {patient.age}) - {patient.mrn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-semibold text-blue-900">
                  {selectedPatient.name}
                </h3>
                <p className="text-sm text-blue-700">
                  Age: {selectedPatient.age} | MRN: {selectedPatient.mrn}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chief Complaint */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-700">
              Chief Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="chief-complaint">
                Primary reason for emergency visit
              </Label>
              <Textarea
                id="chief-complaint"
                placeholder="Enter the patient's main complaint or reason for seeking emergency care..."
                value={formData.chiefComplaint}
                onChange={(e) =>
                  handleInputChange("chiefComplaint", e.target.value)
                }
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* History of Present Illness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              History of Present Illness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="hpi">
                Detailed history and timeline of symptoms
              </Label>
              <Textarea
                id="hpi"
                placeholder="Describe the onset, duration, quality, severity, and associated symptoms..."
                value={formData.historyPresentIllness}
                onChange={(e) =>
                  handleInputChange("historyPresentIllness", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Examination Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Examination Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="examination">
                Physical examination results and vital signs
              </Label>
              <Textarea
                id="examination"
                placeholder="Document vital signs, general appearance, and system-specific findings..."
                value={formData.examinationFindings}
                onChange={(e) =>
                  handleInputChange("examinationFindings", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment and Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700">
              Assessment and Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="assessment-plan">
                Diagnosis, treatment plan, and disposition
              </Label>
              <Textarea
                id="assessment-plan"
                placeholder="Working diagnosis, differential diagnoses, treatment initiated, and next steps..."
                value={formData.assessmentPlan}
                onChange={(e) =>
                  handleInputChange("assessmentPlan", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleSaveAndContinue}
              disabled={isSaving || !formData.patientId}
              className="sm:w-auto w-full"
            >
              {isSaving ? "Saving..." : "Save and Continue"}
            </Button>
            <Button
              onClick={handleCompleteVisit}
              disabled={
                isSaving || !formData.patientId || !formData.chiefComplaint
              }
              className="sm:w-auto w-full bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Processing..." : "Complete Visit"}
            </Button>
          </div>

          {!formData.patientId && (
            <p className="text-sm text-gray-500 mt-2 text-center sm:text-right">
              Please select a patient to enable saving
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyNotesPage;
