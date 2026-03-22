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
  Users,
  ChevronDown,
  MapPin,
  Search
} from "lucide-react";
import { CandidateService, Candidate } from "@/services/candidateService";
import { JobService, JobPosting } from "@/services/jobService";
import { ScreeningService, ScreeningResult } from "@/services/screeningService";
import { ApplicationService } from "@/services/applicationService";

export default function ScreeningPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  
  const [screeningMode, setScreeningMode] = useState<'candidate' | 'cv'>('candidate');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState(false);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  
  const [isScreening, setIsScreening] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"none" | "approved" | "rejected" | "error">("none");

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
    if (!selectedJob) return;
    if (screeningMode === 'candidate' && !selectedCandidate) return;
    if (screeningMode === 'cv' && !uploadedFile) return;
    
    setIsScreening(true);
    setResult(null);
    try {
      let data;
      if (screeningMode === 'candidate') {
        data = await ScreeningService.screenCandidate(selectedCandidate, selectedJob);
      } else {
        data = await ScreeningService.screenUploadedCv(uploadedFile!, selectedJob);
      }
      setResult(data);
      setSaveStatus("none");
    } catch (error) {
      console.error("Screening failed", error);
    } finally {
      setIsScreening(false);
    }
  };

  const handleDecision = async (decision: 'Approved' | 'Rejected') => {
    if (!result || !selectedJob) return;
    
    setIsSavingDecision(true);
    setSaveStatus("none");
    try {
      // For temporary uploaded CVs the candidate ID is usually '0'. Fallback to a placeholder UUID.
      const candidateIdToUse = result.candidateId && result.candidateId !== '0' ? result.candidateId : "00000000-0000-0000-0000-000000000000";

      await ApplicationService.create({
        jobPostingId: selectedJob,
        candidateId: candidateIdToUse,
        matchScore: result.overallScore,
        status: decision,
        aiRecommendation: result.summary
      });
      setSaveStatus(decision.toLowerCase() as any);
    } catch (error) {
      console.error(`Failed to save application:`, error);
      setSaveStatus("error");
    } finally {
      setIsSavingDecision(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    (c.firstName || "").toLowerCase().includes(candidateSearchQuery.toLowerCase()) || 
    (c.lastName || "").toLowerCase().includes(candidateSearchQuery.toLowerCase()) || 
    (c.email || "").toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
    (c.parsedSkills && c.parsedSkills.toLowerCase().includes(candidateSearchQuery.toLowerCase()))
  );

  const filteredJobs = jobs.filter(j =>
    (j.title || "").toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    (j.location || "").toLowerCase().includes(jobSearchQuery.toLowerCase())
  );

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
            <h3 className="font-bold text-foreground text-lg mb-4 flex items-center justify-between gap-2">
              <span>Run Analysis</span>
              <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
                <button 
                  onClick={() => setScreeningMode('candidate')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${screeningMode === 'candidate' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Existing Candidate
                </button>
                <button 
                  onClick={() => setScreeningMode('cv')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${screeningMode === 'cv' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Upload CV
                </button>
              </div>
            </h3>

            {screeningMode === 'candidate' ? (
            <div className={`space-y-2 relative animate-in fade-in ${isCandidateDropdownOpen ? 'z-50' : 'z-10'}`}>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" /> Select Candidate
              </label>
              
              <div 
                onClick={() => { 
                  setIsCandidateDropdownOpen(!isCandidateDropdownOpen); 
                  setIsJobDropdownOpen(false); 
                  if (!isCandidateDropdownOpen) setCandidateSearchQuery("");
                }}
                className="w-full p-3 rounded-xl border border-border bg-background hover:border-primary/50 cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                {selectedCandidate ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      {candidates.find(c => c.id === selectedCandidate)?.firstName?.charAt(0)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-foreground leading-tight">
                        {candidates.find(c => c.id === selectedCandidate)?.firstName} {candidates.find(c => c.id === selectedCandidate)?.lastName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {candidates.find(c => c.id === selectedCandidate)?.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm pl-1">-- Choose a Candidate --</span>
                )}
                <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isCandidateDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </div>

              {isCandidateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCandidateDropdownOpen(false)} />
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-border bg-secondary/50 sticky top-0 z-10">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search candidates by name, email, or skills..."
                          value={candidateSearchQuery}
                          onChange={(e) => setCandidateSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {filteredCandidates.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCandidate(c.id); setIsCandidateDropdownOpen(false); }}
                          className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all ${selectedCandidate === c.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-secondary/60'} border border-transparent`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${selectedCandidate === c.id ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
                              {(c.firstName || '?').charAt(0)}{(c.lastName || '').charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className={`font-bold text-sm ${selectedCandidate === c.id ? 'text-primary' : 'text-foreground'}`}>
                                {c.firstName} {c.lastName}
                              </span>
                              <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {c.parsedSkills ? c.parsedSkills.substring(0, 45) + (c.parsedSkills.length > 45 ? '...' : '') : c.email}
                              </span>
                            </div>
                          </div>
                          {selectedCandidate === c.id && <CheckCircle size={18} className="text-primary animate-in zoom-in" />}
                        </button>
                      ))}
                      {candidates.length === 0 && (
                        <div className="p-6 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                          <Users size={24} className="opacity-20" />
                          {candidates.length === 0 ? "No candidates available" : "No candidates match your search"}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            ) : (
            <div className="space-y-2 relative animate-in fade-in">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText size={16} className="text-muted-foreground" /> Upload Candidate CV (PDF)
              </label>
              <div className="w-full p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full py-4 relative z-10">
                  <div className="p-4 bg-primary/10 text-primary rounded-full">
                    <FileText size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground mb-1">
                      {uploadedFile ? uploadedFile.name : "Click to upload CV (.pdf)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : "Max size: 5MB"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
            )}

            <div className={`space-y-2 relative ${isJobDropdownOpen ? 'z-50' : 'z-10'}`}>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Briefcase size={16} className="text-muted-foreground" /> Select Job Requirement
              </label>

              <div 
                onClick={() => { 
                  setIsJobDropdownOpen(!isJobDropdownOpen); 
                  setIsCandidateDropdownOpen(false); 
                  if (!isJobDropdownOpen) setJobSearchQuery("");
                }}
                className="w-full p-3 rounded-xl border border-border bg-background hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                {selectedJob ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
                      <Briefcase size={14} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-foreground leading-tight">
                        {jobs.find(j => j.id === selectedJob)?.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin size={10} /> {jobs.find(j => j.id === selectedJob)?.location}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm pl-1">-- Choose a Job --</span>
                )}
                <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isJobDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
              </div>

              {isJobDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsJobDropdownOpen(false)} />
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-border bg-emerald-500/5 sticky top-0 z-10">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50 dark:text-emerald-400/50" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search jobs by title or location..."
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:border-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {filteredJobs.map(j => (
                        <button
                          key={j.id}
                          onClick={() => { setSelectedJob(j.id); setIsJobDropdownOpen(false); }}
                          className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all ${selectedJob === j.id ? 'bg-emerald-500/10 border-emerald-500/20' : 'hover:bg-secondary/60'} border border-transparent`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${selectedJob === j.id ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                              <Briefcase size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className={`font-bold text-sm ${selectedJob === j.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                {j.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {j.location}
                              </span>
                            </div>
                          </div>
                          {selectedJob === j.id && <CheckCircle size={18} className="text-emerald-500 animate-in zoom-in" />}
                        </button>
                      ))}
                      {jobs.length === 0 && (
                        <div className="p-6 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                          <Briefcase size={24} className="opacity-20" />
                          {jobs.length === 0 ? "No jobs available" : "No jobs match your search"}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={handleScreening}
              disabled={(!selectedJob) || (screeningMode === 'candidate' && !selectedCandidate) || (screeningMode === 'cv' && !uploadedFile) || isScreening}
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
                <button 
                  onClick={() => handleDecision('Approved')}
                  disabled={isSavingDecision || saveStatus !== 'none'}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingDecision && saveStatus === 'none' ? <Loader2 className="animate-spin" size={20} /> : null}
                  {saveStatus === 'approved' ? <CheckCircle size={20} /> : null}
                  {saveStatus === 'approved' ? 'Approved!' : 'Approve Application'}
                </button>
                <button 
                  onClick={() => handleDecision('Rejected')}
                  disabled={isSavingDecision || saveStatus !== 'none'}
                  className="px-6 py-4 border border-border text-foreground rounded-2xl font-bold hover:bg-secondary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveStatus === 'rejected' ? <CheckCircle size={20} /> : null}
                  {saveStatus === 'rejected' ? 'Rejected' : 'Reject'}
                </button>
              </div>
              {saveStatus === 'error' && (
                <p className="text-red-500 text-sm mt-3 text-center">Failed to save decision. Server might reject CVs without formal DB Profiles.</p>
              )}
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
