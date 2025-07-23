"use client";

import React, { useState } from "react";
import { useProfile } from "../../../../hooks/useAuth";
import { usePatients } from "../../../../hooks/usePatients";
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
import { useEmergencyVisitData, useSaveEmergencyVisitNotes, useAddProblem, useAddProgressNote, useUpdateVitals } from '@/hooks/useEmergencyVisitNotes';
import type { Problem as ApiProblem, ProgressNote as ApiProgressNote } from '@/hooks/useEmergencyVisitNotes';
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

// Local type for file attachments
interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}
// Local UI types for state
interface UIProblem {
  id: string;
  description: string;
  isResolved: boolean;
  resolvedDate?: Date;
  dateAdded: Date;
}
interface UIProgressNote {
  id: string;
  note: string;
  author: string;
  timestamp: Date;
}

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



   // --- Backend-driven patient data ---

  // --- Fetch hospitalId from user profile (like worklist page) ---

  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const hospitalId = profile?.hospital?.id;
  const createdById = profile?.id;

  // Fetch all EMERGENCY patients for dropdown

  const patientsParams = { patientType: 'EMERGENCY' as const };
  const { data: patientsResponse, isLoading: isPatientsLoading ,error:patientError} = usePatients(hospitalId, patientsParams);
  const patients = patientsResponse?.data?.patients || [];

  // Use selected patientId from formData
  const selectedPatient = patients.find((p: any) => p.id === formData.patientId);
  // Try to get visitId from selectedPatient.visitId if available, fallback to undefined
  // If not present, you may need to adjust this logic based on your actual patient object shape
const visitId = selectedPatient?.visits?.[0]?.id;
console.log("selectedPatient:", selectedPatient);
  const patientId = selectedPatient?.id;
  // Fetch emergency visit data for selected patient
  const { data: visitData, isLoading, error } = useEmergencyVisitData(hospitalId, visitId, patientId);
  // --- Emergency Visit Mutations ---
const saveVisitNotes = useSaveEmergencyVisitNotes();
const addProblemMutation = useAddProblem();
const addProgressNoteMutation = useAddProgressNote();
const updateVitalsMutation = useUpdateVitals();



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

  // Remove manual isSaving, use mutation state instead
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [problems, setProblems] = useState<UIProblem[]>([]);
  const [progressNotes, setProgressNotes] = useState<UIProgressNote[]>([]);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [showProgressNotes, setShowProgressNotes] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);



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
      const note: UIProgressNote = {
        id: Date.now().toString(),
        note: newProgressNote,
        author: "Dr. Emergency Physician",
        timestamp: new Date(),
      };
      setProgressNotes((prev) => [...prev, note]);
      setNewProgressNote("");
    }
  };
  const addProblem = () => {
    if (newProblem.trim()) {
      const problem: UIProblem = {
        id: Date.now().toString(),
        description: newProblem,
        isResolved: false,
        dateAdded: new Date(),
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

// Helper for saveVisitNotes (single object argument)
function mutatePromiseSave<T>(mutateFn: (payload: T, options?: { onSuccess?: () => void; onError?: (err: any) => void }) => void, payload: T) {
  return new Promise<void>((resolve, reject) => {
    mutateFn(payload, {
      onSuccess: () => {
        console.log('saveVisitNotes.mutate called', payload);
        resolve();
      },
      onError: (err: any) => {
        console.error('saveVisitNotes.mutate error', err);
        reject(err);
      },
    });
  });
}
// Helper for (visitId, payload) signature
function mutatePromiseWithId<T>(mutateFn: (visitId: string, payload: T, options?: { onSuccess?: () => void; onError?: (err: any) => void }) => void, visitId: string, payload: T) {
  return new Promise<void>((resolve, reject) => {
    mutateFn(visitId, payload, {
      onSuccess: () => {
        console.log('mutation with visitId called', visitId, payload);
        resolve();
      },
      onError: (err: any) => {
        console.error('mutation with visitId error', err);
        reject(err);
      },
    });
  });
}

// Convert local vitals to API shape
function toApiVitals(v: typeof vitals) {
  return {
    temperature: v.temperature ? parseFloat(v.temperature) : undefined,
    bloodPressureSystolic: v.bloodPressureSystolic ? parseFloat(v.bloodPressureSystolic) : undefined,
    bloodPressureDiastolic: v.bloodPressureDiastolic ? parseFloat(v.bloodPressureDiastolic) : undefined,
    heartRate: v.heartRate ? parseFloat(v.heartRate) : undefined,
    respiratoryRate: v.respiratoryRate ? parseFloat(v.respiratoryRate) : undefined,
    oxygenSaturation: v.oxygenSaturation ? parseFloat(v.oxygenSaturation) : undefined,
    painScore: v.painScore ? parseFloat(v.painScore) : undefined,
    weight: v.weight ? parseFloat(v.weight) : undefined,
    height: v.height ? parseFloat(v.height) : undefined,
    bmi: v.bmi ? parseFloat(v.bmi) : undefined,
    consciousness: v.consciousness || undefined,
    timestamp: v.timestamp,
  };
}

// Move handleSaveAndContinue to top-level in component
const handleSaveAndContinue = async () => {
  // Build patientData from form fields
  let dateOfBirth = formData.dob ? new Date(formData.dob).toISOString() : undefined;
  if (!dateOfBirth && formData.age) {
    const ageNum = parseInt(formData.age);
    if (!isNaN(ageNum)) {
      const now = new Date();
      const dobYear = now.getFullYear() - ageNum;
      dateOfBirth = new Date(dobYear, 6, 1).toISOString();
    }
  }
  const patientData: any = {
    firstName: formData.name?.split(' ')[0] || '',
    lastName: formData.name?.split(' ').slice(1).join(' ') || '',
    mrn: formData.mrn,
    dateOfBirth,
    gender: formData.sex,
    address: formData.address,
    phone: formData.contact,
    email: formData.email,
    emergencyContact: formData.nextOfKin,
    emergencyPhone: formData.nokContact,
    maritalStatus: formData.maritalStatus,
    allergies: formData.allergies,
  };
  const hasPatientData = Object.values(patientData).some(v => v !== undefined && v !== '');
  if (!visitId) throw new Error('No visit selected');
  if (!createdById) throw new Error('No user ID');
  const apiProblems = problems.map((problem) => ({
    title: problem.description,
    description: problem.description,
    severity: 'Medium' as 'Medium',
    status: (problem.isResolved ? 'RESOLVED' : 'ACTIVE') as 'RESOLVED' | 'ACTIVE',
    onsetDate: problem.dateAdded.toISOString(),
  }));
  const apiProgressNotes = progressNotes.map((note) => ({
    content: note.note,
    noteType: 'Progress',
    isPrivate: false,
    attachments: [],
  }));
  // Use mutation's loading state, no manual setIsSaving
  saveVisitNotes.mutate({
    hospitalId,
    visitId,
    patientId,
    createdById,
    chiefComplaint: formData.chiefComplaint,
    isTraumaCase: formData.isTraumaCase,
    presentIllnessHistory: formData.historyPresentIllness,
    examinationFindings: formData.examinationFindings,
    assessmentAndPlan: formData.assessmentPlan,
    disposition: formData.disposition as any,
    vitals: toApiVitals(vitals),
    attachments: attachedFiles.map(f => f.id),
    problems: apiProblems,
    progressNotes: apiProgressNotes,
    ...(hasPatientData ? { patientData } : {}),
  });
};

  const handleCompleteVisit = async () => {
    // Save all notes and mark visit as complete (if your API supports it)
    // Just call handleSaveAndContinue, which uses mutation state
    await handleSaveAndContinue();
    // Optionally, call a mutation to mark the visit as completed
    // await completeVisitMutation.mutate({ hospitalId, visitId, patientId });
  };

  // patients and selectedPatient are now set above
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

// --- Integrate useEmergencyVisitNotes ---
// (Move import to top of file)

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


  // --- Skeleton Loader ---
  if (isPatientsLoading) {
    // Simple skeleton loader for the whole page
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

  // Skeleton loader for patient fetch
  if (isPatientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-6 w-1/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-6 w-1/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-3 justify-end">
            <div className="h-10 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
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
                onValueChange={(value) => {
                  handleInputChange("patientId", value);
                  // Prefill MRN and other fields from selected patient
                  const patient = patients.find((p: any) => p.id === value);
                  setFormData((prev) => ({
                    ...prev,
                    mrn: patient?.mrn ?? "",
                    name: patient ? `${patient.firstName} ${patient.lastName}` : "",
                    age: patient && patient.dateOfBirth ? String(new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()) : "",
                    sex: patient?.gender ?? "",
                    dob: patient?.dateOfBirth
                      ? (typeof patient.dateOfBirth === "string"
                          ? (patient.dateOfBirth as string).substring(0, 10)
                          : new Date(patient.dateOfBirth).toISOString().substring(0, 10))
                      : "",
                    address: patient?.address ?? "",
                    contact: patient?.phone ?? "",
                    email: patient?.email ?? "",
                    nextOfKin: patient?.emergencyContact ?? "",
                    nokContact: patient?.emergencyPhone ?? "",
                    maritalStatus: patient?.maritalStatus ?? "",
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

            {/* Always show all patient info fields as input fields */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-800">
                <div>
                  <Label htmlFor="name">Name:</Label>
                  <input
                    id="name"
                    type="text"
                    value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : formData.name || ""}
                    onChange={e => handleInputChange("name", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age:</Label>
                  <input
                    id="age"
                    type="number"
                    value={formData.age || (selectedPatient && selectedPatient.dateOfBirth ? String(new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()) : "")}
                    onChange={e => handleInputChange("age", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="mrn">MRN:</Label>
                  <input
                    id="mrn"
                    type="text"
                    value={formData.mrn || ""}
                    onChange={e => handleInputChange("mrn", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex:</Label>
                  <input
                    id="sex"
                    type="text"
                    value={formData.sex || (selectedPatient ? selectedPatient.gender ?? "" : "")}
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
                {/* <div className="sm:col-span-2"> */}
                  {/* <Label htmlFor="allergies">Any allergies:</Label> */}
                  {/* <input
                    id="allergies"
                    type="text"
                    value={formData.allergies}
                    onChange={e => handleInputChange("allergies", e.target.value)}
                    className="w-full px-2 py-1 border border-blue-200 rounded"
                  /> */}
                {/* </div> */}
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
                {/* Example fallback: use clinicalNotes for results if attachments not present */}
                {visitData?.visit?.clinicalNotes && visitData.visit.clinicalNotes.filter((r: any) => r.noteType === 'EmergencyResult' && r.createdBy?.id === selectedPatient.id).length === 0 ? (
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
                        {visitData?.visit?.clinicalNotes?.filter((r: any) => r.noteType === 'EmergencyResult' && r.createdBy?.id === selectedPatient.id).map((result: any) => (
                          <tr key={result.id}>
                            <td className="px-3 py-2">{result.title}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(result.category || 'Other')}`}>
                                {result.category || 'Other'}
                              </span>
                            </td>
                            <td className="px-3 py-2">{result.createdAt ? new Date(result.createdAt).toLocaleString() : '-'}</td>
                            <td className="px-3 py-2">{result.createdBy?.name || '-'}</td>
                            <td className="px-3 py-2">{result.content || '-'}</td>
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
                {visitData?.visit?.clinicalNotes && visitData.visit.clinicalNotes.filter((r: any) => r.noteType === 'ClinicResult' && r.createdBy?.id === selectedPatient.id).length === 0 ? (
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
                        {visitData?.visit?.clinicalNotes?.filter((r: any) => r.noteType === 'ClinicResult' && r.createdBy?.id === selectedPatient.id).map((result: any) => (
                          <tr key={result.id}>
                            <td className="px-3 py-2">{result.title}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(result.category || 'Other')}`}>
                                {result.category || 'Other'}
                              </span>
                            </td>
                            <td className="px-3 py-2">{result.specialty || '-'}</td>
                            <td className="px-3 py-2">{result.createdAt ? new Date(result.createdAt).toLocaleString() : '-'}</td>
                            <td className="px-3 py-2">{result.createdBy?.name || '-'}</td>
                            <td className="px-3 py-2">{result.content || '-'}</td>
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
              disabled={saveVisitNotes.isLoading || !formData.patientId}
              className="sm:w-auto w-full"
            >
              {saveVisitNotes.isLoading ? "Saving..." : "Save and Continue"}
            </Button>
            <Button
              onClick={handleCompleteVisit}
              disabled={
                saveVisitNotes.isLoading ||
                !formData.patientId ||
                !formData.chiefComplaint ||
                !formData.disposition
              }
              className="sm:w-auto w-full bg-green-600 hover:bg-green-700"
            >
              {saveVisitNotes.isLoading ? "Processing..." : "Complete Visit"}
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
}

export default EmergencyNotesPage;