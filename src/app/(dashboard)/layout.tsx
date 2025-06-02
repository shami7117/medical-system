"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header - Fixed at top */}
            <div className="sticky top-0 z-10">
              <Header currentTime={currentTime} />
            </div>

            {/* Page Content - Scrollable */}
            <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
