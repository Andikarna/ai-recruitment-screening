"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import { CandidateService } from "@/services/candidateService";
import { JobService } from "@/services/jobService";
import { ApplicationService, Application } from "@/services/applicationService";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState([
    { label: "Total Candidates", value: "0", icon: Users, trend: "+0%", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Jobs", value: "0", icon: Briefcase, trend: "+0%", color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Applications", value: "0", icon: CheckCircle, trend: "+0%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Interviews", value: "0", icon: Clock, trend: "+0%", color: "text-amber-500", bg: "bg-amber-500/10" },
  ]);

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidates, jobs, applications] = await Promise.all([
          CandidateService.getAll(),
          JobService.getAll(),
          ApplicationService.getAll()
        ]);

        setStats([
          { label: "Total Candidates", value: candidates.length.toString(), icon: Users, trend: "+12%", color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Jobs", value: jobs.length.toString(), icon: Briefcase, trend: "+5%", color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Total Applications", value: applications.length.toString(), icon: CheckCircle, trend: "+18%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Interviews", value: applications.filter(a => a.status === 'Interviewing').length.toString(), icon: Clock, trend: "+2%", color: "text-amber-500", bg: "bg-amber-500/10" },
        ]);

        // Map recent applications for display
        const recent = applications.slice(0, 5).map(app => {
          const candidate = candidates.find(c => c.id === app.candidateId);
          const job = jobs.find(j => j.id === app.jobPostingId);
          return {
            id: app.id,
            name: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate',
            job: job ? job.title : 'Unknown Job',
            status: app.status,
            score: app.matchScore,
            date: "Just now" // In a real app, use app.createdAt
          };
        });

        setRecentApplications(recent);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John!</h1>
        <p className="text-muted-foreground">Here's what's happening with your recruitment funnel today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {loading ? "-" : stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Applications</h3>
            <button 
              onClick={() => router.push('/screening')}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">AI Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading applications...</td>
                  </tr>
                ) : recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent applications found.</td>
                  </tr>
                ) : (
                  recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.date}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{app.job}</td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg font-bold text-xs ${
                          app.score >= 80 ? "text-emerald-500 bg-emerald-500/10" : 
                          app.score >= 60 ? "text-primary bg-primary/10" : 
                          "text-red-500 bg-red-500/10"
                        }`}>
                          {app.score}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ['Screened', 'Applied'].includes(app.status) ? 'bg-emerald-500/10 text-emerald-500' :
                          app.status === 'Reviewing' ? 'bg-blue-500/10 text-blue-500' :
                          app.status === 'Interviewing' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert(`View details for application ${app.id}`)}
                          className="p-1 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <MoreVertical size={18} className="text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Performance */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => router.push('/jobs')}
              className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary text-white">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Create Job</p>
                  <p className="text-xs text-muted-foreground">Post a new vacancy</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button 
              onClick={() => router.push('/candidates')}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-secondary transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent text-white">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Add Candidate</p>
                  <p className="text-xs text-muted-foreground">Upload a new resume</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">AI Performance</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Accuracy</span>
                  <span className="text-primary">98.5%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[98.5%] bg-primary rounded-full transition-all duration-1000" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Efficiency</span>
                  <span className="text-accent">+24%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-accent rounded-full transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
