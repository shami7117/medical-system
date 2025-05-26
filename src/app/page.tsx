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
import {
  AlertTriangle,
  Stethoscope,
  Users,
  Clock,
  Activity,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface Stats {
  activePatients: number;
  pendingResults: number;
  emergencyQueue: number;
  clinicQueue: number;
}

interface ActivityItem {
  id: number;
  patient: string;
  action: string;
  time: string;
  type: "clinic" | "emergency";
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [stats] = useState<Stats>({
    activePatients: 127,
    pendingResults: 23,
    emergencyQueue: 8,
    clinicQueue: 45,
  });

  const [recentActivity] = useState<ActivityItem[]>([
    {
      id: 1,
      patient: "Sarah Johnson",
      action: "Check-in completed",
      time: "2 min ago",
      type: "clinic",
    },
    {
      id: 2,
      patient: "Michael Chen",
      action: "Lab results ready",
      time: "5 min ago",
      type: "emergency",
    },
    {
      id: 3,
      patient: "Emma Davis",
      action: "Appointment scheduled",
      time: "8 min ago",
      type: "clinic",
    },
    {
      id: 4,
      patient: "James Wilson",
      action: "Triage completed",
      time: "12 min ago",
      type: "emergency",
    },
    {
      id: 5,
      patient: "Lisa Anderson",
      action: "Prescription filled",
      time: "15 min ago",
      type: "clinic",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSectionNavigation = (section: "emergency" | "clinic"): void => {
    console.log(`Navigating to ${section} section`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  MedFlow Dashboard
                </h1>
                <p className="text-sm text-gray-500">Outpatient Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {formatTime(currentTime)}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Good morning, Dr. Smith
          </h2>
          <p className="text-gray-600">
            Here's what's happening in your hospital today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activePatients}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Results
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pendingResults}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Avg. 2.3 hours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Emergency Queue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.emergencyQueue}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Activity className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">2 critical cases</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Clinic Queue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.clinicQueue}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Calendar className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">Next: 10:30 AM</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emergency Section */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-red-800">
                <div className="bg-red-500 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                Emergency Department
              </CardTitle>
              <CardDescription className="text-red-700">
                Manage urgent care patient flow and critical cases
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current queue</span>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.emergencyQueue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Critical cases</span>
                  <span className="text-lg font-semibold text-red-800">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. wait time</span>
                  <span className="text-lg font-semibold text-gray-700">
                    15 min
                  </span>
                </div>
                <Button
                  onClick={() => handleSectionNavigation("emergency")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 group"
                >
                  Go to Emergency Section
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Section */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                Outpatient Clinic
              </CardTitle>
              <CardDescription className="text-blue-700">
                Manage scheduled appointments and routine consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current queue</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.clinicQueue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Today's appointments
                  </span>
                  <span className="text-lg font-semibold text-blue-800">
                    78
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Next appointment
                  </span>
                  <span className="text-lg font-semibold text-gray-700">
                    10:30 AM
                  </span>
                </div>
                <Button
                  onClick={() => handleSectionNavigation("clinic")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 group"
                >
                  Go to Clinic Section
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest patient interactions and system updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "emergency"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.patient}
                      </p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.type === "emergency"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {activity.type === "emergency" ? "Emergency" : "Clinic"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
              >
                View All Activity
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
