"use client";

import React, { useEffect, useState } from "react";
import { CandidateService, Candidate } from "@/services/candidateService";
import { Users, Plus, Search, Mail, Phone, Code, FileText, X, Loader2, Trash2, Building, DollarSign } from "lucide-react";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    expectedSalary: 0,
    parsedSkills: ""
  });
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await CandidateService.getAll();
      setCandidates(data);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "expectedSalary" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await CandidateService.create(formData);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        expectedSalary: 0,
        parsedSkills: ""
      });
      // Refresh list
      fetchCandidates();
    } catch (error) {
      console.error("Failed to create candidate:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return;
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await CandidateService.delete(selectedCandidate.id);
      setIsDetailsModalOpen(false);
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert("Failed to delete candidate. Please check your connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    (c.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.parsedSkills || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
          <p className="text-muted-foreground">Manage your talent pool and view candidate profiles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus size={18} />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-xl shadow-sm">
        <Search size={20} className="text-muted-foreground ml-2" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search candidates by name, email, or skills..." 
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Users size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-foreground mb-1">No candidates found</h3>
          <p className="text-muted-foreground text-sm">Upload resumes or manually add candidates to build your pool.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Skills</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Salary</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No candidates match your search.</td>
                  </tr>
                ) : null}
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {(candidate.firstName || '?').charAt(0)}{(candidate.lastName || '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{candidate.firstName || 'Unknown'} {candidate.lastName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <FileText size={12} /> Profile Manual
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="opacity-70" /> {candidate.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="opacity-70" /> {candidate.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {candidate.parsedSkills ? candidate.parsedSkills.split(',').slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs border border-border font-medium">
                            {skill.trim()}
                          </span>
                        )) : <span className="text-muted-foreground opacity-50 italic">Not extracted</span>}
                        {candidate.parsedSkills && candidate.parsedSkills.split(',').length > 3 && (
                          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs border border-border font-medium opacity-70">
                            +{candidate.parsedSkills.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs">
                        Rp {(candidate.expectedSalary || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetails(candidate)}
                        className="text-sm font-bold text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <h2 className="text-xl font-bold text-foreground">Add New Candidate</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="candidate-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">First Name</label>
                    <input 
                      required
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Last Name</label>
                    <input 
                      required
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Expected Salary (Rp)</label>
                    <input 
                      required
                      type="number" 
                      name="expectedSalary"
                      value={formData.expectedSalary || ''}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm"
                      placeholder="9000000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Skills (Comma separated)</label>
                  <textarea 
                    required
                    name="parsedSkills"
                    value={formData.parsedSkills}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-border bg-transparent outline-none focus:border-primary transition-colors text-sm resize-none"
                    placeholder="React, TypeScript, Node.js, SQL"
                  />
                  <p className="text-xs text-muted-foreground">E.g., CSS, JavaScript, React, System Design</p>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-secondary/30 mt-auto">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="candidate-form"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 min-w-[120px]"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm text-lg">
                  {(selectedCandidate.firstName || '?').charAt(0)}{(selectedCandidate.lastName || '').charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedCandidate.firstName} {selectedCandidate.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText size={14} /> Profile details
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Users size={16} /> Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5"><Mail size={16} /></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                        <p className="text-sm font-medium text-foreground">{selectedCandidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5"><Phone size={16} /></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                        <p className="text-sm font-medium text-foreground">{selectedCandidate.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Building size={16} /> Professional Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary rounded-lg text-muted-foreground mt-0.5"><DollarSign size={16} /></div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Expected Salary</p>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Rp {(selectedCandidate.expectedSalary || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                  <Code size={16} /> Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.parsedSkills ? (
                    selectedCandidate.parsedSkills.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No skills extracted from resume.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/30 mt-auto">
              <button 
                onClick={handleDeleteCandidate}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>Delete Candidate</span>
              </button>
              
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
