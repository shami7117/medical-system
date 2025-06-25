"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Heart,
  Activity,
  Scale,
  Ruler,
  AlertTriangle,
  Thermometer,
} from "lucide-react";

interface EmergencyNotesData {
  patientId: string;
  name?: string;
  age?: string;
  mrn?: string;
  chiefComplaint: string;
  historyPresentIllness: string;
  examinationFindings: string;
  assessmentPlan: string;
  disposition: string;
  isTraumaCase: boolean;
  sex?: string;
  dob?: string;
  religion?: string;
  maritalStatus?: string;
  address?: string;
  contact?: string;
  email?: string;
  nextOfKin?: string;
  nokContact?: string;
  allergies?: string;
}

interface VitalSigns {
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  painScore: string;
  weight: string;
  height: string;
  bmi: string;
  consciousness: string;
  timestamp: Date;
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
    name: "",
    age: "",
    mrn: "",
    chiefComplaint: "",
    historyPresentIllness: "",
    examinationFindings: "",
    assessmentPlan: "",
    disposition: "",
    isTraumaCase: false,
    sex: "",
    dob: "",
    religion: "",
    maritalStatus: "",
    address: "",
    contact: "",
    email: "",
    nextOfKin: "",
    nokContact: "",
    allergies: "",
  });

  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    painScore: "",
    weight: "",
    height: "",
    bmi: "",
    consciousness: "",
    timestamp: new Date(),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [newProblem, setNewProblem] = useState("");
  const [showProgressNotes, setShowProgressNotes] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

  // Mock patient data (extended)
  const mockPatients = [
    {
      id: "P001",
      name: "John Smith",
      age: 45,
      mrn: "MRN-001",
      sex: "Male",
      dob: "1980-01-15",
      religion: "Christianity",
      maritalStatus: "Married",
      address: "123 Main St, Springfield",
      contact: "555-1234",
      email: "john.smith@example.com",
      nextOfKin: "Jane Smith",
      nokContact: "555-5678",
      allergies: "Penicillin"
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      age: 32,
      mrn: "MRN-002",
      sex: "Female",
      dob: "1993-05-22",
      religion: "Islam",
      maritalStatus: "Single",
      address: "456 Oak Ave, Springfield",
      contact: "555-2345",
      email: "sarah.johnson@example.com",
      nextOfKin: "Michael Johnson",
      nokContact: "555-6789",
      allergies: "None"
    },
    {
      id: "P003",
      name: "Michael Brown",
      age: 67,
      mrn: "MRN-003",
      sex: "Male",
      dob: "1958-09-10",
      religion: "Buddhism",
      maritalStatus: "Widowed",
      address: "789 Pine Rd, Springfield",
      contact: "555-3456",
      email: "michael.brown@example.com",
      nextOfKin: "Emily Brown",
      nokContact: "555-7890",
      allergies: "Aspirin"
    },
    {
      id: "P004",
      name: "Emily Davis",
      age: 28,
      mrn: "MRN-004",
      sex: "Female",
      dob: "1997-03-30",
      religion: "Hinduism",
      maritalStatus: "Married",
      address: "321 Maple St, Springfield",
      contact: "555-4567",
      email: "emily.davis@example.com",
      nextOfKin: "David Davis",
      nokContact: "555-8901",
      allergies: "Latex"
    },
  ];

  const dispositionOptions = [
    { value: "discharge", label: "Discharge home" },
    { value: "admit", label: "Admit to ward" },
    { value: "transfer", label: "Transfer to operating theatre" },
  ];

  const consciousnessLevels = [
    { value: "alert", label: "Alert and Oriented" },
    { value: "confused", label: "Confused" },
    { value: "drowsy", label: "Drowsy" },
    { value: "unconscious", label: "Unconscious" },
    { value: "gcs", label: "See GCS Score" },
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

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals((prev) => {
      const newVitals = {
        ...prev,
        [field]: value,
        timestamp: new Date(),
      };

      // Auto-calculate BMI if height and weight are provided
      if (field === "height" || field === "weight") {
        const height = parseFloat(field === "height" ? value : prev.height);
        const weight = parseFloat(field === "weight" ? value : prev.weight);
        
        if (height > 0 && weight > 0) {
          const heightInMeters = height / 100; // Convert cm to meters
          const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
          newVitals.bmi = bmi;
        }
      }

      return newVitals;
    });
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

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { category: "Normal", color: "text-green-600" };
    if (bmiValue < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const getVitalStatus = (vital: string, value: string, ranges: { normal: [number, number], warning: [number, number] }) => {
    const numValue = parseFloat(value);
    if (!value || isNaN(numValue)) return "";
    
    if (numValue >= ranges.normal[0] && numValue <= ranges.normal[1]) {
      return "text-green-600";
    } else if (numValue >= ranges.warning[0] && numValue <= ranges.warning[1]) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Saving notes:", {
      ...formData,
      vitals,
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
      vitals,
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

  const getPainLevel = (score:any) => {
    const numScore = parseInt(score);
    if (numScore === 0) return { level: 'No Pain', color: 'text-green-600' };
    if (numScore <= 3) return { level: 'Mild', color: 'text-yellow-600' };
    if (numScore <= 6) return { level: 'Moderate', color: 'text-orange-600' };
    return { level: 'Severe', color: 'text-red-600' };
  };

  // Mock data for emergency and clinic results
  // Ensure patientId matches mockPatients (e.g., 'P001')
  const mockEmergencyResults = [
    {
      id: "ER1",
      patientId: "P001", // matches John Smith
      fileName: "chest_xray_20240601.pdf",
      category: "Radiology",
      notes: "Chest X-ray shows clear lungs",
      uploadTime: "2024-06-01 14:30",
      uploadedBy: "Dr. Smith",
    },
    {
      id: "ER2",
      patientId: "P002", // matches Sarah Johnson
      fileName: "ecg_results.pdf",
      category: "ECG",
      notes: "Normal sinus rhythm",
      uploadTime: "2024-06-01 13:15",
      uploadedBy: "Nurse Johnson",
    },
    {
      id: "ER3",
      patientId: "P001", // matches John Smith
      fileName: "blood_work_results.pdf",
      category: "Lab",
      notes: "",
      uploadTime: "2024-06-01 12:00",
      uploadedBy: "Lab Tech",
    },
  ];

  const mockClinicResults = [
    {
      id: "CR1",
      patientId: "P001", // matches John Smith
      fileName: "ecg_results_20240601.pdf",
      category: "ECG",
      notes: "Normal sinus rhythm, no abnormalities detected",
      uploadTime: "2024-06-01 10:30",
      uploadedBy: "Dr. Anderson",
      specialty: "cardiology",
    },
    {
      id: "CR2",
      patientId: "P003", // matches Michael Brown
      fileName: "knee_xray_lateral.pdf",
      category: "X-Ray",
      notes: "Lateral view shows mild osteoarthritis",
      uploadTime: "2024-06-01 09:15",
      uploadedBy: "Dr. Martinez",
      specialty: "orthopedics",
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      Lab: "bg-blue-100 text-blue-800",
      Radiology: "bg-green-100 text-green-800",
      ECG: "bg-purple-100 text-purple-800",
      "X-Ray": "bg-blue-100 text-blue-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.Other;
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

            {/* Always show all patient info fields as input fields */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-800">
                <div>
                  <Label htmlFor="name">Name:</Label>
                  <input
                    id="name"
                    type="text"
                    value={selectedPatient ? selectedPatient.name : formData.name || ""}
                    onChange={e => handleInputChange("name", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age:</Label>
                  <input
                    id="age"
                    type="number"
                    value={selectedPatient ? selectedPatient.age : formData.age || ""}
                    onChange={e => handleInputChange("age", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="mrn">MRN:</Label>
                  <input
                    id="mrn"
                    type="text"
                    value={selectedPatient ? selectedPatient.mrn : formData.mrn || ""}
                    onChange={e => handleInputChange("mrn", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex:</Label>
                  <input
                    id="sex"
                    type="text"
                    value={formData.sex}
                    onChange={e => handleInputChange("sex", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">DOB:</Label>
                  <input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={e => handleInputChange("dob", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion:</Label>
                  <input
                    id="religion"
                    type="text"
                    value={formData.religion}
                    onChange={e => handleInputChange("religion", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital status:</Label>
                  <input
                    id="maritalStatus"
                    type="text"
                    value={formData.maritalStatus}
                    onChange={e => handleInputChange("maritalStatus", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address:</Label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={e => handleInputChange("address", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact:</Label>
                  <input
                    id="contact"
                    type="text"
                    value={formData.contact}
                    onChange={e => handleInputChange("contact", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email:</Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="nextOfKin">Next of Kin:</Label>
                  <input
                    id="nextOfKin"
                    type="text"
                    value={formData.nextOfKin}
                    onChange={e => handleInputChange("nextOfKin", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="nokContact">NOK contact:</Label>
                  <input
                    id="nokContact"
                    type="text"
                    value={formData.nokContact}
                    onChange={e => handleInputChange("nokContact", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="allergies">Any allergies:</Label>
                  <input
                    id="allergies"
                    type="text"
                    value={formData.allergies}
                    onChange={e => handleInputChange("allergies", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

     {/* Vital Signs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg text-red-700">Vital Signs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-1 text-sm font-medium">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  Temperature (°C)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="temperature"
                    placeholder="37.0"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange("temperature", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getVitalStatus("temp", vitals.temperature, { normal: [36.1, 37.2], warning: [35.0, 38.5] })
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">°C</span>
                </div>
                <div className="text-xs text-gray-500">Normal: 36.1-37.2°C</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heart-rate" className="flex items-center gap-1 text-sm font-medium">
                  <Heart className="h-4 w-4 text-red-500" />
                  Heart Rate (bpm)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="heart-rate"
                    placeholder="72"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange("heartRate", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getVitalStatus("hr", vitals.heartRate, { normal: [60, 100], warning: [50, 120] })
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">bpm</span>
                </div>
                <div className="text-xs text-gray-500">Normal: 60-100 bpm</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="respiratory-rate" className="flex items-center gap-1 text-sm font-medium">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Respiratory Rate
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="respiratory-rate"
                    placeholder="16"
                    value={vitals.respiratoryRate}
                    onChange={(e) => handleVitalChange("respiratoryRate", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getVitalStatus("rr", vitals.respiratoryRate, { normal: [12, 20], warning: [10, 24] })
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">/min</span>
                </div>
                <div className="text-xs text-gray-500">Normal: 12-20 /min</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oxygen-saturation" className="flex items-center gap-1 text-sm font-medium">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Oxygen Saturation (%)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="oxygen-saturation"
                    placeholder="98"
                    min="0"
                    max="100"
                    value={vitals.oxygenSaturation}
                    onChange={(e) => handleVitalChange("oxygenSaturation", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getVitalStatus("o2", vitals.oxygenSaturation, { normal: [95, 100], warning: [90, 100] })
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
                </div>
                <div className="text-xs text-gray-500">Normal: 95-100%</div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Blood Pressure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Blood Pressure (mmHg)</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="120"
                          value={vitals.bloodPressureSystolic}
                          onChange={(e) => handleVitalChange("bloodPressureSystolic", e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            getVitalStatus("sys", vitals.bloodPressureSystolic, { normal: [90, 140], warning: [80, 160] })
                          }`}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">Systolic</div>
                      </div>
                      <span className="text-lg font-bold text-gray-400">/</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="80"
                          value={vitals.bloodPressureDiastolic}
                          onChange={(e) => handleVitalChange("bloodPressureDiastolic", e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            getVitalStatus("dia", vitals.bloodPressureDiastolic, { normal: [60, 90], warning: [50, 100] })
                          }`}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">Diastolic</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Normal: 90-140 / 60-90 mmHg</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4 text-green-600" />
                Physical Measurements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1 text-sm font-medium">
                    <Scale className="h-4 w-4 text-green-500" />
                    Weight (kg)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="weight"
                      placeholder="70"
                      step="0.1"
                      value={vitals.weight}
                      onChange={(e) => handleVitalChange("weight", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">kg</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-1 text-sm font-medium">
                    <Ruler className="h-4 w-4 text-blue-500" />
                    Height (cm)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="height"
                      placeholder="170"
                      value={vitals.height}
                      onChange={(e) => handleVitalChange("height", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">cm</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmi" className="text-sm font-medium">BMI</Label>
                  <div className="relative">
                    <input
                      type="text"
                      id="bmi"
                      value={vitals.bmi}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    {vitals.bmi && (
                      <div className={`text-xs mt-1 font-medium ${getBMICategory(vitals.bmi).color}`}>
                        {getBMICategory(vitals.bmi).category}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pain-score" className="flex items-center gap-1 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Pain Score (0-10)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="pain-score"
                      placeholder="0"
                      min="0"
                      max="10"
                      value={vitals.painScore}
                      onChange={(e) => handleVitalChange("painScore", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">/10</span>
                  </div>
                  {vitals.painScore && (
                    <div className={`text-xs font-medium ${getPainLevel(vitals.painScore).color}`}>
                      {getPainLevel(vitals.painScore).level}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Consciousness Level */}
            <div className="space-y-2">
              <Label htmlFor="consciousness" className="text-sm font-medium">Level of Consciousness</Label>
              <Select
                value={vitals.consciousness}
                onValueChange={(value) => handleVitalChange("consciousness", value)}
              >
                <SelectTrigger id="consciousness">
                  <SelectValue placeholder="Select consciousness level..." />
                </SelectTrigger>
                <SelectContent>
                  {consciousnessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vital Signs Timestamp */}
            <div className="text-xs text-gray-500 border-t pt-2">
              Last updated: {vitals.timestamp.toLocaleString()}
            </div>
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

        {/* Emergency & Clinic Results Section */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Results
              </CardTitle>
              <CardDescription>
                Emergency and Clinic results for this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Emergency Results */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" /> Emergency Results
                </h4>
                {mockEmergencyResults.filter(r => r.patientId === selectedPatient.id).length === 0 ? (
                  <div className="text-gray-500 text-sm mb-4">No emergency results found.</div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">File Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Upload Time</th>
                          <th className="px-3 py-2 text-left">Uploaded By</th>
                          <th className="px-3 py-2 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockEmergencyResults.filter(r => r.patientId === selectedPatient.id).map(result => (
                          <tr key={result.id}>
                            <td className="px-3 py-2">{result.fileName}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(result.category)}`}>
                                {result.category}
                              </span>
                            </td>
                            <td className="px-3 py-2">{result.uploadTime}</td>
                            <td className="px-3 py-2">{result.uploadedBy}</td>
                            <td className="px-3 py-2">{result.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Clinic Results */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" /> Clinic Results
                </h4>
                {mockClinicResults.filter(r => r.patientId === selectedPatient.id).length === 0 ? (
                  <div className="text-gray-500 text-sm">No clinic results found.</div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">File Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Specialty</th>
                          <th className="px-3 py-2 text-left">Upload Time</th>
                          <th className="px-3 py-2 text-left">Uploaded By</th>
                          <th className="px-3 py-2 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockClinicResults.filter(r => r.patientId === selectedPatient.id).map(result => (
                          <tr key={result.id}>
                            <td className="px-3 py-2">{result.fileName}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(result.category)}`}>
                                {result.category}
                              </span>
                            </td>
                            <td className="px-3 py-2">{result.specialty || '-'}</td>
                            <td className="px-3 py-2">{result.uploadTime}</td>
                            <td className="px-3 py-2">{result.uploadedBy}</td>
                            <td className="px-3 py-2">{result.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Disposition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Disposition
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