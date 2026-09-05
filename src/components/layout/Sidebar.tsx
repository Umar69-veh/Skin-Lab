"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, Stethoscope, ShoppingCart, BarChart3, Settings, LogOut, Menu, X, Package } from "lucide-react";

interface SidebarProps {
  userEmail: string;
  userRole: string;
}

export default function Sidebar({ userEmail, userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const allLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["Admin", "Manager", "Doctor", "Cashier"] },
    { href: "/dashboard/patients", icon: Users, label: "Patients (PRM)", roles: ["Admin", "Manager", "Doctor", "Cashier"] },
    { href: "/dashboard/services", icon: Stethoscope, label: "Services", roles: ["Admin", "Manager"] },
    { href: "/dashboard/staff", icon: Users, label: "Staff", roles: ["Admin", "Manager"] },
    { href: "/dashboard/purchases", icon: Package, label: "Purchases", roles: ["Admin", "Manager"] },
    { href: "/dashboard/pos", icon: ShoppingCart, label: "POS", roles: ["Admin", "Manager", "Cashier"] },
    { href: "/dashboard/sales", icon: BarChart3, label: "Sales History", roles: ["Admin", "Manager", "Doctor", "Cashier"] },
    { href: "/dashboard/reports", icon: BarChart3, label: "Reports", roles: ["Admin", "Manager"] },
    { href: "/dashboard/settings", icon: Settings, label: "Settings", roles: ["Admin", "Manager"] },
  ];

  const navLinks = allLinks.filter(link => link.roles.includes(userRole));

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-indigo-900 text-white flex items-center justify-between p-4 shrink-0">
        <div className="text-xl font-bold tracking-tight">Skin-Lab POS</div>
        <button onClick={toggleSidebar} className="text-white hover:text-indigo-200">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 text-2xl font-bold border-b border-indigo-800 tracking-tight hidden md:block">
          Skin-Lab POS
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive ? "bg-indigo-800 text-white font-medium" : "text-indigo-100 hover:bg-indigo-800"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800 mt-auto bg-indigo-950/30">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden flex-1">
              <div className="text-sm font-medium text-white truncate" title={userEmail}>
                {userEmail.split('@')[0]}
              </div>
              <div className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-800 text-indigo-100 tracking-wide uppercase">
                {userRole}
              </div>
            </div>
          </div>
          <a href="/api/auth/signout" className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-indigo-100 hover:text-white transition-colors text-sm font-medium group">
            <LogOut className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Sign out
          </a>
        </div>
      </aside>
    </>
  );
}
