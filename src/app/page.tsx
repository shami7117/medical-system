// ===== ROOT PAGE =====
// app/page.tsx (Landing/Home page)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full">
            <Building2 className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6">Segai </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamlined Multi-Tenant Outpatient Management System for modern
          healthcare facilities
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Login to Your Hospital
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Register New Hospital
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
