"use client";

import React, { useEffect, useState } from "react";
import { JobService, JobPosting } from "@/services/jobService";
import { Briefcase, Plus, Search, MapPin, CheckCircle, XCircle } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await JobService.getAll();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await JobService.create({ ...formData, isActive: true });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', requirements: '', location: '' });
      fetchJobs();
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("Failed to create job posting. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Postings</h1>
          <p className="text-muted-foreground">Manage active vacancies and job descriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus size={18} />
          <span>Create New Job</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-xl shadow-sm">
        <Search size={20} className="text-muted-foreground ml-2" />
        <input 
          type="text" 
          placeholder="Search jobs by title or location..." 
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Briefcase size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-foreground mb-1">No jobs found</h3>
          <p className="text-muted-foreground text-sm">Get started by creating a new job posting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <Briefcase size={20} />
                </div>
                {job.isActive ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <CheckCircle size={12} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    <XCircle size={12} /> Closed
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1">{job.title}</h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {job.description}
              </p>
              
              <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">0 Candidates</span>
                <button className="text-sm font-bold text-primary hover:underline">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">Create New Job Posting</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Frontend Engineer" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input 
                  type="text" 
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Jakarta, Indonesia (Hybrid)" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <textarea 
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the role..." 
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <textarea 
                  name="requirements"
                  required
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Comma-separated skills (e.g. React, TypeScript, Node.js)" 
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  <span>Publish Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
