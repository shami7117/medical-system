"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import {
  Plus,
  Play,
  CheckCircle,
  FileText,
  ArrowRightLeft,
  Users,
  Building2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useActiveSpecialties, useCreateSpecialty } from '@/hooks/useSpecialties';
import { usePatients, useCreatePatientOptimistic } from '@/hooks/usePatients';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from "@/hooks/useAuth";

type VisitType = "Walk-in" | "Scheduled";
type Status = "Waiting" | "In Progress" | "Completed";

interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  specialtyName: string;
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalVisits: number;
  };
}

// Skeleton Components
const StatCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
    </CardContent>
  </Card>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
        <div className="flex gap-2 ml-auto">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const PageSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Add Patient Form Skeleton */}
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Filters Skeleton */}
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
      </CardContent>
    </Card>

    {/* Patient List Skeleton */}
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <TableSkeleton />
      </CardContent>
    </Card>
  </div>
);

export default function ClinicWorklistPage() {  
  
  // Get hospitalId from profile
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const hospitalId = profile?.hospital?.id;

  // API hooks
  const { data: specialties = [], isLoading: specialtiesLoading, error: specialtiesError } = useActiveSpecialties(hospitalId);
  const createSpecialtyMutation = useCreateSpecialty(hospitalId);

  // Dummy doctors data
  const [doctors] = useState<Doctor[]>([
    { id: "1", name: "Dr. Smith", specialtyId: "", specialtyName: "" },
    { id: "2", name: "Dr. Johnson", specialtyId: "", specialtyName: "" },
    { id: "3", name: "Dr. Williams", specialtyId: "", specialtyName: "" },
  ]);

  // Patients API integration
  const [patientsParams, setPatientsParams] = useState({
    patientType: 'CLINIC' as 'CLINIC',
    specialtyId: '',
  });
  
  const {
    data: patientsResponse,
    isLoading: isPatientsLoading,
    error: patientsError,
    refetch: refetchPatients,
    isFetching: isPatientsFetching,
  } = usePatients(hospitalId, patientsParams);

  const patients = patientsResponse?.data?.patients || [];
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  // Update patientsParams when selectedSpecialty changes
  useEffect(() => {
    if (selectedSpecialty) {
      setPatientsParams((prev) => ({ ...prev, specialtyId: selectedSpecialty }));
    }
  }, [selectedSpecialty]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const [newPatient, setNewPatient] = useState({
    mrn: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "M" | "F" | "O" | "",
    phoneNumber: "",
    priority: "Routine" as "Routine" | "Urgent" | "Critical",
    visitType: "" as VisitType | "",
    assignedDoctor: "",
  });

  const [newSpecialty, setNewSpecialty] = useState({
    name: "",
    description: "",
  });

  const [showAddSpecialty, setShowAddSpecialty] = useState(false);

  // Set default specialty when specialties load
  useEffect(() => {
    if (specialties.length > 0 && !selectedSpecialty) {
      setSelectedSpecialty(specialties[0].id);
    }
  }, [specialties, selectedSpecialty]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (specialtiesError) {
      toast.error("Failed to load specialties. Please try again.");
    }
  }, [specialtiesError]);

  useEffect(() => {
    if (patientsError) {
      toast.error("Failed to load patients. Please try again.");
    }
  }, [patientsError]);

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

  // Add patient via API with proper error handling
  const { mutate: createPatient, isPending: isCreating, error: createError } = useCreatePatientOptimistic(hospitalId, {});
const addPatient = () => {
  if (!newPatient.mrn || !newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth || !newPatient.gender || !newPatient.phoneNumber || !newPatient.priority|| !selectedSpecialty) {
    toast.error("Please fill in all required fields.");
    return;
  }

  const specialtyObj = specialties.find(s => s.id === selectedSpecialty);
  
  const doctorObj = doctors.find(d => d.name === newPatient.assignedDoctor);

  const patientData = {
    mrn: newPatient.mrn,
    firstName: newPatient.firstName,
    lastName: newPatient.lastName,
    dateOfBirth: newPatient.dateOfBirth,
    gender: newPatient.gender as 'M' | 'F' | 'O',
    phone: newPatient.phoneNumber,
    priority: newPatient.priority as 'Routine' | 'Urgent' | 'Critical',
    status: 'Waiting' as 'Waiting',
    arrivalTime: new Date().toISOString(),
    patientType: 'CLINIC',
    assignedDoctorId: doctorObj?.id,
    specialtyId: specialtyObj?.id,
  };

  createPatient(patientData, {
    onSuccess: () => {
      setNewPatient({
        mrn: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        priority: 'Routine',
        visitType: '',
        assignedDoctor: '',
      });
      toast.success(`${newPatient.firstName} ${newPatient.lastName} has been added to the worklist.`);
      refetchPatients();
    },
    onError: (error: any) => {
      console.error('Create patient error:', error);
      
      // The error message should now be properly extracted from the API
      let errorMessage = error?.message || "Failed to add patient. Please try again.";
      
      // Handle specific MRN duplicate error cases
      if (errorMessage.toLowerCase().includes("patient with this mrn already exists") || 
          errorMessage.toLowerCase().includes("mrn already exists")) {
        errorMessage = `A patient with MRN "${newPatient.mrn}" already exists. Please use a different MRN.`;
      }
          // alert(errorMessage);

      toast.error(errorMessage);
    },
  });
};
  const addSpecialty = async () => {
    if (!newSpecialty.name) {
      toast.error("Please enter a specialty name.");
      return;
    }

    try {
      await createSpecialtyMutation.mutateAsync({
        name: newSpecialty.name,
        description: newSpecialty.description || undefined,
      });
      
      setNewSpecialty({ name: "", description: "" });
      setShowAddSpecialty(false);
      
      toast.success(`${newSpecialty.name} has been added to the specialties list.`);
    } catch (error: any) {
      console.error('Failed to create specialty:', error);
      
      let errorMessage = "Failed to add specialty. Please try again.";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Update patient status with error handling
  const updatePatientStatus = (id: string, status: Status) => {
    // TODO: Implement API mutation for updating patient status
    // For now, just show a toast and refetch
    toast.success(`Patient status updated to ${status}`);
    refetchPatients();
  };

  const transferPatient = (id: string, newSpecialtyId: string) => {
    // TODO: Implement transfer patient logic
    toast.success("Patient has been transferred successfully.");
    refetchPatients();
  };

  const getFilteredPatients = () => {
    let filtered = patients;
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        (patient.fullName?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
         patient.firstName?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
         patient.lastName?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
         patient.mrn?.toLowerCase?.().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }
    return filtered;
  };

  const getSpecialtyStats = (specialtyId: string) => {
    const specialtyPatients = patients;
    return {
      waiting: specialtyPatients.filter((p) => p.status === "Waiting").length,
      inProgress: specialtyPatients.filter((p) => p.status === "In Progress").length,
      total: specialtyPatients.length,
    };
  };

  const currentSpecialty = specialties.find(s => s.id === selectedSpecialty);
  const currentStats = selectedSpecialty ? getSpecialtyStats(selectedSpecialty) : { waiting: 0, inProgress: 0, total: 0 };
  const filteredPatients = getFilteredPatients();

  // Show skeleton loader while loading
  if (specialtiesLoading || isPatientsLoading || !hospitalId) {
    return <PageSkeleton />;
  }

  // Handle error states
  if (specialtiesError || patientsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Failed to Load Data
            </h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the clinic data. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinic Work List</h1>
          <p className="text-muted-foreground">
            Manage patients across different specialties
          </p>
        </div>
        
        {/* Specialty Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{specialty.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {getSpecialtyStats(specialty.id).total}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Add Specialty Form */}
      {showAddSpecialty && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Specialty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Specialty Name"
                value={newSpecialty.name}
                onChange={(e) =>
                  setNewSpecialty((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Description (optional)"
                value={newSpecialty.description}
                onChange={(e) =>
                  setNewSpecialty((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="flex gap-2">
                <Button
                  onClick={addSpecialty}
                  disabled={!newSpecialty.name || createSpecialtyMutation.isPending}
                  className="flex-1"
                >
                  {createSpecialtyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddSpecialty(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentSpecialty && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentSpecialty.name}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Specialty</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentStats.waiting}
                  </div>
                  <div className="text-sm text-muted-foreground">Waiting</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentStats.inProgress}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentStats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Patient Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Patient to {currentSpecialty.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Enter MRN"
                  value={newPatient.mrn}
                  onChange={(e) =>
                    setNewPatient((prev) => ({ ...prev, mrn: e.target.value }))
                  }
                />
                <Input
                  placeholder="First Name"
                  value={newPatient.firstName}
                  onChange={(e) =>
                    setNewPatient((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={newPatient.lastName}
                  onChange={(e) =>
                    setNewPatient((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  value={newPatient.dateOfBirth}
                  onChange={(e) =>
                    setNewPatient((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                  }
                />
                <Select
                  value={newPatient.gender}
                  onValueChange={(value: "M" | "F" | "O") =>
                    setNewPatient((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Phone Number"
                  value={newPatient.phoneNumber}
                  onChange={(e) =>
                    setNewPatient((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                />
                <Select
                  value={newPatient.priority}
                  onValueChange={(value: "Routine" | "Urgent" | "Critical") =>
                    setNewPatient((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={addPatient}
                  disabled={
                    !newPatient.mrn ||
                    !newPatient.firstName ||
                    !newPatient.lastName ||
                    !newPatient.dateOfBirth ||
                    !newPatient.gender ||
                    !newPatient.phoneNumber ||
                    !newPatient.priority ||
                    isCreating
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Patient"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients by name or MRN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={(value: Status | "All") => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {currentSpecialty.name} Patients ({filteredPatients.length})
                {isPatientsFetching && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {patients.length === 0 
                    ? `No patients in ${currentSpecialty.name}`
                    : "No patients match your search criteria"
                  }
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>MRN</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.mrn}
                          </TableCell>
                          <TableCell>{patient.fullName || `${patient.firstName} ${patient.lastName}`}</TableCell>
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
        </>
      )}
    </div>
  );
}