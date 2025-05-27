"use client";

import React, { useState, useEffect } from "react";
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
import { Stethoscope, Clock, User, FileText } from "lucide-react";
import { useParams } from "next/navigation"; // For getting dynamic route params

interface SOAPNotesData {
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const ClinicNotesPage: React.FC = () => {
  const params = useParams();
  const specialty = (params.specialty as string) || "general-medicine"; // Get specialty from URL params

  const [formData, setFormData] = useState<SOAPNotesData>({
    patientId: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Mock patient data
  const mockPatients = [
    {
      id: "P001",
      name: "Alice Cooper",
      age: 58,
      mrn: "MRN-001",
      nextAppt: "2024-06-15",
    },
    {
      id: "P002",
      name: "Robert Wilson",
      age: 45,
      mrn: "MRN-002",
      nextAppt: "2024-06-20",
    },
    {
      id: "P003",
      name: "Maria Garcia",
      age: 62,
      mrn: "MRN-003",
      nextAppt: "2024-06-25",
    },
    {
      id: "P004",
      name: "David Chen",
      age: 39,
      mrn: "MRN-004",
      nextAppt: "2024-07-01",
    },
  ];

  // Specialty configurations - updated with more specialties
  const specialtyConfig: Record<
    string,
    {
      name: string;
      color: string;
      icon: string;
      placeholders: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
      };
    }
  > = {
    "general-medicine": {
      name: "General Medicine",
      color: "text-blue-700",
      icon: "🩺",
      placeholders: {
        subjective:
          "Document patient's chief complaint, history of present illness, review of systems...",
        objective:
          "Record vital signs, physical examination findings, relevant test results...",
        assessment:
          "Clinical impression, differential diagnosis, and working diagnosis...",
        plan: "Treatment plan, medications, follow-up appointments, patient education...",
      },
    },
    "general-surgery": {
      name: "General Surgery",
      color: "text-green-700",
      icon: "✂️",
      placeholders: {
        subjective:
          "Document surgical history, current symptoms, pain level, functional status...",
        objective:
          "Surgical site examination, wound assessment, vital signs, imaging results...",
        assessment:
          "Surgical diagnosis, post-operative status, complications assessment...",
        plan: "Surgical planning, post-operative care, wound management, follow-up...",
      },
    },
    paediatrics: {
      name: "Paediatrics",
      color: "text-pink-700",
      icon: "👶",
      placeholders: {
        subjective:
          "Document developmental milestones, feeding patterns, behavioral concerns, parental observations...",
        objective:
          "Growth parameters, developmental assessment, physical examination findings...",
        assessment:
          "Pediatric diagnosis, growth assessment, developmental status...",
        plan: "Immunizations, nutrition counseling, developmental support, family education...",
      },
    },
    obstetrics: {
      name: "Obstetrics",
      color: "text-purple-700",
      icon: "🤱",
      placeholders: {
        subjective:
          "Document gestational age, fetal movements, contractions, pregnancy symptoms...",
        objective:
          "Fundal height, fetal heart rate, blood pressure, weight gain, lab results...",
        assessment:
          "Gestational assessment, maternal-fetal status, risk factors...",
        plan: "Prenatal care plan, delivery planning, monitoring schedule, education...",
      },
    },
    gynaecology: {
      name: "Gynaecology",
      color: "text-rose-700",
      icon: "🌸",
      placeholders: {
        subjective:
          "Document menstrual history, pelvic pain, discharge, reproductive concerns...",
        objective:
          "Pelvic examination, breast examination, vital signs, lab results...",
        assessment: "Gynecological diagnosis, reproductive health status...",
        plan: "Treatment options, contraceptive counseling, screening schedules, referrals...",
      },
    },
    dermatology: {
      name: "Dermatology",
      color: "text-orange-700",
      icon: "🎨",
      placeholders: {
        subjective:
          "Document skin concerns, rash duration, itching, previous treatments tried...",
        objective:
          "Skin examination, lesion characteristics, distribution pattern, photography...",
        assessment:
          "Dermatological diagnosis, lesion classification, severity assessment...",
        plan: "Topical treatments, systemic medications, follow-up, skin care education...",
      },
    },
    ent: {
      name: "ENT (Ear, Nose & Throat)",
      color: "text-teal-700",
      icon: "👂",
      placeholders: {
        subjective:
          "Document hearing changes, throat pain, nasal congestion, balance issues...",
        objective:
          "Otoscopic examination, nasal endoscopy, throat examination, hearing tests...",
        assessment: "ENT diagnosis, hearing assessment, airway evaluation...",
        plan: "Medical management, surgical options, hearing aids, speech therapy referral...",
      },
    },
    ophthalmology: {
      name: "Ophthalmology",
      color: "text-indigo-700",
      icon: "👁️",
      placeholders: {
        subjective:
          "Document vision changes, eye pain, flashing lights, visual field defects...",
        objective:
          "Visual acuity, pupil examination, fundoscopy, intraocular pressure...",
        assessment: "Ophthalmologic diagnosis, visual function assessment...",
        plan: "Corrective lenses, medical treatment, surgical intervention, follow-up care...",
      },
    },
    cardiology: {
      name: "Cardiology",
      color: "text-red-700",
      icon: "🫀",
      placeholders: {
        subjective:
          "Document chest pain, shortness of breath, palpitations, exercise tolerance...",
        objective:
          "Vital signs, heart rate, blood pressure, cardiac examination, ECG results...",
        assessment:
          "Cardiac diagnosis, risk stratification, functional status...",
        plan: "Cardiac medications, lifestyle modifications, procedure planning, monitoring...",
      },
    },
    orthopaedics: {
      name: "Orthopaedics",
      color: "text-blue-700",
      icon: "🦴",
      placeholders: {
        subjective:
          "Document pain location, mechanism of injury, functional limitations, previous treatments...",
        objective:
          "Range of motion, strength testing, special tests, imaging findings...",
        assessment:
          "Orthopedic diagnosis, functional impairment, treatment response...",
        plan: "Physical therapy, bracing, medications, surgical considerations...",
      },
    },
    radiology: {
      name: "Radiology",
      color: "text-gray-700",
      icon: "📡",
      placeholders: {
        subjective:
          "Document indication for imaging, relevant clinical history, previous studies...",
        objective:
          "Imaging findings, technical quality, comparison studies, measurements...",
        assessment:
          "Radiological diagnosis, significance of findings, recommendations...",
        plan: "Additional imaging, clinical correlation, follow-up studies, communication...",
      },
    },
    psychiatry: {
      name: "Psychiatry",
      color: "text-purple-700",
      icon: "🧠",
      placeholders: {
        subjective:
          "Document mood, thought patterns, sleep, appetite, social functioning...",
        objective:
          "Mental status examination, appearance, behavior, cognitive assessment...",
        assessment:
          "Psychiatric diagnosis, risk assessment, functional impairment...",
        plan: "Psychotherapy, medications, safety planning, support services...",
      },
    },
    pathology: {
      name: "Pathology",
      color: "text-yellow-700",
      icon: "🧪",
      placeholders: {
        subjective:
          "Document specimen source, clinical indication, relevant history...",
        objective:
          "Gross description, microscopic findings, special stains, molecular studies...",
        assessment: "Pathological diagnosis, staging, prognostic factors...",
        plan: "Additional studies, clinical correlation, follow-up recommendations...",
      },
    },
  };

  const currentSpecialty =
    specialtyConfig[specialty] || specialtyConfig["general-medicine"];

  const handleInputChange = (field: keyof SOAPNotesData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving SOAP note:", { specialty, ...formData });
    setIsSaving(false);
  };

  const handleCompleteVisit = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Completing visit:", { specialty, ...formData });
    setIsSaving(false);
    // In real app, would redirect to schedule or patient list
  };

  const selectedPatient = mockPatients.find((p) => p.id === formData.patientId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className={`h-6 w-6 ${currentSpecialty.color}`} />
            <span className="text-2xl mr-2">{currentSpecialty.icon}</span>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentSpecialty.name} Clinic Notes
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Dr. {currentSpecialty.name} Specialist</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>SOAP Format</span>
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
                  Age: {selectedPatient.age} | MRN: {selectedPatient.mrn} | Next
                  Appointment: {selectedPatient.nextAppt}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleSaveNote}
              disabled={isSaving || !formData.patientId}
              className="sm:w-auto w-full"
            >
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
            <Button
              onClick={handleCompleteVisit}
              disabled={isSaving || !formData.patientId || !formData.subjective}
              className="sm:w-auto w-full bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Processing..." : "Complete Visit"}
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>SOAP Format Guide:</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Subjective:</strong> Patient's own words
                </div>
                <div>
                  <strong>Objective:</strong> Measurable findings
                </div>
                <div>
                  <strong>Assessment:</strong> Your clinical judgment
                </div>
                <div>
                  <strong>Plan:</strong> Treatment and follow-up
                </div>
              </div>
            </div>
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

export default ClinicNotesPage;
