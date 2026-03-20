"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Bell, Search, User } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden" id="main-layout">
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-md z-10 sticky top-0">
          <div className="relative w-96 max-w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search candidates, jobs..." 
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent rounded-xl focus:border-primary/30 focus:bg-card transition-all outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl border border-border hover:bg-secondary transition-colors group">
              <Bell size={20} className="text-muted-foreground group-hover:text-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">John Doe</p>
                <p className="text-xs text-muted-foreground">HR Manager</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 animate-in custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
