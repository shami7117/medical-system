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
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  User,
  Activity,
  Stethoscope,
  Heart,
  Bone,
  Microscope,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
}

interface SpecialtyConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  fields: SpecialtyField[];
}

interface SpecialtyField {
  id: string;
  label: string;
  type: "text" | "select" | "textarea" | "number";
  placeholder?: string;
  options?: string[];
}

interface ClinicVitalsPageProps {
  params: Promise<{
    speciality: string;
  }>;
}

const ClinicVitalsPage: React.FC<ClinicVitalsPageProps> = ({ params }) => {
  const [speciality, setSpeciality] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [timestamp, setTimestamp] = useState<string>("");

  // General vitals state
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    respiratory: "",
    temperature: "",
    oxygenSat: "",
  });

  // Specialty-specific vitals state
  const [specialtyVitals, setSpecialtyVitals] = useState<
    Record<string, string>
  >({});

  // Mock patient data
  const patients: Patient[] = [
    { id: "1", name: "Alice Wilson", age: 58, mrn: "MRN002001" },
    { id: "2", name: "Robert Davis", age: 34, mrn: "MRN002002" },
    { id: "3", name: "Maria Garcia", age: 41, mrn: "MRN002003" },
  ];

  // Specialty configurations
  const specialtyConfigs: Record<string, SpecialtyConfig> = {
    cardiology: {
      name: "Cardiology",
      icon: <Heart className="h-5 w-5" />,
      color: "text-red-600",
      fields: [
        {
          id: "ecg_rhythm",
          label: "ECG Rhythm",
          type: "text",
          placeholder: "Normal sinus rhythm",
        },
        {
          id: "heart_sounds",
          label: "Heart Sounds",
          type: "select",
          options: [
            "Normal",
            "S3 Gallop",
            "S4 Gallop",
            "Murmur Present",
            "Irregular",
          ],
        },
        {
          id: "chest_pain_scale",
          label: "Chest Pain Scale (0-10)",
          type: "number",
          placeholder: "0",
        },
      ],
    },
    orthopaedics: {
      name: "Orthopaedics",
      icon: <Bone className="h-5 w-5" />,
      color: "text-amber-600",
      fields: [
        {
          id: "range_of_motion",
          label: "Range of Motion",
          type: "textarea",
          placeholder: "Flexion: 90°, Extension: 0°, Abduction: 45°",
        },
        {
          id: "strength_testing",
          label: "Strength Testing",
          type: "select",
          options: [
            "5/5 Normal",
            "4/5 Good",
            "3/5 Fair",
            "2/5 Poor",
            "1/5 Trace",
            "0/5 None",
          ],
        },
        {
          id: "pain_level",
          label: "Pain Level (0-10)",
          type: "number",
          placeholder: "0",
        },
      ],
    },
    dermatology: {
      name: "Dermatology",
      icon: <Microscope className="h-5 w-5" />,
      color: "text-green-600",
      fields: [
        {
          id: "lesion_size",
          label: "Primary Lesion Size (mm)",
          type: "text",
          placeholder: "5x3 mm",
        },
        {
          id: "lesion_type",
          label: "Lesion Type",
          type: "select",
          options: [
            "Macule",
            "Papule",
            "Plaque",
            "Nodule",
            "Vesicle",
            "Pustule",
            "Ulcer",
          ],
        },
        {
          id: "skin_condition",
          label: "Overall Skin Condition",
          type: "textarea",
          placeholder: "Describe skin appearance, color, texture...",
        },
      ],
    },
    general: {
      name: "General Medicine",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "text-blue-600",
      fields: [
        {
          id: "general_appearance",
          label: "General Appearance",
          type: "select",
          options: [
            "Well-appearing",
            "Acute distress",
            "Chronic illness",
            "Anxious",
            "Lethargic",
          ],
        },
        {
          id: "chief_complaint",
          label: "Chief Complaint Notes",
          type: "textarea",
          placeholder: "Additional notes about primary concern...",
        },
      ],
    },
  };

  useEffect(() => {
    // Resolve the params Promise and set speciality
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSpeciality(resolvedParams.speciality);
      console.log("Specialty:", resolvedParams.speciality);
    };

    resolveParams();

    // Auto-populate timestamp
    const now = new Date();
    setTimestamp(now.toLocaleString());
  }, [params]);

  // Get current specialty configuration
  const currentSpecialty = speciality || "general";
  const config = specialtyConfigs[currentSpecialty] || specialtyConfigs.general;

  const handleVitalChange = (field: string, value: string) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtyVitalChange = (field: string, value: string) => {
    setSpecialtyVitals((prev) => ({
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
      specialty: currentSpecialty,
      vitals,
      specialtyVitals,
      timestamp,
      tempUnit,
    });
    alert("Vitals saved successfully!");
  };

  const handleCompleteVisit = () => {
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    console.log("Completing visit for:", selectedPatient);
    alert("Visit completed successfully!");
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  const renderSpecialtyField = (field: SpecialtyField) => {
    const value = specialtyVitals[field.id] || "";

    switch (field.type) {
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleSpecialtyVitalChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              handleSpecialtyVitalChange(field.id, e.target.value)
            }
            rows={3}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              handleSpecialtyVitalChange(field.id, e.target.value)
            }
            className="text-center"
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              handleSpecialtyVitalChange(field.id, e.target.value)
            }
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={config.color}>{config.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {config.name} Clinic
            </h1>
            <p className="text-gray-600">Vital Signs & Specialty Assessment</p>
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
                  <Badge
                    variant="outline"
                    className={`text-sm ${config.color}`}
                  >
                    {config.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* General Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              General Vital Signs
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
                        handleVitalChange("systolic", e.target.value)
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
                        handleVitalChange("diastolic", e.target.value)
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
                  onChange={(e) => handleVitalChange("pulse", e.target.value)}
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
                    handleVitalChange("respiratory", e.target.value)
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
                        handleVitalChange("temperature", e.target.value)
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
                    handleVitalChange("oxygenSat", e.target.value)
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
          </CardContent>
        </Card>

        {/* Specialty-Specific Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={config.color}>{config.icon}</div>
              {config.name}-Specific Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-semibold text-gray-700"
                  >
                    {field.label}
                  </Label>
                  {renderSpecialtyField(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveVitals}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
            disabled={!selectedPatient}
          >
            Save Vitals
          </Button>
          <Button
            onClick={handleCompleteVisit}
            variant="default"
            className="bg-green-600 hover:bg-green-700 flex-1"
            disabled={!selectedPatient}
          >
            Complete Visit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicVitalsPage;
