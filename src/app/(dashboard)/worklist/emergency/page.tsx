"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Clock, Plus, Play, CheckCircle, FileText, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  usePatients, 
  useCreatePatientOptimistic, 
  useUpdatePatientStatusMutation,
  useBackgroundRefreshPatients 
} from "@/hooks/usePatients";
import { useProfile } from "@/hooks/useAuth";

// Type definitions
type Gender = 'M' | 'F' | 'O';
type Priority = 'Critical' | 'Urgent' | 'Routine';
type Status = 'Waiting' | 'In Progress' | 'Completed';

// Skeleton Components (optimized with React.memo)
const StatCardSkeleton = () => (
  <div className="text-center">
    <Skeleton className="h-8 w-8 mx-auto mb-1" />
    <Skeleton className="h-4 w-16 mx-auto" />
  </div>
);

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </TableCell>
  </TableRow>
);

const EmptyTableRow = () => (
  <TableRow>
    <TableCell colSpan={7} className="text-center py-12">
      <div className="flex flex-col items-center justify-center text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No patients in queue</h3>
        <p className="text-sm">Add a new patient to get started</p>
      </div>
    </TableCell>
  </TableRow>
);

export default function EmergencyWorklistPage() {
  // Get hospitalId from profile
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const hospitalId = profile?.hospital?.id;

  // Always filter by patientType: 'EMERGENCY' for this worklist
  const patientsParams = useMemo(() => ({
    patientType: 'EMERGENCY' as const,
    status: undefined, // We'll filter in JS below for better performance
  }), []);

  // Form state
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    mrn: "",
    priority: "" as Priority | "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "" as Gender | "",
  });

  // Hooks with optimized parameters
  const {
    data: patientsResponse,
    isLoading,
    error: fetchError,
    refetch,
    isFetching,
  } = usePatients(hospitalId, patientsParams);

  const {
    mutate: createPatient,
    isPending: isCreating,
    error: createError,
  } = useCreatePatientOptimistic(hospitalId, patientsParams);

  const updateStatusMutation = useUpdatePatientStatusMutation(hospitalId, patientsParams);
  const { refreshInBackground } = useBackgroundRefreshPatients(hospitalId, patientsParams);

  // Memoized computed values for better performance
  const { patients, waitingCount, inProgressCount, sortedPatients } = useMemo(() => {
    const allPatients = patientsResponse?.data?.patients || [];
    const activePatients = allPatients.filter(
      (p) => p.status === "Waiting" || p.status === "In Progress"
    );

    const waiting = activePatients.filter((p) => p.status === "Waiting").length;
    const inProgress = activePatients.filter((p) => p.status === "In Progress").length;

    // Sort patients by priority and arrival time
    const sorted = [...activePatients].sort((a, b) => {
      const priorityOrder = { Critical: 0, Urgent: 1, Routine: 2 };
      const aPriority = priorityOrder[a.priority as Priority] ?? 3;
      const bPriority = priorityOrder[b.priority as Priority] ?? 3;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (
        new Date(a.arrivalTime || a.createdAt).getTime() -
        new Date(b.arrivalTime || b.createdAt).getTime()
      );
    });

    return {
      patients: activePatients,
      waitingCount: waiting,
      inProgressCount: inProgress,
      sortedPatients: sorted,
    };
  }, [patientsResponse?.data?.patients]);

  // Memoized utility functions
  const getPriorityColor = useMemo(() => (priority: Priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Urgent":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Routine":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getStatusColor = useMemo(() => (status: Status) => {
    switch (status) {
      case "Waiting":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-orange-100 text-orange-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const formatTime = useMemo(() => (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Optimized form handlers
  const addPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.mrn || 
        !newPatient.priority || !newPatient.dateOfBirth || !newPatient.gender) {
      return;
    }

    const patientData = {
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      mrn: newPatient.mrn,
      dateOfBirth: newPatient.dateOfBirth,
      gender: newPatient.gender as Gender,
      phone: newPatient.phoneNumber,
      priority: newPatient.priority as Priority,
      status: "Waiting" as Status,
      arrivalTime: new Date().toISOString(),
      patientType: "EMERGENCY",
    };

    createPatient(patientData, {
      onSuccess: () => {
        setNewPatient({
          firstName: "",
          lastName: "",
          mrn: "",
          priority: "",
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
        });
      },
    });
  };

  // Track which patient is being updated for loading state
  const [updatingPatientId, setUpdatingPatientId] = useState<string | null>(null);
  // Optimized status update with instant UI feedback and per-patient loading
  const updatePatientStatus = (patientId: string, newStatus: Status) => {
    updateStatusMutation.mutate(
      { patientId, status: newStatus },
      {
        onSettled: () => setUpdatingPatientId(null),
      }
    );
  };

  // Background refresh every 2 minutes for real-time updates
  useEffect(() => {
    if (!hospitalId) return;
    
    const interval = setInterval(() => {
      refreshInBackground();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [hospitalId, refreshInBackground]);

  // Loading state
  if (profileQuery.isLoading || !hospitalId) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
            <div className="mt-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MRN</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Arrival Time</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load patients: {fetchError.message}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with real-time stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Emergency Work List
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Manage real-time emergency patient queue
            {isFetching && (
              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {waitingCount}
            </div>
            <div className="text-sm text-muted-foreground">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {inProgressCount}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
        </div>
      </div>

      {/* Error Alert for Create Patient */}
      {createError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Add Patient Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Select
                value={newPatient.gender}
                onValueChange={(value: Gender) =>
                  setNewPatient((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="O">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="First Name"
                value={newPatient.firstName}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <Input
                placeholder="Last Name"
                value={newPatient.lastName}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>
            <div>
              <Input
                placeholder="Enter MRN"
                value={newPatient.mrn}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, mrn: e.target.value }))
                }
              />
            </div>
            <div>
              <Input
                placeholder="Phone Number"
                value={newPatient.phoneNumber}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <Input
                type="date"
                value={newPatient.dateOfBirth}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                }
              />
            </div>
            <div>
              <Select
                value={newPatient.priority}
                onValueChange={(value: Priority) =>
                  setNewPatient((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={addPatient}
              disabled={
                !newPatient.firstName ||
                !newPatient.lastName ||
                !newPatient.mrn ||
                !newPatient.priority ||
                !newPatient.dateOfBirth ||
                isCreating
              }
              className="w-full md:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding to Queue...
                </>
              ) : (
                "Add to Queue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Queue with optimized rendering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient Queue ({patients.length} patients)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MRN</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                ) : sortedPatients.length === 0 ? (
                  <EmptyTableRow />
                ) : (
                  sortedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.mrn}
                      </TableCell>
                      <TableCell>{patient.fullName}</TableCell>
                      <TableCell>
                        {patient.arrivalTime
                          ? formatTime(patient.arrivalTime)
                          : formatTime(patient.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getPriorityColor(patient.priority as Priority)}
                        >
                          {patient.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(patient.status as Status)}
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Per-patient loading state for status update */}
                        <div className="flex justify-end gap-2">
                          {patient.status === "Waiting" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUpdatingPatientId(patient.id);
                                updatePatientStatus(patient.id, "In Progress");
                              }}
                              className="flex items-center gap-1"
                              disabled={updatingPatientId === patient.id && updateStatusMutation.isPending}
                            >
                              {updatingPatientId === patient.id && updateStatusMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                              Start Visit
                            </Button>
                          )}
                          {patient.status === "In Progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUpdatingPatientId(patient.id);
                                updatePatientStatus(patient.id, "Completed");
                              }}
                              className="flex items-center gap-1"
                              disabled={updatingPatientId === patient.id && updateStatusMutation.isPending}
                            >
                              {updatingPatientId === patient.id && updateStatusMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Complete Visit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            View Records
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
