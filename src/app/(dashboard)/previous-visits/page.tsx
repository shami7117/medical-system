'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, FileText, Activity, AlertCircle, ChevronDown, ChevronRight, Clock, Stethoscope, Pill, Heart, TrendingUp, Filter, Download, RefreshCw } from 'lucide-react';
import { useProfile } from '@/hooks/useAuth';
// Types
interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  occupation?: string;
  maritalStatus?: string;
  patientType: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface Visit {
  id: string;
  visitNumber: string;
  type: string;
  status: string;
  chiefComplaint?: string;
  createdAt: string;
  completedAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    employeeId?: string;
  };
  specialty?: {
    id: string;
    name: string;
    description?: string;
  };
  vitals?: Array<{
    id: string;
    temperature?: number;
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    painScore?: number;
    notes?: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  clinicalNotes?: Array<{
    id: string;
    title: string;
    content: string;
    noteType: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  progressNotes?: Array<{
    id: string;
    content: string;
    noteType: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
      role: string;
    };
  }>;
  prescriptions?: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    status: string;
    createdAt: string;
    createdBy: {
      id: string;
      name: string;
      role: string;
    };
  }>;
}

interface Problem {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  onsetDate?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface MedicalHistory {
  id: string;
  condition: string;
  description?: string;
  diagnosedDate?: string;
  status: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface VisitStatistics {
  total: number;
  emergency: number;
  clinic: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
}

interface TimelineGroup {
  year: number;
  month: string;
  visits: Visit[];
  count: number;
}

interface PatientVisitHistoryData {
  success: boolean;
  patient: Patient;
  visits: Visit[];
  medicalHistory: MedicalHistory[];
  activeProblems: Problem[];
  statistics: VisitStatistics;
  timeline: TimelineGroup[];
  pagination: {
    total: number;
    limit: number | null;
    offset: number;
    hasMore: boolean;
  };
}

// Hook for profile (placeholder - replace with your actual hook)

const PatientVisitHistoryPage: React.FC = () => {
  // Profile hook
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const profileLoading = profileQuery.isLoading;
  const profileError = profileQuery.error;
  const hospitalId = profile?.hospital?.id;

  // State
  const [mrn, setMrn] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<PatientVisitHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'timeline' | 'visits' | 'problems'>('timeline');
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('detailed');
  const [filterType, setFilterType] = useState<'all' | 'emergency' | 'clinic'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'scheduled'>('all');

  // Search function
  const searchPatient = async () => {
    if (!mrn.trim()) {
      setError('Please enter a patient MRN');
      return;
    }

    if (!hospitalId) {
      setError('Hospital ID not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = viewMode === 'summary' 
        ? '/api/patient-visit-history/summary'
        : `/api/patient-visit-history?mrn=${encodeURIComponent(mrn)}&hospitalId=${hospitalId}&limit=50`;

      const response = viewMode === 'summary'
        ? await fetch('/api/patient-visit-history/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mrn, hospitalId })
          })
        : await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patient data');
      }

      const result = await response.json();
      setData(result);
      setSearchTerm(mrn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPatient();
    }
  };

  // Toggle visit expansion
  const toggleVisitExpansion = (visitId: string) => {
    const newExpanded = new Set(expandedVisits);
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId);
    } else {
      newExpanded.add(visitId);
    }
    setExpandedVisits(newExpanded);
  };

  // Filter visits
  const filteredVisits = data?.visits?.filter(visit => {
    const typeMatch = filterType === 'all' || visit.type.toLowerCase() === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'in_progress' && visit.status === 'IN_PROGRESS') ||
      (filterStatus === 'completed' && visit.status === 'COMPLETED') ||
      (filterStatus === 'scheduled' && visit.status === 'SCHEDULED');
    return typeMatch && statusMatch;
  }) || [];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'scheduled': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      case 'routine': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (profileError || !hospitalId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-gray-600">Unable to load hospital information. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Visit History</h1>
          <p className="text-gray-600">Search and view comprehensive patient visit records</p>
        </div>

        {/* Search Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient MRN
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter patient MRN (e.g., MRN123456)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'detailed' | 'summary')}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="detailed">Detailed View</option>
                <option value="summary">Summary View</option>
              </select>
            </div>

            <div className="lg:w-32 flex items-end">
              <button
                onClick={searchPatient}
                disabled={loading || !mrn.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {data?.success && (
          <div className="space-y-6">
            {/* Patient Info Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {data.patient.firstName} {data.patient.lastName}
                      </h2>
                      <p className="text-sm text-gray-600">MRN: {data.patient.mrn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(data.patient.priority)}`}>
                      {data.patient.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.patient.status)}`}>
                      {data.patient.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">DOB:</span> {formatDate(data.patient.dateOfBirth)}</p>
                      <p><span className="font-medium">Gender:</span> {data.patient.gender}</p>
                      <p><span className="font-medium">Type:</span> {data.patient.patientType}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Phone:</span> {data.patient.phone || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {data.patient.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Emergency Contact</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {data.patient.emergencyContact || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {data.patient.emergencyPhone || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Insurance</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Provider:</span> {data.patient.insuranceProvider || 'N/A'}</p>
                      <p><span className="font-medium">Number:</span> {data.patient.insuranceNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {data.statistics && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Visit Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.statistics.total}</div>
                    <div className="text-sm text-gray-600">Total Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{data.statistics.emergency}</div>
                    <div className="text-sm text-gray-600">Emergency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.statistics.clinic}</div>
                    <div className="text-sm text-gray-600">Clinic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{data.statistics.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{data.statistics.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{data.statistics.scheduled}</div>
                    <div className="text-sm text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">{data.statistics.cancelled}</div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'timeline'
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Timeline View
                  </button>
                  <button
                    onClick={() => setActiveTab('visits')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'visits'
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    All Visits ({filteredVisits.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'problems'
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Active Problems ({data.activeProblems?.length || 0})
                  </button>
                </nav>
              </div>

              {/* Filters for Visits Tab */}
              {activeTab === 'visits' && (
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="all">All Types</option>
                        <option value="emergency">Emergency</option>
                        <option value="clinic">Clinic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Timeline View */}
                {activeTab === 'timeline' && data.timeline && (
                  <div className="space-y-6">
                    {data.timeline.map((timeGroup, index) => (
                      <div key={`${timeGroup.year}-${timeGroup.month}`} className="border-l-2 border-blue-200 pl-6 relative">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{timeGroup.count}</span>
                        </div>
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{timeGroup.month} {timeGroup.year}</h4>
                          <p className="text-sm text-gray-600">{timeGroup.count} visit{timeGroup.count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="space-y-3">
                          {timeGroup.visits.map((visit) => (
                            <div key={visit.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">{visit.visitNumber}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                    {visit.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-gray-600">{visit.type}</span>
                                </div>
                                <span className="text-sm text-gray-600">{formatDate(visit.createdAt)}</span>
                              </div>
                              {visit.chiefComplaint && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <span className="font-medium">Chief Complaint:</span> {visit.chiefComplaint}
                                </p>
                              )}
                              {visit.assignedTo && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Assigned to:</span> Dr. {visit.assignedTo.name} ({visit.specialty?.name})
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* All Visits View */}
                {activeTab === 'visits' && (
                  <div className="space-y-4">
                    {filteredVisits.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No visits found matching the current filters.</p>
                      </div>
                    ) : (
                      filteredVisits.map((visit) => (
                        <div key={visit.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleVisitExpansion(visit.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {expandedVisits.has(visit.id) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                                <div>
                                  <h4 className="font-semibold text-gray-900">{visit.visitNumber}</h4>
                                  <p className="text-sm text-gray-600">{formatDate(visit.createdAt)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                    {visit.status.replace('_', ' ')}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {visit.type}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                {visit.assignedTo && (
                                  <p className="text-sm font-medium text-gray-900">Dr. {visit.assignedTo.name}</p>
                                )}
                                {visit.specialty && (
                                  <p className="text-xs text-gray-600">{visit.specialty.name}</p>
                                )}
                              </div>
                            </div>
                            {visit.chiefComplaint && (
                              <div className="mt-2 ml-9">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Chief Complaint:</span> {visit.chiefComplaint}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Expanded Visit Details */}
                          {expandedVisits.has(visit.id) && (
                            <div className="p-6 bg-white border-t border-gray-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Vitals */}
                                {visit.vitals && visit.vitals.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <Activity className="w-4 h-4 mr-2 text-red-500" />
                                      Latest Vitals
                                    </h5>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      {visit.vitals[0] && (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          {visit.vitals[0].temperature && (
                                            <div>
                                              <span className="font-medium">Temperature:</span> {visit.vitals[0].temperature}°F
                                            </div>
                                          )}
                                          {visit.vitals[0].bloodPressureSys && visit.vitals[0].bloodPressureDia && (
                                            <div>
                                              <span className="font-medium">BP:</span> {visit.vitals[0].bloodPressureSys}/{visit.vitals[0].bloodPressureDia}
                                            </div>
                                          )}
                                          {visit.vitals[0].heartRate && (
                                            <div>
                                              <span className="font-medium">Heart Rate:</span> {visit.vitals[0].heartRate} bpm
                                            </div>
                                          )}
                                          {visit.vitals[0].respiratoryRate && (
                                            <div>
                                              <span className="font-medium">Respiratory Rate:</span> {visit.vitals[0].respiratoryRate} /min
                                            </div>
                                          )}
                                          {visit.vitals[0].oxygenSaturation && (
                                            <div>
                                              <span className="font-medium">O2 Sat:</span> {visit.vitals[0].oxygenSaturation}%
                                            </div>
                                          )}
                                          {visit.vitals[0].weight && (
                                            <div>
                                              <span className="font-medium">Weight:</span> {visit.vitals[0].weight} kg
                                            </div>
                                          )}
                                          {visit.vitals[0].height && (
                                            <div>
                                              <span className="font-medium">Height:</span> {visit.vitals[0].height} cm
                                            </div>
                                          )}
                                          {visit.vitals[0].bmi && (
                                            <div>
                                              <span className="font-medium">BMI:</span> {visit.vitals[0].bmi.toFixed(1)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-gray-600">
                                        Recorded by {visit.vitals[0].createdBy.name} on {formatDate(visit.vitals[0].createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Prescriptions */}
                                {visit.prescriptions && visit.prescriptions.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <Pill className="w-4 h-4 mr-2 text-green-500" />
                                      Active Prescriptions
                                    </h5>
                                    <div className="space-y-2">
                                      {visit.prescriptions.slice(0, 3).map((prescription) => (
                                        <div key={prescription.id} className="bg-gray-50 rounded-lg p-3">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{prescription.medication}</span>
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                              {prescription.status}
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Prescribed by {prescription.createdBy.name}
                                          </div>
                                        </div>
                                      ))}
                                      {visit.prescriptions.length > 3 && (
                                        <div className="text-sm text-blue-600 text-center py-2">
                                          +{visit.prescriptions.length - 3} more prescriptions
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Clinical Notes */}
                              {visit.clinicalNotes && visit.clinicalNotes.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                    Clinical Notes
                                  </h5>
                                  <div className="space-y-3">
                                    {visit.clinicalNotes.map((note) => (
                                      <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <h6 className="font-medium text-gray-900">{note.title}</h6>
                                          <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                            {note.noteType}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                                          {note.content}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                          By {note.createdBy.name} • {formatDate(note.createdAt)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Progress Notes */}
                              {visit.progressNotes && visit.progressNotes.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                    Progress Notes
                                  </h5>
                                  <div className="space-y-3">
                                    {visit.progressNotes.slice(0, 2).map((note) => (
                                      <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-gray-600 bg-purple-100 px-2 py-1 rounded">
                                            {note.noteType}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(note.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {note.content}
                                        </p>
                                        <div className="text-xs text-gray-500 mt-2">
                                          By {note.createdBy.name}
                                        </div>
                                      </div>
                                    ))}
                                    {visit.progressNotes.length > 2 && (
                                      <div className="text-sm text-blue-600 text-center py-2">
                                        +{visit.progressNotes.length - 2} more progress notes
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Active Problems View */}
                {activeTab === 'problems' && (
                  <div className="space-y-4">
                    {data.activeProblems && data.activeProblems.length > 0 ? (
                      data.activeProblems.map((problem) => (
                        <div key={problem.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{problem.title}</h4>
                              {problem.description && (
                                <p className="text-gray-700 mt-2 leading-relaxed">{problem.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                problem.severity === 'High' ? 'text-red-600 bg-red-50' :
                                problem.severity === 'Medium' ? 'text-yellow-600 bg-yellow-50' :
                                'text-green-600 bg-green-50'
                              }`}>
                                {problem.severity} Severity
                              </span>
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                {problem.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Onset Date:</span> {
                                problem.onsetDate ? formatDate(problem.onsetDate) : 'Not specified'
                              }
                            </div>
                            <div>
                              <span className="font-medium">Reported by:</span> {problem.createdBy.name}
                            </div>
                            <div>
                              <span className="font-medium">Date Added:</span> {formatDate(problem.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No active problems found for this patient.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Medical History */}
            {data.medicalHistory && data.medicalHistory.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Medical History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.medicalHistory.map((history) => (
                    <div key={history.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{history.condition}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          history.status === 'Active' ? 'text-red-600 bg-red-50' :
                          history.status === 'Resolved' ? 'text-green-600 bg-green-50' :
                          'text-gray-600 bg-gray-50'
                        }`}>
                          {history.status}
                        </span>
                      </div>
                      {history.description && (
                        <p className="text-sm text-gray-700 mb-2">{history.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        {history.diagnosedDate && (
                          <span>Diagnosed: {formatDate(history.diagnosedDate)} • </span>
                        )}
                        Added by {history.createdBy.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Info */}
            {data.pagination && data.pagination.total > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Showing {data.visits.length} of {data.pagination.total} visits
                  </div>
                  {data.pagination.hasMore && (
                    <div className="text-blue-600">
                      {data.pagination.total - data.visits.length} more visits available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Patient Visit History</h3>
            <p className="text-gray-600 mb-6">Enter a patient's MRN to view their complete visit history and medical records.</p>
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Quick Tips:</h4>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• Use the complete MRN (e.g., MRN123456-789)</li>
                  <li>• Choose detailed view for comprehensive information</li>
                  <li>• Use summary view for quick overview</li>
                  <li>• Filter visits by type and status</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVisitHistoryPage;