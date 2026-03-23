"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Settings as SettingsIcon, Server } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [backendConnection, setBackendConnection] = React.useState(true);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('backendConnection');
    if (stored !== null) {
      setBackendConnection(stored === 'true');
    }
  }, []);

  const toggleBackendConnection = () => {
    const newVal = !backendConnection;
    setBackendConnection(newVal);
    localStorage.setItem('backendConnection', newVal.toString());
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <SettingsIcon className="text-primary fill-primary/10" size={32} />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your application preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="font-bold text-foreground text-lg mb-4 flex items-center justify-between gap-2">
              Appearance
            </h3>
            
            <div className="space-y-4 animate-in">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sun size={24} className="mb-2" />
                  <span className="font-medium text-sm">Light</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Moon size={24} className="mb-2" />
                  <span className="font-medium text-sm">Dark</span>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor size={24} className="mb-2" />
                  <span className="font-medium text-sm">System</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Choose the visual theme of the application. System mode will adapt to your device's preferences automatically.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="font-bold text-foreground text-lg mb-4 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Server size={20} className="text-primary" />
                Network Preferences
              </span>
            </h3>
            
            <div className="space-y-4 animate-in">
              <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-2xl border border-border/50">
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Connection to Backend
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Toggle off to use offline dummy data across all features, including localized AI screening mock logic.
                  </p>
                </div>
                <button
                  onClick={toggleBackendConnection}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    backendConnection ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-pressed={backendConnection}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    backendConnection ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
