import api from './api';

export interface SkillMatch {
  skillName: string;
  isMatched: boolean;
  relevanceScore: number;
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  overallScore: number;
  skillMatches: SkillMatch[];
  summary: string;
}

export const ScreeningService = {
  screenCandidate: async (candidateId: string, jobId: string) => {
    const response = await api.get<ScreeningResult>(`/screening/screen/${candidateId}?jobId=${jobId}`);
    return response.data;
  },
  screenUploadedCv: async (file: File, jobId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobId', jobId);
    const response = await api.post<ScreeningResult>(`/screening/upload-and-screen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
