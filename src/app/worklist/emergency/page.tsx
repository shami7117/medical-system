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
import { Clock, Plus, Play, CheckCircle, FileText } from "lucide-react";

type Priority = "Critical" | "Urgent" | "Routine";
type Status = "Waiting" | "In Progress" | "Completed";

interface Patient {
  id: string;
  mrn: string;
  name: string;
  arrivalTime: string;
  priority: Priority;
  status: Status;
}

export default function EmergencyWorklistPage() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      mrn: "MRN001",
      name: "John Smith",
      arrivalTime: "14:30",
      priority: "Critical",
      status: "Waiting",
    },
    {
      id: "2",
      mrn: "MRN002",
      name: "Sarah Johnson",
      arrivalTime: "14:45",
      priority: "Urgent",
      status: "In Progress",
    },
    {
      id: "3",
      mrn: "MRN003",
      name: "Michael Brown",
      arrivalTime: "15:10",
      priority: "Routine",
      status: "Waiting",
    },
  ]);

  const [newPatient, setNewPatient] = useState({
    mrn: "",
    priority: "" as Priority | "",
  });

  const getPriorityColor = (priority: Priority) => {
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
  };

  const getStatusColor = (status: Status) => {
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
  };

  const addPatient = () => {
    if (!newPatient.mrn || !newPatient.priority) return;

    const patient: Patient = {
      id: Date.now().toString(),
      mrn: newPatient.mrn,
      name: `Patient ${newPatient.mrn}`,
      arrivalTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      priority: newPatient.priority,
      status: "Waiting",
    };

    setPatients((prev) => [...prev, patient]);
    setNewPatient({ mrn: "", priority: "" });
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

  const waitingCount = patients.filter((p) => p.status === "Waiting").length;
  const inProgressCount = patients.filter(
    (p) => p.status === "In Progress"
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Emergency Work List
          </h1>
          <p className="text-muted-foreground">
            Manage real-time emergency patient queue
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

      {/* Add Patient Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter MRN"
                value={newPatient.mrn}
                onChange={(e) =>
                  setNewPatient((prev) => ({ ...prev, mrn: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <Select
                value={newPatient.priority}
                onValueChange={(value: Priority) =>
                  setNewPatient((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addPatient}
              disabled={!newPatient.mrn || !newPatient.priority}
              className="sm:w-auto w-full"
            >
              Add to Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patients in queue
            </div>
          ) : (
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
                  {patients
                    .sort((a, b) => {
                      const priorityOrder = {
                        Critical: 0,
                        Urgent: 1,
                        Routine: 2,
                      };
                      return (
                        priorityOrder[a.priority] - priorityOrder[b.priority]
                      );
                    })
                    .map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.mrn}
                        </TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.arrivalTime}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getPriorityColor(patient.priority)}
                          >
                            {patient.priority}
                          </Badge>
                        </TableCell>
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
                                Start Visit
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
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
