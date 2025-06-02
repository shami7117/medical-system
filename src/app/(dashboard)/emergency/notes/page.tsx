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
import {
  AlertCircle,
  Clock,
  User,
  Upload,
  X,
  FileText,
  Plus,
  Minus,
} from "lucide-react";

interface EmergencyNotesData {
  patientId: string;
  chiefComplaint: string;
  historyPresentIllness: string;
  examinationFindings: string;
  assessmentPlan: string;
  disposition: string;
  isTraumaCase: boolean;
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

const EmergencyNotesPage: React.FC = () => {
  const [formData, setFormData] = useState<EmergencyNotesData>({
    patientId: "",
    chiefComplaint: "",
    historyPresentIllness: "",
    examinationFindings: "",
    assessmentPlan: "",
    disposition: "",
    isTraumaCase: false,
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
    { id: "P001", name: "John Smith", age: 45, mrn: "MRN-001" },
    { id: "P002", name: "Sarah Johnson", age: 32, mrn: "MRN-002" },
    { id: "P003", name: "Michael Brown", age: 67, mrn: "MRN-003" },
    { id: "P004", name: "Emily Davis", age: 28, mrn: "MRN-004" },
  ];

  const dispositionOptions = [
    { value: "discharge", label: "Discharge home" },
    { value: "admit", label: "Admit to ward" },
    { value: "transfer", label: "Transfer to operating theatre" },
  ];

  const handleInputChange = (
    field: keyof EmergencyNotesData,
    value: string | boolean
  ) => {
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
        author: "Dr. Emergency Physician",
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

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving notes:", {
      ...formData,
      progressNotes,
      attachedFiles,
      problems,
    });
    setIsSaving(false);
  };

  const handleCompleteVisit = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Completing visit:", {
      ...formData,
      progressNotes,
      attachedFiles,
      problems,
    });
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
          <CardContent className="space-y-4">
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

            {/* Trauma Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trauma-case"
                checked={formData.isTraumaCase}
                onChange={(e) =>
                  handleInputChange("isTraumaCase", e.target.checked)
                }
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label
                htmlFor="trauma-case"
                className="text-sm font-medium text-red-700"
              >
                Was this a trauma case?
              </Label>
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

        {/* Disposition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Disposition (for audit purposes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="disposition">Patient Disposition</Label>
              <Select
                value={formData.disposition}
                onValueChange={(value) =>
                  handleInputChange("disposition", value)
                }
              >
                <SelectTrigger id="disposition">
                  <SelectValue placeholder="Select disposition..." />
                </SelectTrigger>
                <SelectContent>
                  {dispositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.disposition === "admit" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Patient to be admitted to ward - ensure bed availability
                    and handover documentation.
                  </p>
                </div>
              )}
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
              onClick={handleSaveAndContinue}
              disabled={isSaving || !formData.patientId}
              className="sm:w-auto w-full"
            >
              {isSaving ? "Saving..." : "Save and Continue"}
            </Button>
            <Button
              onClick={handleCompleteVisit}
              disabled={
                isSaving ||
                !formData.patientId ||
                !formData.chiefComplaint ||
                !formData.disposition
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
          {formData.patientId && !formData.disposition && (
            <p className="text-sm text-orange-600 mt-2 text-center sm:text-right">
              Please select a disposition to complete the visit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyNotesPage;
