"use client";

import React, { useState } from "react";
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
// Using built-in table styling with Tailwind
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Eye, Trash2, AlertCircle } from "lucide-react";

// Mock data - replace with actual API calls
const mockPatients = [
  { id: "1", name: "John Doe", mrn: "MRN001" },
  { id: "2", name: "Jane Smith", mrn: "MRN002" },
  { id: "3", name: "Robert Johnson", mrn: "MRN003" },
];

const mockResults = [
  {
    id: "1",
    patientId: "1",
    patientName: "John Doe",
    fileName: "chest_xray_20240601.pdf",
    category: "Radiology",
    notes: "Chest X-ray shows clear lungs",
    uploadTime: "2024-06-01 14:30",
    uploadedBy: "Dr. Smith",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Jane Smith",
    fileName: "ecg_results.pdf",
    category: "ECG",
    notes: "Normal sinus rhythm",
    uploadTime: "2024-06-01 13:15",
    uploadedBy: "Nurse Johnson",
  },
  {
    id: "3",
    patientId: "1",
    patientName: "John Doe",
    fileName: "blood_work_results.pdf",
    category: "Lab",
    notes: "",
    uploadTime: "2024-06-01 12:00",
    uploadedBy: "Lab Tech",
  },
];

const resultCategories = ["Lab", "Radiology", "ECG", "Other"];

const getCategoryColor = (category: string) => {
  const colors = {
    Lab: "bg-blue-100 text-blue-800",
    Radiology: "bg-green-100 text-green-800",
    ECG: "bg-purple-100 text-purple-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[category as keyof typeof colors] || colors.Other;
};

export default function EmergencyResultsPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState(mockResults);
  const [isUploading, setIsUploading] = useState(false);

  // Mock hospital info - replace with actual auth data
  const hospitalName = "St. Mary's General Hospital";
  const hospitalId = "hospital_123";

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
      const patient = mockPatients.find((p) => p.id === selectedPatient);
      const newResult = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        patientName: patient?.name || "",
        fileName: selectedFile.name,
        category: selectedCategory,
        notes: notes,
        uploadTime: new Date().toLocaleString(),
        uploadedBy: "Current User",
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
              <h1 className="text-2xl font-bold text-gray-900">
                Emergency Results
              </h1>
              <p className="text-gray-600 mt-1">
                {hospitalName} - Emergency Department
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              Hospital ID: {hospitalId}
            </Badge>
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
              Upload medical results for emergency department patients
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
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {resultCategories.map((category) => (
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
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about the result..."
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
              Recent Results
            </CardTitle>
            <CardDescription>
              View and manage uploaded results for emergency patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  Upload your first result to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
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
                    {results.map((result) => (
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
                          <Badge className={getCategoryColor(result.category)}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
