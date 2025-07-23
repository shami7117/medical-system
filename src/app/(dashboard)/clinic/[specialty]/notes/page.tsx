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
  Stethoscope,
  Clock,
  User,
  FileText,
  Upload,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { useSaveEmergencyVisitNotes } from "@/hooks/useEmergencyVisitNotes";
interface SOAPNotesData {
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  // Expanded patient info fields
  name?: string;
  age?: string | number;
  mrn?: string;
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
  // Vitals fields
  weight?: string;
  height?: string;
  painScore?: string;
  consciousness?: string;
  temperature?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
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
  console.log("specialty", specialty);

  const [formData, setFormData] = useState<SOAPNotesData>({
    patientId: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  // Get specialty from params and format for display
  const searchParams = useSearchParams();
  const specialtyId = searchParams.get("specialtyId");
  const specialtyName =
    specialtyId &&
    specialtyId
      .replace(/-/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");

  // --- Backend-driven patient data integration ---
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const hospitalId = profile?.hospital?.id;
  // Fetch all CLINIC patients for dropdown
  const patientsParams = { patientType: "CLINIC" as const };
  const {
    data: patientsResponse,
    isLoading: isPatientsLoading,
    error: patientError,
  } = usePatients(hospitalId, patientsParams);
  const patients = patientsResponse?.data?.patients || [];

  // Use selected patientId from formData
  const selectedPatient = patients.find((p: any) => p.id === formData.patientId);

  const saveVisitNotes = useSaveEmergencyVisitNotes();
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [newProblem, setNewProblem] = useState("");
  const [showProgressNotes, setShowProgressNotes] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

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
        author: `Dr. ${specialty} Specialist`,
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

  // Helper: convert local vitals to API shape
  function toApiVitals(form: SOAPNotesData) {
    return {
      temperature:
        form.temperature && !isNaN(Number(form.temperature))
          ? parseFloat(form.temperature)
          : undefined,
      bloodPressureSystolic:
        form.bloodPressureSystolic && !isNaN(Number(form.bloodPressureSystolic))
          ? parseFloat(form.bloodPressureSystolic)
          : undefined,
      bloodPressureDiastolic:
        form.bloodPressureDiastolic && !isNaN(Number(form.bloodPressureDiastolic))
          ? parseFloat(form.bloodPressureDiastolic)
          : undefined,
      heartRate: form.heartRate && !isNaN(Number(form.heartRate))
        ? parseFloat(form.heartRate)
        : undefined,
      respiratoryRate:
        form.respiratoryRate && !isNaN(Number(form.respiratoryRate))
          ? parseFloat(form.respiratoryRate)
          : undefined,
      oxygenSaturation:
        form.oxygenSaturation && !isNaN(Number(form.oxygenSaturation))
          ? parseFloat(form.oxygenSaturation)
          : undefined,
      painScore: form.painScore && !isNaN(Number(form.painScore))
        ? parseFloat(form.painScore)
        : undefined,
      weight: form.weight && !isNaN(Number(form.weight))
        ? parseFloat(form.weight)
        : undefined,
      height: form.height && !isNaN(Number(form.height))
        ? parseFloat(form.height)
        : undefined,
      consciousness: form.consciousness || undefined,
    };
  }

  // Helper: build patientData
  function buildPatientData(form: SOAPNotesData) {
    let dateOfBirth = form.dob ? new Date(form.dob).toISOString() : undefined;
    if (!dateOfBirth && form.age) {
      const ageNum = parseInt(form.age as string);
      if (!isNaN(ageNum)) {
        const now = new Date();
        dateOfBirth = new Date(
          now.getFullYear() - ageNum,
          now.getMonth(),
          now.getDate()
        ).toISOString();
      }
    }
    return {
      firstName: form.name?.split(" ")[0] || "",
      lastName: form.name?.split(" ").slice(1).join(" ") || "",
      mrn: form.mrn,
      dateOfBirth,
      gender: form.sex,
      address: form.address,
      phone: form.contact,
      email: form.email,
      emergencyContact: form.nextOfKin,
      emergencyPhone: form.nokContact,
      maritalStatus: form.maritalStatus,
      allergies: form.allergies,
    };
  }

  // Helper: build problems for API
  function toApiProblems(problems: Problem[]) {
    return problems.map((problem) => ({
      title: problem.description,
      description: problem.description,
      severity: "Medium",
      status: problem.isResolved ? "RESOLVED" : "ACTIVE",
      onsetDate: problem.dateAdded.toISOString(),
    }));
  }

  // Helper: build progress notes for API
  function toApiProgressNotes(notes: ProgressNote[]) {
    return notes.map((note) => ({
      content: note.note,
      noteType: "Progress",
      isPrivate: false,
      attachments: [],
    }));
  }

  // Find specialtyId for payload
  // (Assume you have a specialties list, or get from config key)

  const handleSaveNote = async () => {
    if (!formData.patientId || !hospitalId || !profile?.id) return;
    const payload:any = {
      hospitalId,
      patientId: formData.patientId,
      createdById: profile.id,
      specialtyId,
      visitType: "CLINIC" as const,
      chiefComplaint: formData.subjective,
      presentIllnessHistory: formData.subjective,
      examinationFindings: formData.objective,
      assessmentAndPlan: formData.assessment + "\n" + formData.plan,
      vitals: toApiVitals(formData),
      attachments: attachedFiles.map((f) => f.id),
      problems: toApiProblems(problems),
      progressNotes: toApiProgressNotes(progressNotes),
      patientData: buildPatientData(formData),
    };
    saveVisitNotes.mutate(payload);
  };

  const handleCompleteVisit = async () => {
    await handleSaveNote();
    // Optionally, call a mutation to mark the visit as completed
    // e.g., saveVisitNotes.mutate({ ...payload, status: 'COMPLETED' })
  };

  // (selectedPatient is now from real patients)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // --- Skeleton Loader ---
  if (profileQuery.isLoading || isPatientsLoading || saveVisitNotes.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 animate-pulse">
          <div className="h-12 bg-white rounded-lg shadow-sm border mb-4" />
          <div className="h-40 bg-white rounded-lg shadow-sm border" />
          <div className="h-40 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-32 bg-white rounded-lg shadow-sm border" />
          <div className="h-20 bg-white rounded-lg shadow-sm border" />
        </div>
      </div>
    );
  }

  // Error state
  if (patientError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 font-semibold">
          Error loading patients: {patientError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl capitalize font-bold text-gray-900">
              {specialty} Clinic Notes
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{specialty} Specialist</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>SOAP Format</span>
            </div>
          </div>
        </div>

        {/* Patient Selection & Editable Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-select">Select Patient</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value: string) => {
                  handleInputChange("patientId", value);
                  // Fix: Only assign religion and allergies if they exist on patient
                  // Patient selection handler
                  const patient :any= patients.find((p: any) => p.id === value);
                  setFormData((prev) => ({
                    ...prev,
                    name: patient ? `${patient.firstName} ${patient.lastName}` : "",
                    age:
                      patient && patient.dateOfBirth
                        ? String(
                            new Date().getFullYear() -
                              (typeof patient.dateOfBirth === "string" && patient.dateOfBirth
                                ? new Date(patient.dateOfBirth).getFullYear()
                                : new Date().getFullYear())
                          )
                        : "",
                    mrn: patient?.mrn ?? "",
                    sex: patient?.gender ?? "",
                    dob:
                      patient && patient.dateOfBirth
                        ? typeof patient.dateOfBirth === "string" && patient.dateOfBirth
                          ? patient.dateOfBirth.toISOString().substring(0, 10)
                          : new Date(patient.dateOfBirth).toISOString().substring(0, 10)
                        : "",
                    address: patient?.address ?? "",
                    contact: patient?.phone ?? "",
                    email: patient?.email ?? "",
                    nextOfKin: patient?.emergencyContact ?? "",
                    nokContact: patient?.emergencyPhone ?? "",
                    maritalStatus: patient?.maritalStatus ?? "",
                    religion: patient && 'religion' in patient ? (patient as any).religion ?? "" : "",
                    allergies: patient && 'allergies' in patient ? (patient as any).allergies ?? "" : "",
                  }));
                }}
              >
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Editable patient info fields */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-800">
                <div>
                  <Label htmlFor="name">Name:</Label>
                  <input
                    id="name"
                    type="text"
                    value={
                      selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                        : formData.name || ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age:</Label>
                  <input
                    id="age"
                    type="number"
                    value={
                      selectedPatient && selectedPatient.dateOfBirth
                        ? String(
                            new Date().getFullYear() -
                              new Date(selectedPatient.dateOfBirth).getFullYear()
                          )
                        : formData.age || ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, age: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="mrn">MRN:</Label>
                  <input
                    id="mrn"
                    type="text"
                    value={formData.mrn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mrn: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex:</Label>
                  <input
                    id="sex"
                    type="text"
                    value={formData.sex || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sex: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">DOB:</Label>
                  <input
                    id="dob"
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dob: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion:</Label>
                  <input
                    id="religion"
                    type="text"
                    value={formData.religion || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, religion: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital status:</Label>
                  <input
                    id="maritalStatus"
                    type="text"
                    value={formData.maritalStatus || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maritalStatus: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address:</Label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact:</Label>
                  <input
                    id="contact"
                    type="text"
                    value={formData.contact || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contact: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email:</Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="nextOfKin">Next of Kin:</Label>
                  <input
                    id="nextOfKin"
                    type="text"
                    value={formData.nextOfKin || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nextOfKin: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="nokContact">NOK contact:</Label>
                  <input
                    id="nokContact"
                    type="text"
                    value={formData.nokContact || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nokContact: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="allergies">Any allergies:</Label>
                  <input
                    id="allergies"
                    type="text"
                    value={formData.allergies || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, allergies: e.target.value }))
                    }
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg text-blue-700">Vital Signs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="temperature"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Temperature (°C)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="temperature"
                    placeholder="37.0"
                    step="0.1"
                    value={formData.temperature || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, temperature: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    °C
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="heart-rate"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Heart Rate (bpm)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="heart-rate"
                    placeholder="72"
                    value={formData.heartRate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, heartRate: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    bpm
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="respiratory-rate"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Respiratory Rate
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="respiratory-rate"
                    placeholder="16"
                    value={formData.respiratoryRate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, respiratoryRate: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    /min
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="oxygen-saturation"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Oxygen Saturation (%)
                </Label>
                <div className="relative">
                  <input
                    type="number"
                    id="oxygen-saturation"
                    placeholder="98"
                    min="0"
                    max="100"
                    value={formData.oxygenSaturation || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, oxygenSaturation: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>
            {/* Blood Pressure */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Blood Pressure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Blood Pressure (mmHg)
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="120"
                          value={formData.bloodPressureSystolic || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, bloodPressureSystolic: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          Systolic
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-400">/</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="80"
                          value={formData.bloodPressureDiastolic || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, bloodPressureDiastolic: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          Diastolic
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Normal: 90-140 / 60-90 mmHg
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Physical Measurements */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Physical Measurements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="weight"
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    Weight (kg)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="weight"
                      placeholder="70"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, weight: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      kg
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="height"
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    Height (cm)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="height"
                      placeholder="170"
                      value={formData.height || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, height: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      cm
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi" className="text-sm font-medium">
                    BMI
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      id="bmi"
                      value={(() => {
                        const w = Number(formData.weight);
                        const h = Number(formData.height);
                        if (w > 0 && h > 0) {
                          const bmi = w / Math.pow(h / 100, 2);
                          return bmi.toFixed(1);
                        }
                        return "";
                      })()}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pain-score"
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    Pain Score (0-10)
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      id="pain-score"
                      placeholder="0"
                      min="0"
                      max="10"
                      value={formData.painScore || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, painScore: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      /10
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Consciousness Level */}
            <div className="space-y-2">
              <Label
                htmlFor="consciousness"
                className="text-sm font-medium"
              >
                Level of Consciousness
              </Label>
              <Select
                value={formData.consciousness || ""}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, consciousness: value }))
                }
              >
                <SelectTrigger id="consciousness">
                  <SelectValue placeholder="Select consciousness level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alert and Oriented</SelectItem>
                  <SelectItem value="confused">Confused</SelectItem>
                  <SelectItem value="drowsy">Drowsy</SelectItem>
                  <SelectItem value="unconscious">Unconscious</SelectItem>
                  <SelectItem value="gcs">See GCS Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SOAP Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="subjective">
                Patient's own words and reported symptoms
              </Label>
              <Textarea
                id="subjective"
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
            <CardTitle className="text-lg">Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="objective">
                Measurable findings and observations
              </Label>
              <Textarea
                id="objective"
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
            <CardTitle className="text-lg">Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="assessment">
                Clinical judgment and diagnosis
              </Label>
              <Textarea
                id="assessment"
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
            <CardTitle className="text-lg">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="plan">Treatment plan and follow-up</Label>
              <Textarea
                id="plan"
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
                  onChange={handleFileUpload as React.ChangeEventHandler<HTMLInputElement>}
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
              disabled={saveVisitNotes.isLoading || !formData.patientId}
              className="sm:w-auto w-full"
            >
              {saveVisitNotes.isLoading ? "Saving..." : "Save Note"}
            </Button>
            <Button
              onClick={handleCompleteVisit}
              disabled={
                saveVisitNotes.isLoading ||
                !formData.patientId ||
                !formData.subjective
              }
              className="sm:w-auto w-full bg-green-600 hover:bg-green-700"
            >
              {saveVisitNotes.isLoading ? "Processing..." : "Complete Visit"}
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
