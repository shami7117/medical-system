import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  LayoutDashboard,
  AlertTriangle,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  UserCheck,
  Pill,
  Heart,
  Edit3,
  Brain,
  Baby,
  Eye,
  Ear,
  Scissors,
  Zap,
  ScanLine,
  TestTube,
  Palette,
  HospitalIcon,
  Folder,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useAuth";
import { useActiveSpecialties } from '@/hooks/useSpecialties';
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  children?: MenuItem[];
  specialtyId?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  activeItem,
  setActiveItem,
}) => {
  // Changed: All dropdowns closed by default
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data?.user;
  const profileLoading = profileQuery.isLoading;
  const profileError = profileQuery.error;

  // Mock router functionality for demo
  const handleNavigation = (path: string) => {
    console.log(`Navigating to ${path}`);
    router.push(path);
  };


  // Specialty icon mapping (should match clinic page)
  const specialtyIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Cardiology: Heart,
    Orthopaedics: Zap,
    Dermatology: Palette,
    Paediatrics: Baby,
    Ophthalmology: Eye,
    ENT: Ear,
    Neurology: Brain,
    Pulmonology: Stethoscope,
    Endocrinology: Activity,
    Oncology: Heart,
    Psychiatry: Brain,
    Urology: Pill,
    Gastroenterology: Activity,
    Rheumatology: Zap,
    General: Stethoscope,
    GeneralMedicine: Stethoscope,
    GeneralSurgery: Scissors,
    Obstetrics: Heart,
    Gynaecology: Heart,
    Radiology: ScanLine,
    Pathology: TestTube,
  };

  // Get hospitalId from profile or fallback
  const mockHospitalContext = {
    hospital_id: "hosp_001",
  };
  const hospitalId = profile?.hospital?.id || mockHospitalContext.hospital_id;
  const { data: specialties, isLoading: specialtiesLoading } = useActiveSpecialties(hospitalId, { enabled: !!hospitalId });

  // Fallback mock specialties (same as clinic page)
  const mockSpecialties = [
    { id: "card_001", name: "Cardiology", slug: "cardiology" },
    { id: "orth_001", name: "Orthopaedics", slug: "orthopaedics" },
    { id: "derm_001", name: "Dermatology", slug: "dermatology" },
    { id: "pedi_001", name: "Paediatrics", slug: "paediatrics" },
    { id: "opht_001", name: "Ophthalmology", slug: "ophthalmology" },
    { id: "ent_001", name: "ENT", slug: "ent" },
    { id: "neur_001", name: "Neurology", slug: "neurology" },
    { id: "pul_001", name: "Pulmonology", slug: "pulmonology" },
    { id: "endo_001", name: "Endocrinology", slug: "endocrinology" },
    { id: "onc_001", name: "Oncology", slug: "oncology" },
    { id: "psy_001", name: "Psychiatry", slug: "psychiatry" },
    { id: "uro_001", name: "Urology", slug: "urology" },
    { id: "gas_001", name: "Gastroenterology", slug: "gastroenterology" },
    { id: "rheu_001", name: "Rheumatology", slug: "rheumatology" },
  ];

  // Use real specialties if available, otherwise fallback to mock
  const specialtiesList = specialties && specialties.length > 0 ? specialties : mockSpecialties;

  // Dynamically generate specialty notes menu items
  const specialtyNotesItems: MenuItem[] = useMemo(() =>
    specialtiesList.map((spec:any) => ({
      id: `${spec.slug || spec.name.toLowerCase()}-notes`,
      label: spec.name,
      icon: specialtyIconMap[spec.name] || Stethoscope,
      // Pass specialtyId as query param for notes page
      path: `/clinic/${spec.slug || spec.name.toLowerCase().replace(/\s+/g, '-')}/notes?specialtyId=${spec.id}`,
      specialtyId: spec.id,
    })),
    [specialtiesList]
  );

  // Specialty configurations for vitals pages
  const specialtyVitalsItems: MenuItem[] = [
    {
      id: "general-medicine-vitals",
      label: "General Medicine",
      icon: Stethoscope,
      path: "/clinic/vitals/general-medicine",
    },
    {
      id: "general-surgery-vitals",
      label: "General Surgery",
      icon: Scissors,
      path: "/clinic/vitals/general-surgery",
    },
    {
      id: "paediatrics-vitals",
      label: "Paediatrics",
      icon: Baby,
      path: "/clinic/vitals/paediatrics",
    },
    {
      id: "obstetrics-vitals",
      label: "Obstetrics",
      icon: Heart,
      path: "/clinic/vitals/obstetrics",
    },
    {
      id: "gynaecology-vitals",
      label: "Gynaecology",
      icon: Heart,
      path: "/clinic/vitals/gynaecology",
    },
    {
      id: "dermatology-vitals",
      label: "Dermatology",
      icon: Palette,
      path: "/clinic/vitals/dermatology",
    },
    {
      id: "ent-vitals",
      label: "ENT (Ear, Nose & Throat)",
      icon: Ear,
      path: "/clinic/vitals/ent",
    },
    {
      id: "ophthalmology-vitals",
      label: "Ophthalmology",
      icon: Eye,
      path: "/clinic/vitals/ophthalmology",
    },
    {
      id: "cardiology-vitals",
      label: "Cardiology",
      icon: Heart,
      path: "/clinic/vitals/cardiology",
    },
    {
      id: "orthopaedics-vitals",
      label: "Orthopaedics",
      icon: Zap,
      path: "/clinic/vitals/orthopaedics",
    },
    {
      id: "radiology-vitals",
      label: "Radiology",
      icon: ScanLine,
      path: "/clinic/vitals/radiology",
    },
    {
      id: "psychiatry-vitals",
      label: "Psychiatry",
      icon: Brain,
      path: "/clinic/vitals/psychiatry",
    },
    {
      id: "pathology-vitals",
      label: "Pathology",
      icon: TestTube,
      path: "/clinic/vitals/pathology",
    },
  ];

  const specialtyResultsItems: MenuItem[] = [
    {
      id: "general-medicine-notes",
      label: "General Medicine",
      icon: Stethoscope,
      path: "/clinic/general-medicine/results",
    },
    {
      id: "general-surgery-notes",
      label: "General Surgery",
      icon: Scissors,
      path: "/clinic/general-surgery/results",
    },
    {
      id: "paediatrics-notes",
      label: "Paediatrics",
      icon: Baby,
      path: "/clinic/paediatrics/results",
    },
    {
      id: "obstetrics-notes",
      label: "Obstetrics",
      icon: Heart,
      path: "/clinic/obstetrics/results",
    },
    {
      id: "gynaecology-notes",
      label: "Gynaecology",
      icon: Heart,
      path: "/clinic/gynaecology/results",
    },
    {
      id: "dermatology-notes",
      label: "Dermatology",
      icon: Palette,
      path: "/clinic/dermatology/results",
    },
    {
      id: "ent-notes",
      label: "ENT (Ear, Nose & Throat)",
      icon: Ear,
      path: "/clinic/ent/results",
    },
    {
      id: "ophthalmology-notes",
      label: "Ophthalmology",
      icon: Eye,
      path: "/clinic/ophthalmology/results",
    },
    {
      id: "cardiology-notes",
      label: "Cardiology",
      icon: Heart,
      path: "/clinic/cardiology/results",
    },
    {
      id: "orthopaedics-notes",
      label: "Orthopaedics",
      icon: Zap,
      path: "/clinic/orthopaedics/results",
    },
    {
      id: "radiology-notes",
      label: "Radiology",
      icon: ScanLine,
      path: "/clinic/radiology/results",
    },
    {
      id: "psychiatry-notes",
      label: "Psychiatry",
      icon: Brain,
      path: "/clinic/psychiatry/results",
    },
    {
      id: "pathology-notes",
      label: "Pathology",
      icon: TestTube,
      path: "/clinic/pathology/results",
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "clinic-overview",
      label: "Clinic Overview",
      icon: HospitalIcon,
      path: "/clinic",
      badge: "8",
    },
    {
      id: "emergency",
      label: "Emergency Worklist",
      icon: AlertTriangle,
      path: "/worklist/emergency",
      badge: "8",
    },
    {
      id: "team-members",
      label: "Team Members",
      icon: Users,
      path: "/team-members",
      // badge: "45",
    },
    {
      id: "clinic",
      label: "Outpatient Worklist",
      icon: Stethoscope,
      path: "/worklist/clinic",
      badge: "45",
    },
    {
      id: "notes",
      label: "Notes",
      icon: Edit3,
      path: "#",
      children: [
        {
          id: "emergency-notes",
          label: "Emergency Notes",
          icon: AlertTriangle,
          path: "/emergency/notes",
          badge: "8",
        },
        {
          id: "clinic-notes",
          label: "Clinic Notes",
          icon: Stethoscope,
          path: "#",
          badge: specialtiesList.length.toString(),
          children: specialtyNotesItems,
        },
      ],
    },
     {
      id: "previous-visits",
      label: "Previous Visits",
      icon: FileText,
      path: "/previous-visits",
      // badge: "46",
    },
    // Added: Vital Signs section with emergency and clinic subsections
    {
      id: "vitals",
      label: "Vital Signs",
      icon: Activity,
      path: "#",
      children: [
        {
          id: "emergency-vitals",
          label: "Emergency Vitals",
          icon: AlertTriangle,
          path: "/emergency/vitals",
          badge: "8",
        },
        {
          id: "clinic-vitals",
          label: "Clinic Vitals",
          icon: Heart,
          path: "#",
          badge: "45",
          children: specialtyVitalsItems,
        },
      ],
    },

    {
      id: "emergency-prescriptions",
      label: "Emergency Prescriptions",
      icon: Folder,
      path: "/emergency/prescriptions",
    },
    {
      id: "emergency-results",
      label: "Emergency Results",
      icon: FileText,
      path: "/emergency/results",
    },
    {
      id: "emergency-history",
      label: "Emergency History",
      icon: FileText,
      path: "/emergency/history",
    },
    {
      id: "clinic-results",
      label: "Clinic Results",
      icon: FileText,
      path: "#",
      badge: "45",
      children: specialtyResultsItems,
    },
   

    // {
    //   id: "patients",
    //   label: "Patient Management",
    //   icon: Users,
    //   path: "/patients",
    // },
    // {
    //   id: "appointments",
    //   label: "Appointments",
    //   icon: Calendar,
    //   path: "/appointments",
    // },
    // {
    //   id: "records",
    //   label: "Medical Records",
    //   icon: FileText,
    //   path: "/records",
    // },
    // {
    //   id: "pharmacy",
    //   label: "Pharmacy",
    //   icon: Pill,
    //   path: "/pharmacy",
    // },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      path: "/help",
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    // If item has children and no path (is a parent), toggle expansion
    if (item.children && item.path === "#") {
      toggleExpanded(item.id);
      return;
    }

    // If item is a specialty notes item, send specialtyId in params
    if (item.path && item.path.includes('/clinic/') && item.path.includes('/notes') && item.specialtyId) {
      setActiveItem(item.id);
      // Use router.push with query param
      handleNavigation(item.path);
      return;
    }

    // If item has a real path, navigate
    if (item.path && item.path !== "#") {
      setActiveItem(item.id);
      handleNavigation(item.path);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const isItemActive = (item: MenuItem): boolean => {
    if (activeItem === item.id) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.id);
    const paddingLeft = isCollapsed
      ? "px-2"
      : level === 0
      ? "px-3"
      : level === 1
      ? "pl-8 pr-3"
      : "pl-12 pr-3";

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          onClick={() => handleMenuClick(item)}
          className={`w-full justify-start h-10 ${
            activeItem === item.id
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-r-2 border-blue-600"
              : isActive && level === 0
              ? "bg-blue-25 text-blue-600 hover:bg-blue-50"
              : "text-gray-700 hover:bg-gray-100"
          } ${paddingLeft}`}
        >
          <div className="flex items-center w-full">
            <Icon
              className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"} ${
                activeItem === item.id
                  ? "text-blue-600"
                  : isActive && level === 0
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
            />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        item.id.includes("emergency")
                          ? "bg-red-100 text-red-700"
                          : item.id.includes("lab")
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {hasChildren &&
                    (expanded ? (
                      <ChevronUp className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    ))}
                </div>
              </>
            )}
          </div>
        </Button>

        {/* Render children */}
        {hasChildren && expanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-22" : "w-68"
      } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className={`flex items-center ${
              isCollapsed ? " " : ""
            } justify-between`}>
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Segai</h1>
                <p className="text-xs text-gray-500">Hospital System</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-4 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="animate-pulse space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              ) : profileError ? (
                <p className="text-sm text-red-500">Profile error</p>
              ) : profile ? (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.name || "-"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.role ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase() : "-"}
                    {profile.hospital?.name ? `, ${profile.hospital.name}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No profile</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-gray-200">
        <nav className="space-y-1">
          {bottomMenuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
