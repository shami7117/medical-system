// app/emergency/prescriptions/page.tsx
"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Pill,
  Printer,
  CheckCircle,
  Zap,
  Plus,
} from "lucide-react";

// Mock data types (reusing from clinic page)
interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  allergies: string[];
  hospital_id: string;
  emergency_contact?: string;
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
  priority: "routine" | "urgent" | "stat";
}

interface PrescriptionForm {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  priority: "routine" | "urgent" | "stat";
}

interface DrugTemplate {
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Mock data
const mockHospital = {
  id: "hosp_001",
  name: "Metro General Hospital - Emergency Department",
};

const mockEmergencyPatients: Patient[] = [
  {
    id: "emp_001",
    name: "Robert Wilson",
    age: 67,
    mrn: "ER001",
    allergies: ["Morphine", "Codeine"],
    hospital_id: "hosp_001",
    emergency_contact: "555-0123",
  },
  {
    id: "emp_002",
    name: "Lisa Chen",
    age: 28,
    mrn: "ER002",
    allergies: [],
    hospital_id: "hosp_001",
    emergency_contact: "555-0456",
  },
  {
    id: "emp_003",
    name: "David Rodriguez",
    age: 42,
    mrn: "ER003",
    allergies: ["Penicillin"],
    hospital_id: "hosp_001",
    emergency_contact: "555-0789",
  },
];

const mockEmergencyPrescriptions: Prescription[] = [
  {
    id: "epresc_001",
    patient_id: "emp_001",
    medication: "Acetaminophen",
    dosage: "1000mg",
    frequency: "Every 6 hours",
    duration: "3 days",
    instructions: "For pain management",
    prescribed_by: "Dr. Emergency",
    prescribed_at: "2024-06-02T08:30:00Z",
    status: "active",
    priority: "urgent",
  },
  {
    id: "epresc_002",
    patient_id: "emp_001",
    medication: "Ondansetron",
    dosage: "4mg",
    frequency: "Every 8 hours as needed",
    duration: "24 hours",
    instructions: "For nausea",
    prescribed_by: "Dr. Emergency",
    prescribed_at: "2024-06-02T08:45:00Z",
    status: "active",
    priority: "stat",
  },
];

// Emergency drug templates
const emergencyDrugTemplates: DrugTemplate[] = [
  {
    name: "Acetaminophen",
    category: "Pain Relief",
    dosage: "1000mg",
    frequency: "Every 6 hours",
    duration: "3 days",
    instructions: "For pain management",
  },
  {
    name: "Ibuprofen",
    category: "Pain Relief",
    dosage: "600mg",
    frequency: "Every 8 hours",
    duration: "5 days",
    instructions: "Take with food",
  },
  {
    name: "Amoxicillin",
    category: "Antibiotic",
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "7 days",
    instructions: "Complete full course",
  },
  {
    name: "Azithromycin",
    category: "Antibiotic",
    dosage: "250mg",
    frequency: "Once daily",
    duration: "5 days",
    instructions: "Take on empty stomach",
  },
  {
    name: "Ondansetron",
    category: "Anti-nausea",
    dosage: "4mg",
    frequency: "Every 8 hours as needed",
    duration: "24 hours",
    instructions: "For nausea and vomiting",
  },
  {
    name: "Lorazepam",
    category: "Sedative",
    dosage: "1mg",
    frequency: "As needed",
    duration: "3 days",
    instructions: "Do not drive or operate machinery",
  },
];

export default function EmergencyPrescriptionsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    priority: "routine",
  });

  // Filter patients by hospital
  const filteredPatients = mockEmergencyPatients.filter(
    (patient) => patient.hospital_id === mockHospital.id
  );

  // Get prescriptions for selected patient
  const patientPrescriptions = selectedPatient
    ? mockEmergencyPrescriptions.filter(
        (p) => p.patient_id === selectedPatient.id
      )
    : [];

  const handlePatientSelect = (patientId: string) => {
    const patient = filteredPatients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
  };

  const handleFormChange = (field: keyof PrescriptionForm, value: string) => {
    setPrescriptionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: DrugTemplate) => {
    setPrescriptionForm({
      medication: template.name,
      dosage: template.dosage,
      frequency: template.frequency,
      duration: template.duration,
      instructions: template.instructions,
      priority: "routine",
    });
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

    console.log("Saving emergency prescription:", {
      patient_id: selectedPatient.id,
      ...prescriptionForm,
      timestamp: new Date().toISOString(),
    });

    // Reset form
    setPrescriptionForm({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      priority: "routine",
    });

    alert("Emergency prescription saved successfully!");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-red-600 text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-3xl font-bold">Emergency Prescriptions</h1>
                <p className="text-red-100 mt-1">{mockHospital.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-red-100">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Patient Selection & Quick Templates */}
          <div className="xl:col-span-1 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <User className="h-5 w-5 mr-2" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient-select">Select Patient</Label>
                    <Select onValueChange={handlePatientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span>{patient.name}</span>
                              <span className="text-xs text-gray-500">
                                {patient.mrn} - Age {patient.age}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPatient && selectedPatient.allergies.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>⚠️ ALLERGIES:</strong>
                        <br />
                        {selectedPatient.allergies.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Drug Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emergencyDrugTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">
                          {template.category}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Prescription Form */}
          <div className="xl:col-span-2 space-y-6">
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2" />
                    Emergency Prescription - {selectedPatient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Priority Selection */}
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={prescriptionForm.priority}
                      onValueChange={(value: "routine" | "urgent" | "stat") =>
                        handleFormChange("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Medication and Dosage - Side by side for faster entry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medication">Medication *</Label>
                      <Input
                        id="medication"
                        value={prescriptionForm.medication}
                        onChange={(e) =>
                          handleFormChange("medication", e.target.value)
                        }
                        placeholder="Enter medication name"
                        className="font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={prescriptionForm.dosage}
                        onChange={(e) =>
                          handleFormChange("dosage", e.target.value)
                        }
                        placeholder="e.g., 500mg, 1 tablet"
                      />
                    </div>
                  </div>

                  {/* Frequency and Duration */}
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="Every 4 hours">
                            Every 4 hours
                          </SelectItem>
                          <SelectItem value="Every 6 hours">
                            Every 6 hours
                          </SelectItem>
                          <SelectItem value="Every 8 hours">
                            Every 8 hours
                          </SelectItem>
                          <SelectItem value="As needed">
                            As needed (PRN)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={prescriptionForm.duration}
                        onValueChange={(value) =>
                          handleFormChange("duration", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24 hours">24 hours</SelectItem>
                          <SelectItem value="3 days">3 days</SelectItem>
                          <SelectItem value="5 days">5 days</SelectItem>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="10 days">10 days</SelectItem>
                          <SelectItem value="14 days">14 days</SelectItem>
                          <SelectItem value="30 days">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={prescriptionForm.instructions}
                      onChange={(e) =>
                        handleFormChange("instructions", e.target.value)
                      }
                      placeholder="Special instructions, warnings, etc."
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      onClick={handleSavePrescription}
                      className="bg-red-600 hover:bg-red-700 flex items-center"
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

            {/* Current Prescriptions Table */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Current & Recent Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientPrescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patientPrescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{prescription.medication}</div>
                                  <div className="text-sm text-gray-500">
                                    {prescription.frequency}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{prescription.dosage}</TableCell>
                              <TableCell>
                                <Badge
                                  className={getPriorityColor(
                                    prescription.priority
                                  )}
                                >
                                  {prescription.priority.toUpperCase()}
                                </Badge>
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
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No prescriptions found for this patient</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Patient Info & Quick Actions */}
          <div className="xl:col-span-1 space-y-6">
            {selectedPatient && (
              <>
                {/* Patient Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-700">
                      Patient Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Name
                        </Label>
                        <p className="font-medium">{selectedPatient.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          MRN
                        </Label>
                        <p className="font-mono">{selectedPatient.mrn}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Age
                        </Label>
                        <p>{selectedPatient.age} years old</p>
                      </div>
                      {selectedPatient.emergency_contact && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Emergency Contact
                          </Label>
                          <p className="font-mono">
                            {selectedPatient.emergency_contact}
                          </p>
                        </div>
                      )}
                      {selectedPatient.allergies.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Allergies
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPatient.allergies.map((allergy) => (
                              <Badge
                                key={allergy}
                                variant="destructive"
                                className="text-xs"
                              >
                                ⚠️ {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-purple-700">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Check Drug Interactions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        View Full History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Contact Emergency Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print All Prescriptions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Notes */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800 text-sm">
                      ⚡ Emergency Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• Always verify patient allergies</li>
                      <li>• Check drug interactions</li>
                      <li>• STAT orders require immediate attention</li>
                      <li>• Document all prescriptions in EMR</li>
                      <li>• Notify pharmacy for critical medications</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {!selectedPatient && (
              <Card className="border-gray-200">
                <CardContent className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    Select a patient to begin prescribing medications
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
