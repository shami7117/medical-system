"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
  Stethoscope,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";

// Mock data - replace with actual API calls
const mockPatients = {
  cardiology: [
    { id: "1", name: "John Doe", mrn: "MRN001", condition: "Hypertension" },
    { id: "2", name: "Mary Johnson", mrn: "MRN004", condition: "Arrhythmia" },
  ],
  orthopedics: [
    { id: "3", name: "Robert Smith", mrn: "MRN005", condition: "Knee Pain" },
    {
      id: "4",
      name: "Lisa Brown",
      mrn: "MRN006",
      condition: "Shoulder Injury",
    },
  ],
  neurology: [
    { id: "5", name: "David Wilson", mrn: "MRN007", condition: "Migraine" },
    {
      id: "6",
      name: "Sarah Davis",
      mrn: "MRN008",
      condition: "Seizure Disorder",
    },
  ],
};

const specialtyResultCategories = {
  cardiology: [
    "ECG",
    "Echocardiogram",
    "Stress Test",
    "Cardiac MRI",
    "Lab Results",
    "Other",
  ],
  orthopedics: [
    "X-Ray",
    "MRI",
    "CT Scan",
    "Bone Scan",
    "Arthroscopy Results",
    "Lab Results",
    "Other",
  ],
  neurology: [
    "MRI",
    "CT Scan",
    "EEG",
    "EMG",
    "Lumbar Puncture",
    "Lab Results",
    "Other",
  ],
  default: ["Lab Results", "Imaging", "Pathology", "Other"],
};

const mockResults = [
  {
    id: "1",
    patientId: "1",
    patientName: "John Doe",
    fileName: "ecg_results_20240601.pdf",
    category: "ECG",
    notes: "Normal sinus rhythm, no abnormalities detected",
    uploadTime: "2024-06-01 10:30",
    uploadedBy: "Dr. Anderson",
    specialty: "cardiology",
  },
  {
    id: "2",
    patientId: "3",
    patientName: "Robert Smith",
    fileName: "knee_xray_lateral.pdf",
    category: "X-Ray",
    notes: "Lateral view shows mild osteoarthritis",
    uploadTime: "2024-06-01 09:15",
    uploadedBy: "Dr. Martinez",
    specialty: "orthopedics",
  },
  {
    id: "3",
    patientId: "5",
    patientName: "David Wilson",
    fileName: "brain_mri_results.pdf",
    category: "MRI",
    notes: "No acute findings, follow-up recommended",
    uploadTime: "2024-05-31 16:45",
    uploadedBy: "Dr. Chen",
    specialty: "neurology",
  },
];

const getCategoryColor = (category: string) => {
  const colors = {
    ECG: "bg-red-100 text-red-800",
    Echocardiogram: "bg-pink-100 text-pink-800",
    "X-Ray": "bg-blue-100 text-blue-800",
    MRI: "bg-purple-100 text-purple-800",
    "CT Scan": "bg-indigo-100 text-indigo-800",
    EEG: "bg-green-100 text-green-800",
    "Lab Results": "bg-yellow-100 text-yellow-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[category as keyof typeof colors] || colors.Other;
};

const getSpecialtyIcon = (specialty: string) => {
  const icons = {
    cardiology: "❤️",
    orthopedics: "🦴",
    neurology: "🧠",
    default: "🏥",
  };
  return icons[specialty as keyof typeof icons] || icons.default;
};

const getSpecialtyName = (specialty: string) => {
  const names = {
    cardiology: "Cardiology",
    orthopedics: "Orthopedics",
    neurology: "Neurology",
  };
  return (
    names[specialty as keyof typeof names] ||
    specialty.charAt(0).toUpperCase() + specialty.slice(1)
  );
};

export default function ClinicResultsPage() {
  // Simulate getting specialty from URL params
  const params = useParams();
  const specialty = (params.specialty as string) || "general-medicine"; // Get specialty from URL params

  const [currentSpecialty] = useState<string>(specialty); // In production: useParams() or useRouter()
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState(mockResults);
  const [isUploading, setIsUploading] = useState(false);

  // Mock hospital info - replace with actual auth data
  const hospitalName = "St. Mary's General Hospital";
  const hospitalId = "hospital_123";

  // Get specialty-specific data
  const specialtyPatients =
    mockPatients[currentSpecialty as keyof typeof mockPatients] || [];
  const specialtyCategories =
    specialtyResultCategories[
      currentSpecialty as keyof typeof specialtyResultCategories
    ] || specialtyResultCategories.default;
  const specialtyResults = results.filter(
    (r) => r.specialty === currentSpecialty
  );

  useEffect(() => {
    // Reset form when specialty changes
    setSelectedPatient("");
    setSelectedCategory("");
    setNotes("");
    setSelectedFile(null);
  }, [currentSpecialty]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedPatient || !selectedCategory || !selectedFile) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const patient = specialtyPatients.find((p) => p.id === selectedPatient);
      const newResult = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        patientName: patient?.name || "",
        fileName: selectedFile.name,
        category: selectedCategory,
        notes: notes,
        uploadTime: new Date().toLocaleString(),
        uploadedBy: "Current User",
        specialty: currentSpecialty,
      };

      setResults([newResult, ...results]);

      // Reset form
      setSelectedPatient("");
      setSelectedCategory("");
      setNotes("");
      setSelectedFile(null);
      setIsUploading(false);

      // Reset file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 1000);
  };

  const handleDelete = (resultId: string) => {
    if (confirm("Are you sure you want to delete this result?")) {
      setResults(results.filter((r) => r.id !== resultId));
    }
  };

  const handleView = (result: any) => {
    // In production, this would open the file in a new tab or modal
    alert(`Viewing: ${result.fileName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {getSpecialtyIcon(currentSpecialty)}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getSpecialtyName(currentSpecialty)} Results
                </h1>
              </div>
              <p className="text-gray-600">
                {hospitalName} - {getSpecialtyName(currentSpecialty)} Department
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge variant="outline" className="w-fit">
                Specialty: {getSpecialtyName(currentSpecialty)}
              </Badge>
              <Badge variant="outline" className="w-fit">
                Hospital ID: {hospitalId}
              </Badge>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Result
            </CardTitle>
            <CardDescription>
              Upload medical results for{" "}
              {getSpecialtyName(currentSpecialty).toLowerCase()} patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient-select">Patient *</Label>
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.mrn}) - {patient.condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {specialtyPatients.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No patients found for this specialty
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category-select">Result Category *</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-input">Upload File *</Label>
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, JPG, PNG, DICOM (Max 25MB)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add clinical notes, observations, or interpretation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                !selectedPatient ||
                !selectedCategory ||
                !selectedFile
              }
              className="w-full md:w-auto"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Result
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {getSpecialtyName(currentSpecialty)} Results
            </CardTitle>
            <CardDescription>
              View and manage uploaded results for{" "}
              {getSpecialtyName(currentSpecialty).toLowerCase()} patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specialtyResults.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  Upload your first{" "}
                  {getSpecialtyName(currentSpecialty).toLowerCase()} result to
                  get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results Grid for better mobile experience */}
                <div className="grid gap-4 md:hidden">
                  {specialtyResults.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{result.patientName}</h4>
                          <Badge className={getCategoryColor(result.category)}>
                            {result.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate">
                            {result.fileName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{result.uploadTime}</p>
                          <p>By: {result.uploadedBy}</p>
                          {result.notes && (
                            <p className="mt-1">Notes: {result.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(result)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Results Table for desktop */}
                <div className="hidden md:block overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Patient
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          File Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Upload Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Uploaded By
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {specialtyResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {result.patientName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span
                                className="truncate max-w-[200px]"
                                title={result.fileName}
                              >
                                {result.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={getCategoryColor(result.category)}
                            >
                              {result.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {result.uploadTime}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {result.uploadedBy}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-sm text-gray-600">
                            {result.notes || "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(result)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(result.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
