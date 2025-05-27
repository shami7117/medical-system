"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Play,
  CheckCircle,
  FileText,
  ArrowRightLeft,
  Users,
} from "lucide-react";

type Specialty =
  | "Outpatient Clinic"
  | "General Medicine"
  | "General Surgery"
  | "Paediatrics"
  | "Obstetrics"
  | "Gynaecology"
  | "Dermatology"
  | "ENT"
  | "Ophthalmology"
  | "Cardiology"
  | "Orthopaedics"
  | "Radiology"
  | "Psychiatry"
  | "Pathology";

type VisitType = "Walk-in" | "Scheduled";
type Status = "Waiting" | "In Progress" | "Completed";

interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
}

interface Patient {
  id: string;
  mrn: string;
  name: string;
  visitType: VisitType;
  assignedDoctor: string;
  status: Status;
  specialty: Specialty;
}

export default function ClinicWorklistPage() {
  const doctors: Doctor[] = [
    { id: "1", name: "Dr. Smith", specialty: "Outpatient Clinic" },
    { id: "2", name: "Dr. Johnson", specialty: "Outpatient Clinic" },
    { id: "3", name: "Dr. Williams", specialty: "General Medicine" },
    { id: "4", name: "Dr. Brown", specialty: "General Medicine" },
    { id: "5", name: "Dr. Davis", specialty: "General Surgery" },
    { id: "6", name: "Dr. Miller", specialty: "General Surgery" },
    { id: "7", name: "Dr. Wilson", specialty: "Paediatrics" },
    { id: "8", name: "Dr. Moore", specialty: "Paediatrics" },
    { id: "9", name: "Dr. Taylor", specialty: "Obstetrics" },
    { id: "10", name: "Dr. Anderson", specialty: "Obstetrics" },
    { id: "11", name: "Dr. Thomas", specialty: "Gynaecology" },
    { id: "12", name: "Dr. Jackson", specialty: "Gynaecology" },
    { id: "13", name: "Dr. White", specialty: "Dermatology" },
    { id: "14", name: "Dr. Harris", specialty: "Dermatology" },
    { id: "15", name: "Dr. Martin", specialty: "ENT" },
    { id: "16", name: "Dr. Garcia", specialty: "ENT" },
    { id: "17", name: "Dr. Martinez", specialty: "Ophthalmology" },
    { id: "18", name: "Dr. Robinson", specialty: "Ophthalmology" },
    { id: "19", name: "Dr. Clark", specialty: "Cardiology" },
    { id: "20", name: "Dr. Rodriguez", specialty: "Cardiology" },
    { id: "21", name: "Dr. Lewis", specialty: "Orthopaedics" },
    { id: "22", name: "Dr. Lee", specialty: "Orthopaedics" },
    { id: "23", name: "Dr. Walker", specialty: "Radiology" },
    { id: "24", name: "Dr. Hall", specialty: "Radiology" },
    { id: "25", name: "Dr. Allen", specialty: "Psychiatry" },
    { id: "26", name: "Dr. Young", specialty: "Psychiatry" },
    { id: "27", name: "Dr. King", specialty: "Pathology" },
    { id: "28", name: "Dr. Wright", specialty: "Pathology" },
  ];

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      mrn: "MRN101",
      name: "Alice Cooper",
      visitType: "Scheduled",
      assignedDoctor: "Dr. Smith",
      status: "Waiting",
      specialty: "Outpatient Clinic",
    },
    {
      id: "2",
      mrn: "MRN102",
      name: "Bob Wilson",
      visitType: "Walk-in",
      assignedDoctor: "Dr. Williams",
      status: "In Progress",
      specialty: "General Medicine",
    },
    {
      id: "3",
      mrn: "MRN201",
      name: "Carol Martinez",
      visitType: "Scheduled",
      assignedDoctor: "Dr. Davis",
      status: "Waiting",
      specialty: "General Surgery",
    },
    {
      id: "4",
      mrn: "MRN301",
      name: "David Lee",
      visitType: "Walk-in",
      assignedDoctor: "Dr. Wilson",
      status: "Waiting",
      specialty: "Paediatrics",
    },
    {
      id: "5",
      mrn: "MRN401",
      name: "Emma Johnson",
      visitType: "Scheduled",
      assignedDoctor: "Dr. Taylor",
      status: "In Progress",
      specialty: "Obstetrics",
    },
  ]);

  const [newPatient, setNewPatient] = useState({
    mrn: "",
    visitType: "" as VisitType | "",
    assignedDoctor: "",
  });

  const [activeTab, setActiveTab] = useState<Specialty>("Outpatient Clinic");

  const specialtyTabs: Specialty[] = [
    "Outpatient Clinic",
    "General Medicine",
    "General Surgery",
    "Paediatrics",
    "Obstetrics",
    "Gynaecology",
    "Dermatology",
    "ENT",
    "Ophthalmology",
    "Cardiology",
    "Orthopaedics",
    "Radiology",
    "Psychiatry",
    "Pathology",
  ];

  const getVisitTypeColor = (visitType: VisitType) => {
    return visitType === "Scheduled"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Waiting":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const addPatient = () => {
    if (!newPatient.mrn || !newPatient.visitType || !newPatient.assignedDoctor)
      return;

    const patient: Patient = {
      id: Date.now().toString(),
      mrn: newPatient.mrn,
      name: `Patient ${newPatient.mrn}`,
      visitType: newPatient.visitType,
      assignedDoctor: newPatient.assignedDoctor,
      status: "Waiting",
      specialty: activeTab,
    };

    setPatients((prev) => [...prev, patient]);
    setNewPatient({ mrn: "", visitType: "", assignedDoctor: "" });
  };

  const updatePatientStatus = (id: string, status: Status) => {
    setPatients((prev) =>
      prev
        .map((patient) =>
          patient.id === id ? { ...patient, status } : patient
        )
        .filter((patient) => status !== "Completed" || patient.id !== id)
    );
  };

  const transferPatient = (id: string, newSpecialty: Specialty) => {
    const availableDoctors = doctors.filter(
      (doc) => doc.specialty === newSpecialty
    );
    if (availableDoctors.length === 0) return;

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === id
          ? {
              ...patient,
              specialty: newSpecialty,
              assignedDoctor: availableDoctors[0].name,
              status: "Waiting",
            }
          : patient
      )
    );
  };

  const getPatientsBySpecialty = (specialty: Specialty) => {
    return patients.filter((patient) => patient.specialty === specialty);
  };

  const getDoctorsBySpecialty = (specialty: Specialty) => {
    return doctors.filter((doctor) => doctor.specialty === specialty);
  };

  const getSpecialtyStats = (specialty: Specialty) => {
    const specialtyPatients = getPatientsBySpecialty(specialty);
    return {
      waiting: specialtyPatients.filter((p) => p.status === "Waiting").length,
      inProgress: specialtyPatients.filter((p) => p.status === "In Progress")
        .length,
      total: specialtyPatients.length,
    };
  };

  const renderSpecialtyContent = (specialty: Specialty) => {
    const specialtyDoctors = getDoctorsBySpecialty(specialty);
    const specialtyPatients = getPatientsBySpecialty(specialty);
    const stats = getSpecialtyStats(specialty);

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.waiting}
                </div>
                <div className="text-sm text-muted-foreground">Waiting</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.inProgress}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Patient to {specialty}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Enter MRN"
                value={newPatient.mrn}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, mrn: e.target.value }))
                }
              />
              <Select
                value={newPatient.visitType}
                onValueChange={(value: VisitType) =>
                  setNewPatient((prev) => ({ ...prev, visitType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Visit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newPatient.assignedDoctor}
                onValueChange={(value) =>
                  setNewPatient((prev) => ({ ...prev, assignedDoctor: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Assign Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={addPatient}
                disabled={
                  !newPatient.mrn ||
                  !newPatient.visitType ||
                  !newPatient.assignedDoctor
                }
                className="w-full"
              >
                Add Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {specialty} Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {specialtyPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No patients in {specialty.toLowerCase()}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MRN</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialtyPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.mrn}
                        </TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getVisitTypeColor(patient.visitType)}
                          >
                            {patient.visitType}
                          </Badge>
                        </TableCell>
                        <TableCell>{patient.assignedDoctor}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(patient.status)}
                          >
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {patient.status === "Waiting" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updatePatientStatus(patient.id, "In Progress")
                                }
                                className="flex items-center gap-1"
                              >
                                <Play className="h-3 w-3" />
                                Start
                              </Button>
                            )}
                            {patient.status === "In Progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updatePatientStatus(patient.id, "Completed")
                                }
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Complete
                              </Button>
                            )}
                            <Select
                              onValueChange={(value: Specialty) =>
                                transferPatient(patient.id, value)
                              }
                            >
                              <SelectTrigger className="w-auto h-8 px-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <ArrowRightLeft className="h-3 w-3" />
                                  Transfer
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {specialtyTabs
                                  .filter((s) => s !== specialty)
                                  .map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              Records
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clinic Work List</h1>
        <p className="text-muted-foreground">
          Manage patients across different specialties
        </p>
      </div>

      {/* Specialty Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Specialty)}
        className="space-y-6"
      >
        <div className="overflow-x-auto">
          <TabsList className="flex flex-wrap w-full justify-start gap-1 h-auto p-1">
            {specialtyTabs.map((specialty) => (
              <TabsTrigger
                key={specialty}
                value={specialty}
                className="text-xs whitespace-nowrap px-3 py-2 flex-shrink-0"
              >
                {specialty}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {specialtyTabs.map((specialty) => (
          <TabsContent key={specialty} value={specialty}>
            {renderSpecialtyContent(specialty)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
