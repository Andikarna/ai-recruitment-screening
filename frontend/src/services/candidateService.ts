import api from './api';

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  expectedSalary: number;
  parsedSkills: string;
}

export const CandidateService = {
  getAll: async () => {
    const response = await api.get<Candidate[]>('/candidates');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<Candidate>(`/candidates/${id}`);
    return response.data;
  },
  
  create: async (candidate: Omit<Candidate, 'id'>) => {
    const response = await api.post<Candidate>('/candidates', candidate);
    return response.data;
  },
  
  update: async (id: string, candidate: Candidate) => {
    const response = await api.put(`/candidates/${id}`, candidate);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  }
};
