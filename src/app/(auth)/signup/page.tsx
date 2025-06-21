"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface HospitalData {
  hospitalName: string;
  hospitalCode: string;
  address: string;
  phone: string;
  email: string;
  hospitalWebsite?: string;
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
  hospitalWebsite?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminEmployeeId?: string;
}

interface RegistrationResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
    hospital: {
      id: string;
      name: string;
      email: string;
    };
  };
}

// API function to register hospital
const registerHospital = async (
  data: HospitalData
): Promise<RegistrationResponse> => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hospitalName: data.hospitalName,
      hospitalCode: data.hospitalCode,
      hospitalAddress: data.address,
      hospitalPhone: data.phone,
      hospitalEmail: data.email,
      hospitalWebsite: data.hospitalWebsite,
      adminName: data.adminName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
      adminEmployeeId: data.adminEmployeeId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result.data;
};

export default function MultiTenantSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<HospitalData>({
    hospitalName: "",
    hospitalCode: "",
    address: "",
    phone: "",
    email: "",
    hospitalWebsite: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminEmployeeId: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [registrationData, setRegistrationData] =
    useState<RegistrationResponse | null>(null);

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

    // Clear API error when user makes changes
    if (apiError) {
      setApiError("");
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

    // Optional website validation
    if (formData.hospitalWebsite && formData.hospitalWebsite.trim()) {
      if (!/^https?:\/\/.+\..+/.test(formData.hospitalWebsite)) {
        newErrors.hospitalWebsite = "Please enter a valid website URL";
      }
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
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters";
    }

    if (!formData.adminEmployeeId.trim()) {
      newErrors.adminEmployeeId = "Employee ID is required";
    }

    return newErrors;
  };

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    if (type === "success") {
      setSuccessMessage(message);
      setApiError("");
    } else {
      setApiError(message);
      setSuccessMessage("");
    }
  };

  const handleNext = () => {
    const newErrors = validateStep1();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("Please fix the errors before proceeding", "error");
      return;
    }

    setErrors({});
    setCurrentStep(2);
    showNotification("Step 1 completed successfully!", "success");
  };

  const handleBack = () => {
    setCurrentStep(1);
    setApiError("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    const newErrors = validateStep2();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("Please fix the errors before submitting", "error");
      return;
    }

    setErrors({});
    setIsLoading(true);
    setApiError("");
    setSuccessMessage("");

    try {
      const result = await registerHospital(formData);

      // Store authentication data
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("user_data", JSON.stringify(result.user));

      setRegistrationData(result);
      setCurrentStep(3);
      showNotification("Hospital registered successfully!", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = "/dashboard";
  };

  // Notification Component
  const Notification = ({
    message,
    type,
  }: {
    message: string;
    type: "success" | "error";
  }) => {
    if (!message) return null;

    return (
      <div
        className={`p-4 rounded-lg flex items-center gap-2 mb-4 ${
          type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm">{message}</span>
      </div>
    );
  };

  // Move renderStep1, renderStep2, renderStep3 inside the component
  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-xl border-0">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-5 w-5" />
          Hospital Registration
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Step 1 of 2: Hospital Information
        </p>
      </div>
      <div className="p-6">
        <Notification message={apiError} type="error" />
        <Notification message={successMessage} type="success" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="hospitalName"
              className="text-sm font-medium text-gray-700"
            >
              Hospital Name
            </label>
            <input
              id="hospitalName"
              name="hospitalName"
              type="text"
              placeholder="Enter hospital name"
              value={formData.hospitalName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hospitalName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.hospitalName && (
              <p className="text-sm text-red-600">{errors.hospitalName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="hospitalCode"
              className="text-sm font-medium text-gray-700"
            >
              Hospital Code
            </label>
            <input
              id="hospitalCode"
              name="hospitalCode"
              type="text"
              placeholder="Unique hospital identifier (e.g., MFH001)"
              value={formData.hospitalCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hospitalCode
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.hospitalCode && (
              <p className="text-sm text-red-600">{errors.hospitalCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="text-sm font-medium text-gray-700"
            >
              Hospital Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Enter complete hospital address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Hospital contact number"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Hospital Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Official hospital email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="hospitalWebsite"
              className="text-sm font-medium text-gray-700"
            >
              Hospital Website (Optional)
            </label>
            <input
              id="hospitalWebsite"
              name="hospitalWebsite"
              type="url"
              placeholder="https://www.hospital.com"
              value={formData.hospitalWebsite}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hospitalWebsite
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.hospitalWebsite && (
              <p className="text-sm text-red-600">{errors.hospitalWebsite}</p>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-xl border-0">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2 mb-2">
          <UserPlus className="h-5 w-5" />
          Admin Account Setup
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Step 2 of 2: Hospital Administrator Details
        </p>
      </div>
      <div className="p-6">
        <Notification message={apiError} type="error" />
        <Notification message={successMessage} type="success" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="adminName"
              className="text-sm font-medium text-gray-700"
            >
              Administrator Name
            </label>
            <input
              id="adminName"
              name="adminName"
              type="text"
              placeholder="Enter admin's full name"
              value={formData.adminName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adminName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.adminName && (
              <p className="text-sm text-red-600">{errors.adminName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adminEmail"
              className="text-sm font-medium text-gray-700"
            >
              Administrator Email
            </label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              placeholder="Admin's email address"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adminEmail
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.adminEmail && (
              <p className="text-sm text-red-600">{errors.adminEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adminPassword"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="adminPassword"
              name="adminPassword"
              type="password"
              placeholder="Create a secure password (min 8 characters)"
              value={formData.adminPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adminPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.adminPassword && (
              <p className="text-sm text-red-600">{errors.adminPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adminEmployeeId"
              className="text-sm font-medium text-gray-700"
            >
              Employee ID
            </label>
            <input
              id="adminEmployeeId"
              name="adminEmployeeId"
              type="text"
              placeholder="Administrator's employee ID"
              value={formData.adminEmployeeId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adminEmployeeId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.adminEmployeeId && (
              <p className="text-sm text-red-600">{errors.adminEmployeeId}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Hospital Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-xl border-0">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-green-600 mb-2">
          <Check className="h-6 w-6" />
          Registration Successful!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your hospital has been registered successfully
        </p>
      </div>
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">
                Welcome to Segai Hospital System!
              </h3>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <p>
                Your hospital <strong>{formData.hospitalName}</strong> has been
                registered successfully!
              </p>
              <p>
                Hospital Code:{" "}
                <strong className="bg-green-100 px-2 py-1 rounded">
                  {formData.hospitalCode}
                </strong>
              </p>
              {registrationData && (
                <p>
                  Administrator: <strong>{registrationData.user.name}</strong> (
                  {registrationData.user.email})
                </p>
              )}
              <p className="mt-3">
                Default specialties have been created and you can now start
                managing your outpatient system.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Continue to Dashboard
            </button>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Complete your hospital profile</li>
                <li>• Add doctors and staff members</li>
                <li>• Configure appointment slots</li>
                <li>• Start managing patient appointments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
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
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 transition-colors ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Hospital Info</span>
              <span>Admin Setup</span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-700 font-medium">
                Creating your hospital account...
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Login Link */}
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

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 Segai Hospital. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
