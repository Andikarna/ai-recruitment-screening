import api from './api';

export interface Application {
  id: string;
  jobPostingId: string;
  candidateId: string;
  matchScore: number;
  status: string;
  aiRecommendation: string;
}

export const ApplicationService = {
  getAll: async () => {
    const response = await api.get<Application[]>('/applications');
    return response.data;
  },
  
  create: async (application: Omit<Application, 'id'>) => {
    const response = await api.post<Application>('/applications', application);
    return response.data;
  }
};
