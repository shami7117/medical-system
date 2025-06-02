// app/clinic/[specialty]/prescriptions/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Pill,
  Printer,
  CheckCircle,
} from "lucide-react";

// Mock data types
interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  allergies: string[];
  hospital_id: string;
  specialty: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribed_by: string;
  prescribed_at: string;
  status: "active" | "completed" | "discontinued";
}

interface PrescriptionForm {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Mock data
const mockHospital = {
  id: "hosp_001",
  name: "Metro General Hospital",
};

const mockPatients: Patient[] = [
  {
    id: "pat_001",
    name: "John Smith",
    age: 45,
    mrn: "MRN001",
    allergies: ["Penicillin", "Sulfa"],
    hospital_id: "hosp_001",
    specialty: "cardiology",
  },
  {
    id: "pat_002",
    name: "Sarah Johnson",
    age: 32,
    mrn: "MRN002",
    allergies: [],
    hospital_id: "hosp_001",
    specialty: "cardiology",
  },
  {
    id: "pat_003",
    name: "Michael Brown",
    age: 58,
    mrn: "MRN003",
    allergies: ["Aspirin"],
    hospital_id: "hosp_001",
    specialty: "orthopaedics",
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: "presc_001",
    patient_id: "pat_001",
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    instructions: "Take with food",
    prescribed_by: "Dr. Wilson",
    prescribed_at: "2024-05-28T10:30:00Z",
    status: "active",
  },
  {
    id: "presc_002",
    patient_id: "pat_001",
    medication: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "90 days",
    instructions: "Take with meals",
    prescribed_by: "Dr. Wilson",
    prescribed_at: "2024-05-20T14:15:00Z",
    status: "active",
  },
];

const commonMedications = [
  "Lisinopril",
  "Metoprolol",
  "Amlodipine",
  "Atorvastatin",
  "Metformin",
  "Aspirin",
  "Clopidogrel",
  "Warfarin",
  "Furosemide",
  "Spironolactone",
];

export default function ClinicPrescriptionsPage() {
  const params = useParams();
  const specialty = params.specialty as string;

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  // Filter patients by hospital and specialty
  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.hospital_id === mockHospital.id && patient.specialty === specialty
  );

  // Get prescriptions for selected patient
  const patientPrescriptions = selectedPatient
    ? mockPrescriptions.filter((p) => p.patient_id === selectedPatient.id)
    : [];

  const handlePatientSelect = (patientId: string) => {
    const patient = filteredPatients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
  };

  const handleFormChange = (field: keyof PrescriptionForm, value: string) => {
    setPrescriptionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePrescription = () => {
    if (
      !selectedPatient ||
      !prescriptionForm.medication ||
      !prescriptionForm.dosage
    ) {
      alert("Please select a patient and fill in required fields");
      return;
    }

    // Here you would typically save to your backend
    console.log("Saving prescription:", {
      patient_id: selectedPatient.id,
      ...prescriptionForm,
    });

    // Reset form
    setPrescriptionForm({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });

    alert("Prescription saved successfully!");
  };

  const formatSpecialtyName = (specialty: string) => {
    return specialty.charAt(0).toUpperCase() + specialty.slice(1);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {formatSpecialtyName(specialty)} Prescriptions
              </h1>
              <p className="text-gray-600 mt-1">{mockHospital.name}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Selection & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient-select">Select Patient</Label>
                    <Select onValueChange={handlePatientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} (MRN: {patient.mrn}) - Age{" "}
                            {patient.age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPatient && selectedPatient.allergies.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Allergies:</strong>{" "}
                        {selectedPatient.allergies.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prescription Form */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2" />
                    New Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medication">Medication *</Label>
                      <Select
                        value={prescriptionForm.medication}
                        onValueChange={(value) =>
                          handleFormChange("medication", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select medication..." />
                        </SelectTrigger>
                        <SelectContent>
                          {commonMedications.map((med) => (
                            <SelectItem key={med} value={med}>
                              {med}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={prescriptionForm.dosage}
                        onChange={(e) =>
                          handleFormChange("dosage", e.target.value)
                        }
                        placeholder="e.g., 10mg, 1 tablet"
                      />
                    </div>

                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={prescriptionForm.frequency}
                        onValueChange={(value) =>
                          handleFormChange("frequency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">
                            Twice daily
                          </SelectItem>
                          <SelectItem value="Three times daily">
                            Three times daily
                          </SelectItem>
                          <SelectItem value="Four times daily">
                            Four times daily
                          </SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={prescriptionForm.duration}
                        onChange={(e) =>
                          handleFormChange("duration", e.target.value)
                        }
                        placeholder="e.g., 30 days, 1 week"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">
                      Additional Instructions
                    </Label>
                    <Textarea
                      id="instructions"
                      value={prescriptionForm.instructions}
                      onChange={(e) =>
                        handleFormChange("instructions", e.target.value)
                      }
                      placeholder="Take with food, avoid alcohol, etc."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={handleSavePrescription}
                      className="flex items-center"
                    >
                      <Pill className="h-4 w-4 mr-2" />
                      Save Prescription
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="secondary" className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Patient History */}
          <div className="space-y-6">
            {selectedPatient && (
              <>
                {/* Patient Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedPatient.name}
                      </p>
                      <p>
                        <strong>MRN:</strong> {selectedPatient.mrn}
                      </p>
                      <p>
                        <strong>Age:</strong> {selectedPatient.age}
                      </p>
                      <p>
                        <strong>Specialty:</strong>{" "}
                        {formatSpecialtyName(selectedPatient.specialty)}
                      </p>
                      {selectedPatient.allergies.length > 0 && (
                        <div>
                          <strong>Allergies:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPatient.allergies.map((allergy) => (
                              <Badge
                                key={allergy}
                                variant="destructive"
                                className="text-xs"
                              >
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Prescription History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Prescription History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patientPrescriptions.length > 0 ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medication</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientPrescriptions.map((prescription) => (
                              <TableRow key={prescription.id}>
                                <TableCell className="font-medium">
                                  {prescription.medication}
                                </TableCell>
                                <TableCell>
                                  {prescription.dosage}
                                  <br />
                                  <span className="text-sm text-gray-500">
                                    {prescription.frequency}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      prescription.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="capitalize"
                                  >
                                    {prescription.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {formatDateTime(prescription.prescribed_at)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No previous prescriptions found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
