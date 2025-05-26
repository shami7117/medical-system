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
import { LogIn, Building2, Eye, EyeOff } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt:", formData);
      setIsLoading(false);
      // Handle successful login here
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MedFlow Hospital
          </h1>
          <p className="text-gray-600">Outpatient Management System</p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pr-10 transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-top-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>Secure</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>HIPAA Compliant</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>24/7 Support</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            © 2025 MedFlow Hospital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
