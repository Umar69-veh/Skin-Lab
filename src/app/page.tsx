import { getServerSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FlaskConical, Users, ShoppingBag, BarChart3, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f4f5fb] font-sans flex items-center justify-center overflow-hidden relative selection:bg-indigo-200">
      
      {/* Decorative background blobs/shapes if desired, but image has its own hex shapes */}
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-16 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 z-10">
        
        {/* Left Column: Content */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-start text-left">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-sm">
              <FlaskConical className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
              Skin-Lab
              <span className="bg-indigo-600 text-white text-[11px] uppercase px-2 py-0.5 rounded-md font-bold ml-2 relative -top-0.5 shadow-sm">
                POS
              </span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#312e81] tracking-tight leading-[1.15] mb-6">
            Welcome to <br />
            Skin-Lab POS
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed font-medium">
            The all-in-one system to manage your clinic, patients, services, and sales effortlessly.
          </p>

          {/* Feature List */}
          <div className="space-y-6 mb-12 w-full">
            
            {/* Feature 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-[#5a67d8]">
                  <Users className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-base font-bold text-gray-900">Manage Patients</h3>
                <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">
                  Easily manage patient records and history.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-[#5a67d8]">
                  <ShoppingBag className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-base font-bold text-gray-900">Track Services \u0026 Sales</h3>
                <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">
                  Manage services, POS, and sales in one place.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-[#5a67d8]">
                  <BarChart3 className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-base font-bold text-gray-900">Reports \u0026 Insights</h3>
                <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">
                  Get real-time insights and grow your business.
                </p>
              </div>
            </div>
            
          </div>

          {/* CTA Button */}
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
          >
            Get Started
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          {/* Footer mini text */}
          <div className="mt-10 flex items-center text-sm text-gray-500 font-medium">
            <ShieldCheck className="h-5 w-5 mr-2 text-[#4338ca]" />
            Secure <span className="mx-2 text-gray-300">•</span> Reliable <span className="mx-2 text-gray-300">•</span> Built for Clinics
          </div>

        </div>

        {/* Right Column: Hero Image/Illustration */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-lg lg:max-w-xl aspect-square drop-shadow-2xl hover:scale-[1.01] transition-transform duration-500">
            <Image
              src="/landing-hero.jpg"
              alt="Skin-Lab POS Interface Illustration"
              fill
              className="object-contain rounded-3xl"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  );
}
