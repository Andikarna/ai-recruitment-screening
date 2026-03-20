"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Zap, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Briefcase, label: "Job Postings", href: "/jobs" },
  { icon: Users, label: "Candidates", href: "/candidates" },
  { icon: Zap, label: "AI Screening", href: "/screening" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-primary">
            AI Recruit
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              pathname === item.href 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon size={22} className={cn(
              "shrink-0",
              pathname === item.href ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors"
            )} />
            {!isCollapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group",
          isCollapsed && "justify-center"
        )}>
          <LogOut size={22} className="shrink-0 group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
