"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Settings, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
interface HeaderProps {
  currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ currentTime }) => {
  const { mutate: logout, isPending } = useLogout();
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Segai Dashboard
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
            <Button
              onClick={() => logout()}
              variant="ghost"
              size="sm"
              disabled={isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
