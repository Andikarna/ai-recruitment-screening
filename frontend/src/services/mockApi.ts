import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// --- MOCK DATA ---

const DUMMY_CANDIDATES = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phoneNumber: '123-456-7890', expectedSalary: 80000, parsedSkills: 'React, Node.js, TypeScript' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phoneNumber: '987-654-3210', expectedSalary: 95000, parsedSkills: 'Python, Django, PostgreSQL' }
];

const DUMMY_JOBS = [
  { id: '1', title: 'Frontend Developer', description: 'Looking for a skilled frontend developer.', requirements: 'React, TypeScript, CSS', location: 'Remote', isActive: true, candidatesCount: 5 },
  { id: '2', title: 'Backend Developer', description: 'Seeking a backend wizard.', requirements: 'Node.js, Express, MongoDB', location: 'New York', isActive: true, candidatesCount: 2 },
  { id: '3', title: 'UI/UX Designer', description: 'Creative designer needed for our new product lines.', requirements: 'Figma, Adobe XD, User Research', location: 'Remote', isActive: true, candidatesCount: 8 },
  { id: '4', title: 'Fullstack Developer', description: 'Versatile developer to handle both frontend and backend tasks.', requirements: 'React, Node.js, PostgreSQL', location: 'San Francisco, CA', isActive: true, candidatesCount: 12 },
  { id: '5', title: 'DevOps Engineer', description: 'Maintain and scale our cloud infrastructure.', requirements: 'AWS, Docker, Kubernetes, CI/CD', location: 'Austin, TX', isActive: true, candidatesCount: 3 },
  { id: '6', title: 'Product Manager', description: 'Lead the product development lifecycle from ideation to launch.', requirements: 'Agile, Scrum, Strategy, Communication', location: 'Remote', isActive: true, candidatesCount: 15 },
  { id: '7', title: 'Data Scientist', description: 'Extract meaningful insights from our large datasets.', requirements: 'Python, Machine Learning, SQL', location: 'Seattle, WA', isActive: true, candidatesCount: 4 },
  { id: '8', title: 'QA Engineer', description: 'Ensure the highest quality of our software releases.', requirements: 'Selenium, Cypress, Manual Testing', location: 'Remote', isActive: true, candidatesCount: 6 },
  { id: '9', title: 'Mobile Developer', description: 'Build and maintain our iOS and Android applications.', requirements: 'Flutter, Dart, Mobile UI', location: 'London, UK', isActive: true, candidatesCount: 7 }
];

const DUMMY_APPLICATIONS = [
  { id: '1', jobPostingId: '1', candidateId: '1', matchScore: 85, status: 'Reviewed', aiRecommendation: 'Strong fit for frontend roles.' },
  { id: '2', jobPostingId: '2', candidateId: '2', matchScore: 92, status: 'Interview', aiRecommendation: 'Excellent backend skills matching requirements.' }
];

// --- CUSTOM SCREENING LOGIC ---

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Mocks the screening endpoint: /screening/screen/{candidateId}?jobId={jobId}
// It now directly calls the Gemini LLM instead of random numbers, replicating backend logic
const performLLMScreening = async (candidateId: string, jobId: string) => {
  const candidate = DUMMY_CANDIDATES.find(c => c.id === candidateId);
  const job = DUMMY_JOBS.find(j => j.id === jobId);

  if (!candidate || !job) {
    return {
      candidateId: candidateId || "unknown",
      candidateName: "Unknown Candidate",
      overallScore: 0,
      skillMatches: [],
      summary: "Candidate or Job not found. Could not perform mock screening."
    };
  }

  const systemPrompt = `You are an expert technical AI recruiter evaluating a candidate for a job position. 
Analyze the candidate's skills and profile against the job requirements.
IMPORTANT: You MUST evaluate 'related' or 'transferable' skills and experiences favorably! 
Do not just look for exact string matches. If a candidate has a highly related skill that serves the same purpose or shows capability, consider it a match (relevance score close to 1.0). 
If they have related roles/positions, grant them higher overall scores and acknowledge their transferable capabilities as 'opportunities'.

Respond EXCLUSIVELY in the following JSON format without any markdown formatting wrappers:
{
  "OverallScore": 85.5,
  "SkillMatches": [
    {
      "SkillName": "React",
      "IsMatched": true,
      "RelevanceScore": 1.0
    }
  ],
  "Summary": "A concise explanation of why this candidate is a good/bad match, highlighting transferable skills."
}`;

  const userPrompt = `
Job Title: ${job.title}
Job Description: ${job.description}
Job Requirements: ${job.requirements}

Candidate Name: ${candidate.firstName} ${candidate.lastName}
Candidate Skills: ${candidate.parsedSkills}
Expected Salary: ${candidate.expectedSalary}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        // Clean away any markdown blocks the LLM might have ignored instruction on 
        const cleanJson = textResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        return {
          candidateId,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          overallScore: parsed.OverallScore || parsed.overallScore || 0,
          skillMatches: (parsed.SkillMatches || parsed.skillMatches || []).map((sm: any) => ({
            skillName: sm.SkillName || sm.skillName,
            isMatched: sm.IsMatched || sm.isMatched,
            relevanceScore: sm.RelevanceScore || sm.relevanceScore
          })),
          summary: `(Direct Frontend LLM) ${parsed.Summary || parsed.summary}`
        };
      }
    }
  } catch (err) {
    console.error("Direct frontend Gemini LLM call failed, falling back to basic mock.", err);
  }

  // Fallback naive logic if Gemini fails
  const overallScore = Math.floor(Math.random() * 40) + 60;
  const requiredSkills = job.requirements.split(',').map(s => s.trim());
  const candidateSkills = candidate.parsedSkills.split(',').map(s => s.trim());
  
  const skillMatches = requiredSkills.map(reqSkill => {
    const isMatched = candidateSkills.some(cs => cs.toLowerCase().includes(reqSkill.toLowerCase()));
    return {
      skillName: reqSkill,
      isMatched,
      relevanceScore: isMatched ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 20
    };
  });

  return {
    candidateId,
    candidateName: `${candidate.firstName} ${candidate.lastName}`,
    overallScore,
    skillMatches,
    summary: `(Mock Data Fallback) ${candidate.firstName} has been locally screened because the LLM prompt failed.`
  };
};

// Mocks the CV file upload screening endpoint: /screening/upload-and-screen
const performLLMCvScreening = async (file: File, jobId: string) => {
  const job = DUMMY_JOBS.find(j => j.id === jobId);

  if (!job) {
    return {
      candidateId: "unknown",
      candidateName: `Uploaded CV: ${file.name}`,
      overallScore: 0,
      skillMatches: [],
      summary: "Job not found. Could not perform mock CV screening."
    };
  }

  const systemPrompt = `You are an expert technical AI recruiter evaluating a candidate for a job position. 
Analyze the candidate's skills and profile against the job requirements based on the provided CV document.
IMPORTANT: You MUST evaluate 'related' or 'transferable' skills and experiences favorably! 
Do not just look for exact string matches. If a candidate has a highly related skill that serves the same purpose or shows capability, consider it a match (relevance score close to 1.0). 
If they have related roles/positions, grant them higher overall scores and acknowledge their transferable capabilities as 'opportunities'.

Respond EXCLUSIVELY in the following JSON format without any markdown formatting wrappers:
{
  "OverallScore": 85.5,
  "SkillMatches": [
    {
      "SkillName": "React",
      "IsMatched": true,
      "RelevanceScore": 1.0
    }
  ],
  "Summary": "A concise explanation of why this candidate is a good/bad match, highlighting transferable skills."
}`;

  const userPrompt = `
Job Title: ${job.title}
Job Description: ${job.description}
Job Requirements: ${job.requirements}

Candidate CV Content is attached to this request.
`;

  try {
    const fileToBase64 = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
      });
    };

    const base64Data = await fileToBase64(file);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ 
          role: "user", 
          parts: [
            { text: userPrompt },
            {
              inline_data: {
                mime_type: file.type || "application/pdf",
                data: base64Data
              }
            }
          ] 
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const cleanJson = textResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        return {
          candidateId: Math.random().toString(),
          candidateName: `Uploaded CV: ${file.name}`,
          overallScore: parsed.OverallScore || parsed.overallScore || 0,
          skillMatches: (parsed.SkillMatches || parsed.skillMatches || []).map((sm: any) => ({
            skillName: sm.SkillName || sm.skillName,
            isMatched: sm.IsMatched || sm.isMatched,
            relevanceScore: sm.RelevanceScore || sm.relevanceScore
          })),
          summary: `(Direct Frontend CV LLM) ${parsed.Summary || parsed.summary}`
        };
      }
    } else {
      console.error("Gemini API error", await response.text());
    }
  } catch (err) {
    console.error("Direct frontend Gemini LLM CV call failed, falling back to basic mock.", err);
  }

  // Fallback naive logic
  const overallScore = Math.floor(Math.random() * 40) + 60;
  const requiredSkills = job.requirements.split(',').map(s => s.trim());
  
  const skillMatches = requiredSkills.map(reqSkill => {
    const isMatched = Math.random() > 0.5;
    return {
      skillName: reqSkill,
      isMatched,
      relevanceScore: isMatched ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 20
    };
  });

  return {
    candidateId: Math.random().toString(),
    candidateName: `Uploaded CV: ${file.name}`,
    overallScore,
    skillMatches,
    summary: `(Mock CV Fallback) The LLM prompt failed to parse the uploaded file ${file.name}.`
  };
};

export const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<any> => {
  const { url, method, data } = config;

  console.log(`[Mock API] Intercepted ${method?.toUpperCase()} ${url}`);
  
  // Helper to create a successful response
  const formatResponse = (responseData: any, status = 200): AxiosResponse => ({
    data: responseData,
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  });

  // Small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // ROUTING / ENDPOINTS
    if (url?.startsWith('/candidates')) {
      if (method === 'get') {
        const idMatch = url.match(/\/candidates\/(.+)$/);
        if (idMatch && idMatch[1]) {
          const candidate = DUMMY_CANDIDATES.find(c => c.id === idMatch[1]);
          return formatResponse(candidate || null);
        }
        return formatResponse(DUMMY_CANDIDATES);
      }
      if (method === 'post') {
        const newData = JSON.parse(data);
        return formatResponse({ ...newData, id: Math.random().toString() });
      }
      if (method === 'put') {
        const newData = JSON.parse(data);
        return formatResponse(newData);
      }
      if (method === 'delete') {
        return formatResponse({});
      }
    }

    if (url?.startsWith('/jobs')) {
      if (method === 'get') {
        const idMatch = url.match(/\/jobs\/(.+)$/);
        if (idMatch && idMatch[1]) {
          const job = DUMMY_JOBS.find(j => j.id === idMatch[1]);
          return formatResponse(job || null);
        }
        return formatResponse(DUMMY_JOBS);
      }
      if (method === 'post') {
        const newData = JSON.parse(data);
        return formatResponse({ ...newData, id: Math.random().toString() });
      }
    }

    if (url?.startsWith('/applications')) {
      if (method === 'get') {
        return formatResponse(DUMMY_APPLICATIONS);
      }
      if (method === 'post') {
        const newData = JSON.parse(data);
        return formatResponse({ ...newData, id: Math.random().toString() });
      }
    }

    if (url?.startsWith('/screening')) {
      if (url.includes('/screen/')) {
        // e.g., /screening/screen/1?jobId=1
        const candidateIdMatch = url.match(/\/screening\/screen\/([^\?]+)/);
        const jobIdMatch = url.match(/jobId=([^&]+)/);
        
        const candidateId = candidateIdMatch ? candidateIdMatch[1] : '';
        const jobId = jobIdMatch ? jobIdMatch[1] : '';
        
        return formatResponse(await performLLMScreening(candidateId, jobId));
      }
      
      if (url.includes('/upload-and-screen')) {
        // Handle FormData mocked submission
        const formData = data as any;
        let jobId = '1';
        let file = null;
        if (formData && typeof formData.get === 'function') {
           jobId = formData.get('jobId') || '1';
           file = formData.get('file');
        }

        if (file instanceof File) {
          return formatResponse(await performLLMCvScreening(file, jobId));
        }

        // Just use random mock screening result 
        // since we don't parse pdf locally
        return formatResponse({
          candidateId: Math.random().toString(),
          candidateName: "Uploaded Candidate",
          overallScore: 75,
          skillMatches: [
            { skillName: "Communication", isMatched: true, relevanceScore: 80 }
          ],
          summary: "(Mock Data) Fast local screening of uploaded CV failed because file format was invalid."
        });
      }
    }

    // Default fallback
    return formatResponse({ message: 'Mock route not implemented for ' + url }, 404);
  } catch (error) {
    console.error('[Mock API] Error in mock adapter', error);
    return formatResponse({ error: 'Mock internal error' }, 500);
  }
};
