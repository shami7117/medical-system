"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

interface HospitalData {
  hospitalName: string;
  hospitalCode: string;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminEmployeeId: string;
}

interface FormErrors {
  hospitalName?: string;
  hospitalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminEmployeeId?: string;
}

export default function MultiTenantSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HospitalData>({
    hospitalName: "",
    hospitalCode: "",
    address: "",
    phone: "",
    email: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminEmployeeId: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep1 = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = "Hospital name is required";
    }

    if (!formData.hospitalCode.trim()) {
      newErrors.hospitalCode = "Hospital code is required";
    } else if (formData.hospitalCode.length < 3) {
      newErrors.hospitalCode = "Hospital code must be at least 3 characters";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Hospital address is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Hospital email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const validateStep2 = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.adminName.trim()) {
      newErrors.adminName = "Admin name is required";
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address";
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required";
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters";
    }

    if (!formData.adminEmployeeId.trim()) {
      newErrors.adminEmployeeId = "Employee ID is required";
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep1();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    const newErrors = validateStep2();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Hospital registration submitted:", formData);
      setIsSubmitting(false);
      setCurrentStep(3);
    }, 2000);
  };

  const renderStep1 = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Building2 className="h-5 w-5" />
          Hospital Registration
        </CardTitle>
        <CardDescription className="text-center">
          Step 1 of 2: Hospital Information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              type="text"
              placeholder="Enter hospital name"
              value={formData.hospitalName}
              onChange={handleInputChange}
              className={
                errors.hospitalName ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.hospitalName && (
              <p className="text-sm text-red-600">{errors.hospitalName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalCode">Hospital Code</Label>
            <Input
              id="hospitalCode"
              name="hospitalCode"
              type="text"
              placeholder="Unique hospital identifier (e.g., MFH001)"
              value={formData.hospitalCode}
              onChange={handleInputChange}
              className={
                errors.hospitalCode ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.hospitalCode && (
              <p className="text-sm text-red-600">{errors.hospitalCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Hospital Address</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Enter complete hospital address"
              value={formData.address}
              onChange={handleInputChange}
              className={
                errors.address ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Hospital contact number"
              value={formData.phone}
              onChange={handleInputChange}
              className={
                errors.phone ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Hospital Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Official hospital email"
              value={formData.email}
              onChange={handleInputChange}
              className={
                errors.email ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );

  const renderStep2 = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <UserPlus className="h-5 w-5" />
          Admin Account Setup
        </CardTitle>
        <CardDescription className="text-center">
          Step 2 of 2: Hospital Administrator Details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminName">Administrator Name</Label>
            <Input
              id="adminName"
              name="adminName"
              type="text"
              placeholder="Enter admin's full name"
              value={formData.adminName}
              onChange={handleInputChange}
              className={
                errors.adminName ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.adminName && (
              <p className="text-sm text-red-600">{errors.adminName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Administrator Email</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              placeholder="Admin's email address"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className={
                errors.adminEmail ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.adminEmail && (
              <p className="text-sm text-red-600">{errors.adminEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Password</Label>
            <Input
              id="adminPassword"
              name="adminPassword"
              type="password"
              placeholder="Create a secure password"
              value={formData.adminPassword}
              onChange={handleInputChange}
              className={
                errors.adminPassword ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.adminPassword && (
              <p className="text-sm text-red-600">{errors.adminPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmployeeId">Employee ID</Label>
            <Input
              id="adminEmployeeId"
              name="adminEmployeeId"
              type="text"
              placeholder="Administrator's employee ID"
              value={formData.adminEmployeeId}
              onChange={handleInputChange}
              className={
                errors.adminEmployeeId
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }
            />
            {errors.adminEmployeeId && (
              <p className="text-sm text-red-600">{errors.adminEmployeeId}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleBack} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? "Creating Account..." : "Create Hospital Account"}
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );

  const renderStep3 = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-green-600">
          <Check className="h-6 w-6" />
          Registration Successful!
        </CardTitle>
        <CardDescription className="text-center">
          Your hospital has been registered successfully
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <p className="text-sm text-green-700">
              Your registration is under review. You'll receive an email
              confirmation once approved. Hospital Code:{" "}
              <strong>{formData.hospitalCode}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Segai Hospital
          </h1>
          <p className="text-gray-600">Outpatient Management System</p>
        </div>

        {/* Progress Indicator */}
        {currentStep < 3 && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-xl border-0">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </Card>

        {currentStep < 3 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Login
              </a>
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 Segai Hospital. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
