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
  Building2,
  UserCheck,
  Pill,
  Heart,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
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
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "emergency",
      label: "Emergency",
      icon: AlertTriangle,
      path: "/emergency",
      badge: "8",
    },
    {
      id: "clinic",
      label: "Outpatient Clinic",
      icon: Stethoscope,
      path: "/clinic",
      badge: "45",
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
    // {
    //   id: "lab",
    //   label: "Lab Results",
    //   icon: Activity,
    //   path: "/lab",
    //   badge: "23",
    // },
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
    // {
    //   id: "reports",
    //   label: "Reports & Analytics",
    //   icon: BarChart3,
    //   path: "/reports",
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
    setActiveItem(item.id);
    console.log(`Navigating to ${item.path}`);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleMenuClick(item)}
                className={`w-full justify-start h-10 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "px-2" : "px-3"}`}
              >
                <Icon
                  className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.id === "emergency"
                            ? "bg-red-100 text-red-700"
                            : item.id === "lab"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Button>
            );
          })}
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
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleMenuClick(item)}
                className={`w-full justify-start h-10 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "px-2" : "px-3"}`}
              >
                <Icon
                  className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
