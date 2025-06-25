"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Bone,
  Sparkles,
  Baby,
  Eye,
  Ear,
  Brain,
  Stethoscope,
  Activity,
  Pill,
  Target,
  Users,
  Search,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveSpecialties, useCreateSpecialty } from '@/hooks/useSpecialties'
import { useProfile } from "@/hooks/useAuth";


// Mock data types
interface Specialty {
  id: string;
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  activePatients: number;
  color: string;
}

// Mock hospital context (in real app, this would come from auth/session)
const mockHospitalContext = {
  hospital_id: "hosp_001",
  hospital_name: "St. Mary's Medical Center",
};

// Mock specialty data with patient counts (filtered by hospital_id)
const mockSpecialties: Specialty[] = [
  {
    id: "card_001",
    name: "Cardiology",
    slug: "cardiology",
    icon: Heart,
    description: "Heart and cardiovascular care",
    activePatients: 45,
    color: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    id: "orth_001",
    name: "Orthopaedics",
    slug: "orthopaedics",
    icon: Bone,
    description: "Bone, joint, and muscle care",
    activePatients: 38,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "derm_001",
    name: "Dermatology",
    slug: "dermatology",
    icon: Sparkles,
    description: "Skin, hair, and nail care",
    activePatients: 29,
    color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
  },
  {
    id: "pedi_001",
    name: "Paediatrics",
    slug: "paediatrics",
    icon: Baby,
    description: "Specialized care for children",
    activePatients: 52,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    id: "opht_001",
    name: "Ophthalmology",
    slug: "ophthalmology",
    icon: Eye,
    description: "Eye and vision care",
    activePatients: 31,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    id: "ent_001",
    name: "ENT",
    slug: "ent",
    icon: Ear,
    description: "Ear, nose, and throat care",
    activePatients: 24,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    id: "neur_001",
    name: "Neurology",
    slug: "neurology",
    icon: Brain,
    description: "Brain and nervous system care",
    activePatients: 18,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  },
  {
    id: "pul_001",
    name: "Pulmonology",
    slug: "pulmonology",
    icon: Stethoscope,
    description: "Lung and respiratory care",
    activePatients: 27,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
  },
  {
    id: "endo_001",
    name: "Endocrinology",
    slug: "endocrinology",
    icon: Activity,
    description: "Hormone and gland disorders",
    activePatients: 35,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  },
  {
    id: "onc_001",
    name: "Oncology",
    slug: "oncology",
    icon: Target,
    description: "Cancer care and treatment",
    activePatients: 22,
    color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
  {
    id: "psy_001",
    name: "Psychiatry",
    slug: "psychiatry",
    icon: Users,
    description: "Mental health and wellness",
    activePatients: 41,
    color: "bg-violet-50 border-violet-200 hover:bg-violet-100",
  },
  {
    id: "uro_001",
    name: "Urology",
    slug: "urology",
    icon: Pill,
    description: "Urinary and reproductive health",
    activePatients: 19,
    color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
  },
  {
    id: "gas_001",
    name: "Gastroenterology",
    slug: "gastroenterology",
    icon: Activity,
    description: "Digestive system care",
    activePatients: 33,
    color: "bg-lime-50 border-lime-200 hover:bg-lime-100",
  },
  {
    id: "rheu_001",
    name: "Rheumatology",
    slug: "rheumatology",
    icon: Bone,
    description: "Joint and autoimmune disorders",
    activePatients: 16,
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
];

const ClinicOverviewPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const profileLoading = profileQuery.isLoading;
  const profileError = profileQuery.error;

  const hospitalId = profile?.hospital?.id || mockHospitalContext.hospital_id;
  const {
    data: specialties,
    isLoading,
    error,
    refetch,
  } = useActiveSpecialties(hospitalId, {
    enabled: !!hospitalId, // This will prevent the API call until hospitalId is available
  });
  const router = useRouter();

  // Use real specialties if available, otherwise fallback to mock
  const specialtiesList = specialties && specialties.length > 0 ? specialties : mockSpecialties;

  // Filter specialties based on search term
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return specialtiesList;
    return specialtiesList.filter(
      (specialty) =>
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (specialty.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, specialtiesList]);

  // Helper to get icon for a specialty
  const getSpecialtyIcon = (specialty: any) => specialty.icon || Heart;
  // Helper to get color for a specialty
  const getSpecialtyColor = (specialty: any) => specialty.color || 'bg-white border-gray-200';
  // Helper to get active patients count
  const getActivePatients = (specialty: any) =>
    typeof specialty.activePatients === 'number'
      ? specialty.activePatients
      : specialty.stats?.totalVisits ?? 0;

  // Calculate total active patients
  const totalActivePatients = specialtiesList.reduce(
    (sum, spec) => sum + getActivePatients(spec),
    0
  );

  // Handle specialty navigation
  const handleSpecialtyClick = (specialty: any) => {
    router.push(`/clinic/${specialty.slug || specialty.name.toLowerCase().replace(/\s+/g, '-')}/notes`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Clinic Overview
              </h1>
              <p className="text-gray-600 mt-1">
                {mockHospitalContext.hospital_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Active Patients</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalActivePatients}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredSpecialties.length} of {specialties?.length}{" "}
              specialties
            </p>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Specialties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSpecialties.map((specialty) => {
                const IconComponent = getSpecialtyIcon(specialty);
                return (
                  <TooltipProvider key={specialty.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card
                          className={`cursor-pointer transition-all duration-200 ${getSpecialtyColor(specialty)} hover:shadow-lg hover:scale-[1.02] group`}
                          onClick={() => handleSpecialtyClick(specialty)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <IconComponent className="h-6 w-6 text-gray-700" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg font-semibold text-gray-900">
                                    {specialty.name}
                                  </CardTitle>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-sm text-gray-600 mb-3">
                              {specialty?.description}
                            </CardDescription>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className="bg-white/60 text-gray-700"
                              >
                                {getActivePatients(specialty)} active patients
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs group-hover:bg-white/80 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSpecialtyClick(specialty);
                                }}
                              >
                                View →
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view {specialty.name} patient records</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredSpecialties.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No specialties found
                </h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              </div>
            )}
          </>
        )}

        {/* Quick Stats Footer */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {specialties?.length}
              </p>
              <p className="text-sm text-gray-600">Total Specialties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {totalActivePatients}
              </p>
              <p className="text-sm text-gray-600">Active Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(totalActivePatients / (specialties && specialties.length ? specialties.length : 1))}
              </p>
              <p className="text-sm text-gray-600">Avg per Specialty</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {specialties?.filter((s) => s?.stats.totalVisits > 30).length}
              </p>
              <p className="text-sm text-gray-600">High Volume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicOverviewPage;
