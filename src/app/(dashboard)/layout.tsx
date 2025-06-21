"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
