import api from './api';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  isActive: boolean;
  candidatesCount?: number;
}

export const JobService = {
  getAll: async () => {
    const response = await api.get<JobPosting[]>('/jobs');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<JobPosting>(`/jobs/${id}`);
    return response.data;
  },
  
  create: async (job: Omit<JobPosting, 'id'>) => {
    const response = await api.post<JobPosting>('/jobs', job);
    return response.data;
  }
};
