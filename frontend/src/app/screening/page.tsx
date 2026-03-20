"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Zap,
  TrendingUp,
  Brain,
  Briefcase,
  Users
} from "lucide-react";
import { CandidateService, Candidate } from "@/services/candidateService";
import { JobService, JobPosting } from "@/services/jobService";
import { ScreeningService, ScreeningResult } from "@/services/screeningService";

export default function ScreeningPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  
  const [isScreening, setIsScreening] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, jData] = await Promise.all([
          CandidateService.getAll(),
          JobService.getAll()
        ]);
        setCandidates(cData);
        setJobs(jData);
      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };
    fetchData();
  }, []);

  const handleScreening = async () => {
    if (!selectedCandidate || !selectedJob) return;
    
    setIsScreening(true);
    setResult(null);
    try {
      const data = await ScreeningService.screenCandidate(selectedCandidate, selectedJob);
      setResult(data);
    } catch (error) {
      console.error("Screening failed", error);
    } finally {
      setIsScreening(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Zap className="text-primary fill-primary/10" size={32} />
          AI Resume Screening
        </h1>
        <p className="text-muted-foreground">Select a candidate and a job to get instant AI-powered compatibility scores and insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Selection Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
              Run Analysis
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" /> Select Candidate
              </label>
              <select 
                className="w-full p-3 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary transition-colors"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
              >
                <option value="" disabled>-- Choose a Candidate --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Briefcase size={16} className="text-muted-foreground" /> Select Job Requirement
              </label>
              <select 
                className="w-full p-3 rounded-xl border border-border bg-transparent text-foreground outline-none focus:border-primary transition-colors"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="" disabled>-- Choose a Job --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleScreening}
              disabled={!selectedCandidate || !selectedJob || isScreening}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isScreening ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Analyzing...
                </>
              ) : (
                <>
                  <Brain size={20} /> Screen Candidate
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain size={18} className="text-purple-500" />
              How it works
            </h3>
            <ul className="space-y-3">
              {[
                "Extracts key skills and experience",
                "Matches against job requirements directly from DB",
                "Calculates weighted compatibility score",
                "Generates executive summary"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/50" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="space-y-6 animate-in">
              <div className="p-6 rounded-2xl border border-border bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-5xl font-black text-primary/10">#{result.candidateId?.toString().substring(0, 4)}</div>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                    {result.candidateName.split(' ').map(n=>n[0]).join('').substring(0,2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{result.candidateName}</h2>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg text-xs w-fit mt-1">
                      <CheckCircle size={14} />
                      AI Verified Match
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">AI Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-foreground">{result.overallScore}%</span>
                      <TrendingUp className="text-emerald-500 mb-1" size={24} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Recommendation</p>
                    <p className="text-lg font-bold text-primary">
                      {result.overallScore >= 80 ? 'Highly Recommended' : result.overallScore >= 60 ? 'Consider' : 'Not Recommended'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wider">Analysis Summary</p>
                  <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
                    "{result.summary}"
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-4">Skill Compatibility</h3>
                {result.skillMatches && result.skillMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.skillMatches.map((skill) => (
                      <div key={skill.skillName} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          {skill.isMatched ? (
                            <CheckCircle className="text-emerald-500" size={18} />
                          ) : (
                            <AlertCircle className="text-amber-500" size={18} />
                          )}
                          <span className="font-medium text-sm">{skill.skillName}</span>
                        </div>
                        <div className="h-1.5 w-16 bg-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${skill.isMatched ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${skill.relevanceScore * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No clear skill overlaps extracted.</p>
                )}
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                  Approve Application
                </button>
                <button className="px-6 py-4 border border-border text-foreground rounded-2xl font-bold hover:bg-secondary transition-all active:scale-95">
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-border bg-card/30">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-6">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No results yet</h3>
              <p className="text-muted-foreground max-w-xs">Select a candidate and job on the left to start the AI screening process.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
