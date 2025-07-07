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
import {
  Stethoscope,
  Clock,
  User,
  FileText,
  Upload,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useParams } from "next/navigation";
interface SOAPNotesData {
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ProgressNote {
  id: string;
  timestamp: Date;
  note: string;
  author: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface Problem {
  id: string;
  description: string;
  dateAdded: Date;
  isResolved: boolean;
  resolvedDate?: Date;
}

const ClinicNotesPage: React.FC = () => {
  // Mock getting specialty from URL params
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
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [newProblem, setNewProblem] = useState("");
  const [showProgressNotes, setShowProgressNotes] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newFile: AttachedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      });
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const addProgressNote = () => {
    if (newProgressNote.trim()) {
      const note: ProgressNote = {
        id: Date.now().toString(),
        timestamp: new Date(),
        note: newProgressNote,
        author: `Dr. ${currentSpecialty.name} Specialist`,
      };
      setProgressNotes((prev) => [...prev, note]);
      setNewProgressNote("");
    }
  };

  const addProblem = () => {
    if (newProblem.trim()) {
      const problem: Problem = {
        id: Date.now().toString(),
        description: newProblem,
        dateAdded: new Date(),
        isResolved: false,
      };
      setProblems((prev) => [...prev, problem]);
      setNewProblem("");
    }
  };

  const toggleProblemResolved = (problemId: string) => {
    setProblems((prev) =>
      prev.map((problem) =>
        problem.id === problemId
          ? {
              ...problem,
              isResolved: !problem.isResolved,
              resolvedDate: !problem.isResolved ? new Date() : undefined,
            }
          : problem
      )
    );
  };

  const removeProblem = (problemId: string) => {
    setProblems((prev) => prev.filter((problem) => problem.id !== problemId));
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving SOAP note:", {
      specialty,
      ...formData,
      progressNotes,
      attachedFiles,
      problems,
    });
    setIsSaving(false);
  };

  const handleCompleteVisit = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // console.log("Completing visit:", {
    //   specialty,
    //   ...formData,
    //   progressNotes,
    //   attachedFiles,
    //   problems,
    // });
    setIsSaving(false);
  };

  const selectedPatient = mockPatients.find((p) => p.id === formData.patientId);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

        {/* SOAP Notes */}
        <Card>
          <CardHeader>
            <CardTitle className={`text-lg ${currentSpecialty.color}`}>
              Subjective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="subjective">
                Patient's own words and reported symptoms
              </Label>
              <Textarea
                id="subjective"
                placeholder={currentSpecialty.placeholders.subjective}
                value={formData.subjective}
                onChange={(e) =>
                  handleInputChange("subjective", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="objective">
                Measurable findings and observations
              </Label>
              <Textarea
                id="objective"
                placeholder={currentSpecialty.placeholders.objective}
                value={formData.objective}
                onChange={(e) => handleInputChange("objective", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-700">
              Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="assessment">
                Clinical judgment and diagnosis
              </Label>
              <Textarea
                id="assessment"
                placeholder={currentSpecialty.placeholders.assessment}
                value={formData.assessment}
                onChange={(e) =>
                  handleInputChange("assessment", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-700">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="plan">Treatment plan and follow-up</Label>
              <Textarea
                id="plan"
                placeholder={currentSpecialty.placeholders.plan}
                value={formData.plan}
                onChange={(e) => handleInputChange("plan", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Problem List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Problem List</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProblemList(!showProblemList)}
              >
                {showProblemList ? "Hide" : "Show"} Problems
              </Button>
            </div>
          </CardHeader>
          {showProblemList && (
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="Add new problem/diagnosis..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={addProblem} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {problems.length > 0 && (
                <div className="space-y-2">
                  {problems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        problem.isResolved
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex-1">
                        <p
                          className={`${
                            problem.isResolved
                              ? "line-through text-gray-500"
                              : ""
                          }`}
                        >
                          {problem.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added: {problem.dateAdded.toLocaleDateString()}
                          {problem.resolvedDate &&
                            ` | Resolved: ${problem.resolvedDate.toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProblemResolved(problem.id)}
                        >
                          {problem.isResolved ? "Reopen" : "Resolve"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeProblem(problem.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attach Files to Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">
                Attach supporting documents (PDF, JPG, PNG)
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached Files:</p>
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} |{" "}
                          {file.uploadedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress Notes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProgressNotes(!showProgressNotes)}
              >
                {showProgressNotes ? "Hide" : "Show"} Progress Notes
              </Button>
            </div>
          </CardHeader>
          {showProgressNotes && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress-note">Add Progress Note</Label>
                <Textarea
                  id="progress-note"
                  placeholder="Enter follow-up observations, treatment updates, or additional notes..."
                  value={newProgressNote}
                  onChange={(e) => setNewProgressNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={addProgressNote}
                  disabled={!newProgressNote.trim()}
                  size="sm"
                >
                  Add Progress Note
                </Button>
              </div>

              {progressNotes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Previous Progress Notes:
                  </p>
                  {progressNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-blue-50 p-4 rounded-md border border-blue-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          {note.author}
                        </span>
                        <span className="text-xs text-blue-700">
                          {note.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
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
