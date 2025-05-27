import React, { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  children?: MenuItem[];
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
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "notes",
    "emergency-notes",
    "clinic-notes",
  ]);
  const router = useRouter();

  // Mock router functionality for demo
  const handleNavigation = (path: string) => {
    console.log(`Navigating to ${path}`);
    router.push(path);
  };

  // Specialty configurations with correct dynamic route paths
  const specialtyItems: MenuItem[] = [
    {
      id: "general-medicine",
      label: "General Medicine",
      icon: Stethoscope,
      path: "/clinic/general-medicine/notes",
    },
    {
      id: "general-surgery",
      label: "General Surgery",
      icon: Scissors,
      path: "/clinic/general-surgery/notes",
    },
    {
      id: "paediatrics",
      label: "Paediatrics",
      icon: Baby,
      path: "/clinic/paediatrics/notes",
    },
    {
      id: "obstetrics",
      label: "Obstetrics",
      icon: Heart,
      path: "/clinic/obstetrics/notes",
    },
    {
      id: "gynaecology",
      label: "Gynaecology",
      icon: Heart,
      path: "/clinic/gynaecology/notes",
    },
    {
      id: "dermatology",
      label: "Dermatology",
      icon: Palette,
      path: "/clinic/dermatology/notes",
    },
    {
      id: "ent",
      label: "ENT (Ear, Nose & Throat)",
      icon: Ear,
      path: "/clinic/ent/notes",
    },
    {
      id: "ophthalmology",
      label: "Ophthalmology",
      icon: Eye,
      path: "/clinic/ophthalmology/notes",
    },
    {
      id: "cardiology",
      label: "Cardiology",
      icon: Heart,
      path: "/clinic/cardiology/notes",
    },
    {
      id: "orthopaedics",
      label: "Orthopaedics",
      icon: Zap,
      path: "/clinic/orthopaedics/notes",
    },
    {
      id: "radiology",
      label: "Radiology",
      icon: ScanLine,
      path: "/clinic/radiology/notes",
    },
    {
      id: "psychiatry",
      label: "Psychiatry",
      icon: Brain,
      path: "/clinic/psychiatry/notes",
    },
    {
      id: "pathology",
      label: "Pathology",
      icon: TestTube,
      path: "/clinic/pathology/notes",
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
      id: "emergency",
      label: "Emergency Worklist",
      icon: AlertTriangle,
      path: "/worklist/emergency",
      badge: "8",
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
          badge: "45",
          children: specialtyItems,
        },
      ],
    },

    {
      id: "patients",
      label: "Patient Management",
      icon: Users,
      path: "/patients",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      path: "/appointments",
    },
    {
      id: "records",
      label: "Medical Records",
      icon: FileText,
      path: "/records",
    },
    {
      id: "pharmacy",
      label: "Pharmacy",
      icon: Pill,
      path: "/pharmacy",
    },
    {
      id: "vitals",
      label: "Vital Signs",
      icon: Heart,
      path: "/vitals",
    },
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
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
            className="h-8 w-8 p-0 hover:bg-gray-100"
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
              <p className="text-sm font-medium text-gray-900 truncate">
                Dr. Sarah Smith
              </p>
              <p className="text-xs text-gray-500 truncate">
                Chief Medical Officer
              </p>
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
