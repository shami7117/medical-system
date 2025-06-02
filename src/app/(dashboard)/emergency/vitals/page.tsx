"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Activity } from "lucide-react";

interface VitalReading {
  id: string;
  timestamp: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  respiratory: number;
  temperature: number;
  oxygenSat: number;
  tempUnit: "C" | "F";
}

interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
}

const EmergencyVitalsPage: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [timestamp, setTimestamp] = useState<string>("");

  // Form state
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    respiratory: "",
    temperature: "",
    oxygenSat: "",
  });

  // Mock patient data
  const patients: Patient[] = [
    { id: "1", name: "John Smith", age: 45, mrn: "MRN001234" },
    { id: "2", name: "Sarah Johnson", age: 32, mrn: "MRN001235" },
    { id: "3", name: "Michael Brown", age: 67, mrn: "MRN001236" },
  ];

  // Mock historical readings
  const recentReadings: VitalReading[] = [
    {
      id: "1",
      timestamp: "14:30",
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      respiratory: 16,
      temperature: 36.5,
      oxygenSat: 98,
      tempUnit: "C",
    },
    {
      id: "2",
      timestamp: "14:15",
      systolic: 118,
      diastolic: 78,
      pulse: 75,
      respiratory: 18,
      temperature: 36.8,
      oxygenSat: 97,
      tempUnit: "C",
    },
    {
      id: "3",
      timestamp: "14:00",
      systolic: 125,
      diastolic: 82,
      pulse: 68,
      respiratory: 16,
      temperature: 36.4,
      oxygenSat: 99,
      tempUnit: "C",
    },
  ];

  useEffect(() => {
    // Auto-populate timestamp
    const now = new Date();
    setTimestamp(now.toLocaleString());
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveVitals = () => {
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    console.log("Saving vitals:", {
      patient: selectedPatient,
      vitals,
      timestamp,
      tempUnit,
    });
    alert("Vitals saved successfully!");

    // Reset form
    setVitals({
      systolic: "",
      diastolic: "",
      pulse: "",
      respiratory: "",
      temperature: "",
      oxygenSat: "",
    });
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Emergency Department
            </h1>
            <p className="text-gray-600">Vital Signs Recording</p>
          </div>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-select">Select Patient</Label>
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age}) - {patient.mrn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatientData && (
                <div className="flex items-center gap-2 pt-6">
                  <Badge variant="secondary" className="text-sm">
                    {selectedPatientData.name}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    MRN: {selectedPatientData.mrn}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Blood Pressure */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Blood Pressure (mmHg)
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="systolic" className="text-xs text-gray-500">
                      Systolic
                    </Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={vitals.systolic}
                      onChange={(e) =>
                        handleInputChange("systolic", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="text-gray-400">/</span>
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="diastolic"
                      className="text-xs text-gray-500"
                    >
                      Diastolic
                    </Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={vitals.diastolic}
                      onChange={(e) =>
                        handleInputChange("diastolic", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Pulse Rate */}
              <div className="space-y-2">
                <Label
                  htmlFor="pulse"
                  className="text-sm font-semibold text-gray-700"
                >
                  Pulse Rate (BPM)
                </Label>
                <Input
                  id="pulse"
                  type="number"
                  placeholder="72"
                  value={vitals.pulse}
                  onChange={(e) => handleInputChange("pulse", e.target.value)}
                  className="text-center"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-2">
                <Label
                  htmlFor="respiratory"
                  className="text-sm font-semibold text-gray-700"
                >
                  Respiratory Rate (/min)
                </Label>
                <Input
                  id="respiratory"
                  type="number"
                  placeholder="16"
                  value={vitals.respiratory}
                  onChange={(e) =>
                    handleInputChange("respiratory", e.target.value)
                  }
                  className="text-center"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Temperature
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={vitals.temperature}
                      onChange={(e) =>
                        handleInputChange("temperature", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                  <Select
                    value={tempUnit}
                    onValueChange={(value: "C" | "F") => setTempUnit(value)}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">°C</SelectItem>
                      <SelectItem value="F">°F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Oxygen Saturation */}
              <div className="space-y-2">
                <Label
                  htmlFor="oxygen"
                  className="text-sm font-semibold text-gray-700"
                >
                  Oxygen Saturation (%)
                </Label>
                <Input
                  id="oxygen"
                  type="number"
                  placeholder="98"
                  value={vitals.oxygenSat}
                  onChange={(e) =>
                    handleInputChange("oxygenSat", e.target.value)
                  }
                  className="text-center"
                />
              </div>

              {/* Timestamp */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Timestamp
                </Label>
                <Input
                  value={timestamp}
                  readOnly
                  className="bg-gray-50 text-center"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                onClick={handleSaveVitals}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
                disabled={!selectedPatient}
              >
                Save Vitals
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={!selectedPatient}
              >
                Go to Next Section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Readings */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last 3 Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReadings.map((reading) => (
                  <div
                    key={reading.id}
                    className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <Badge variant="secondary">{reading.timestamp}</Badge>
                    <span className="text-sm">
                      BP: {reading.systolic}/{reading.diastolic}
                    </span>
                    <span className="text-sm">Pulse: {reading.pulse}</span>
                    <span className="text-sm">Resp: {reading.respiratory}</span>
                    <span className="text-sm">
                      Temp: {reading.temperature}°{reading.tempUnit}
                    </span>
                    <span className="text-sm">O2: {reading.oxygenSat}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmergencyVitalsPage;
