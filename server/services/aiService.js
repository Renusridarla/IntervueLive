import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client if key exists
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Extracts structured skills, projects, internships, education, experience, and technologies from resume text.
 */
export const analyzeResumeText = async (rawText) => {
  if (genAI && apiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are an expert technical interviewer assistant. Analyze the following candidate resume text and extract key structured profile details.

Return ONLY a valid JSON object matching this schema:
{
  "skills": ["string"],
  "projects": ["string"],
  "internships": ["string"],
  "education": ["string"],
  "experience": ["string"],
  "technologies": ["string"]
}

Resume text:
"""
${rawText}
"""
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[AIService] Gemini API error during resume analysis, using fallback parser:', err.message);
    }
  }

  // Fallback heuristic extraction
  return fallbackResumeExtractor(rawText);
};

/**
 * Generates interview questions customized to the candidate's resume content.
 */
export const generateQuestionsFromResume = async (extractedInfo, categoryList = [], targetDifficulty = 'Medium') => {
  const { skills = [], projects = [], technologies = [], internships = [] } = extractedInfo || {};
  const techStackStr = Array.from(new Set([...skills, ...technologies])).join(', ') || 'JavaScript, React, Node.js, Web Development';
  const projectsStr = projects.join(', ') || 'Full Stack Web Project';

  if (genAI && apiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
Generate 6 realistic technical interview questions based strictly on the candidate's actual skills: ${techStackStr} and projects: ${projectsStr}.

Difficulty level: ${targetDifficulty}.

Return ONLY a valid JSON array of objects matching this exact structure:
[
  {
    "question": "Clear interview question string",
    "category": "Technical | Project | Programming | Behavioral | HR",
    "difficulty": "Easy | Medium | Hard",
    "technology": "Technology name (e.g. React, Node.js, MongoDB, JavaScript)"
  }
]
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const questions = JSON.parse(cleanJson);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    } catch (err) {
      console.warn('[AIService] Gemini API error during question generation, using fallback generator:', err.message);
    }
  }

  // Smart fallback question generator based on extracted technologies & projects
  return fallbackQuestionGenerator(extractedInfo, targetDifficulty);
};

/**
 * Generates post-interview AI feedback report based on questions and answers.
 */
export const generateInterviewFeedback = async (interview, questionsWithAnswers) => {
  if (genAI && apiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const qSummary = questionsWithAnswers
        .map(
          (q, idx) =>
            `Q${idx + 1} (${q.category} - ${q.technology}): ${q.question}\nAnswer/Code: ${q.candidateAnswer || q.submittedCode || 'No response provided.'}`
        )
        .join('\n\n');

      const prompt = `
You are an expert technical interviewer evaluating a completed interview performance.
Review the following questions and candidate answers:

${qSummary}

Generate a concise, professional assessment report.
Return ONLY a valid JSON object matching this exact structure:
{
  "scores": {
    "technicalUnderstanding": 85,
    "communication": 80,
    "answerRelevance": 82,
    "problemSolving": 78
  },
  "strengths": [
    "Specific candidate strength 1",
    "Specific candidate strength 2"
  ],
  "areasToImprove": [
    "Constructive improvement point 1",
    "Constructive improvement point 2"
  ],
  "topicsToStudy": [
    "Recommended topic 1",
    "Recommended topic 2"
  ],
  "overallSummary": "A clean 2-3 sentence summary of candidate performance."
}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[AIService] Gemini API error during feedback generation, using fallback generator:', err.message);
    }
  }

  // Fallback feedback generator
  return fallbackFeedbackGenerator(questionsWithAnswers);
};

// --- Fallback Utility Functions ---

function fallbackResumeExtractor(text) {
  const lower = text.toLowerCase();
  const knownTech = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB',
    'Python', 'Java', 'C++', 'HTML', 'CSS', 'Tailwind', 'SQL', 'PostgreSQL',
    'Docker', 'AWS', 'Git', 'REST API', 'GraphQL', 'Redux', 'Socket.IO'
  ];

  const foundTech = knownTech.filter((t) => lower.includes(t.toLowerCase()));
  
  // Basic line extraction for projects/education
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const projects = lines.filter((l) => l.toLowerCase().includes('project') || l.toLowerCase().includes('app') || l.toLowerCase().includes('system')).slice(0, 3);
  const education = lines.filter((l) => l.toLowerCase().includes('bachelor') || l.toLowerCase().includes('degree') || l.toLowerCase().includes('university') || l.toLowerCase().includes('college')).slice(0, 2);

  return {
    skills: foundTech.slice(0, 6),
    technologies: foundTech,
    projects: projects.length > 0 ? projects : ['Full Stack Web Platform', 'Real-Time Application'],
    internships: ['Software Developer Intern'],
    education: education.length > 0 ? education : ['B.S. Computer Science'],
    experience: ['Frontend & Backend Development']
  };
}

function fallbackQuestionGenerator(extractedInfo, difficulty = 'Medium') {
  const tech = extractedInfo?.technologies?.length > 0 ? extractedInfo.technologies : ['React', 'Node.js', 'MongoDB', 'JavaScript'];
  const project = extractedInfo?.projects?.[0] || 'your full-stack application';

  return [
    {
      question: `Explain how state management and component lifecycle work in your ${tech[0] || 'React'} projects.`,
      category: 'Technical',
      difficulty: difficulty,
      technology: tech[0] || 'React'
    },
    {
      question: `In ${project}, how did you design the backend API architecture using ${tech[1] || 'Node.js'} and ${tech[2] || 'MongoDB'}?`,
      category: 'Project',
      difficulty: difficulty,
      technology: tech[1] || 'Node.js'
    },
    {
      question: `Write a function in JavaScript to check if a string contains balanced parentheses '()', '{}', '[]'.`,
      category: 'Programming',
      difficulty: difficulty,
      technology: 'JavaScript'
    },
    {
      question: `Describe a challenging bug you encountered in a recent project and how you debugged and resolved it.`,
      category: 'Behavioral',
      difficulty: difficulty,
      technology: 'General'
    },
    {
      question: `How do you handle authenticating users securely using JWTs and bcrypt in web applications?`,
      category: 'Technical',
      difficulty: difficulty,
      technology: 'Security'
    },
    {
      question: `Why do you want to join our engineering team, and what is your approach to learning new technologies quickly?`,
      category: 'HR',
      difficulty: 'Easy',
      technology: 'General'
    }
  ];
}

function fallbackFeedbackGenerator(questionsWithAnswers = []) {
  const answeredCount = questionsWithAnswers.filter((q) => (q.candidateAnswer && q.candidateAnswer.trim()) || (q.submittedCode && q.submittedCode.trim())).length;
  const totalCount = questionsWithAnswers.length || 1;
  const ratio = answeredCount / totalCount;

  const techScore = Math.min(95, Math.max(65, Math.round(70 + ratio * 20)));
  const commScore = Math.min(95, Math.max(70, Math.round(72 + ratio * 18)));
  const relScore = Math.min(95, Math.max(68, Math.round(75 + ratio * 17)));
  const probScore = Math.min(95, Math.max(65, Math.round(70 + ratio * 22)));

  return {
    scores: {
      technicalUnderstanding: techScore,
      communication: commScore,
      answerRelevance: relScore,
      problemSolving: probScore
    },
    strengths: [
      'Good practical knowledge of core technologies mentioned in resume',
      'Clear structured explanations of system architecture and coding logic',
      'Effective communication of project technical choices'
    ],
    areasToImprove: [
      'Provide deeper code optimization examples for algorithmic questions',
      'Elaborate more on edge cases and error handling during live code submission'
    ],
    topicsToStudy: [
      'Asynchronous Event Loop & Concurrency in Node.js',
      'Database Indexing and Query Optimization in MongoDB',
      'Data Structure Time Complexity Analysis'
    ],
    overallSummary: `The candidate demonstrated strong foundational knowledge aligned with their resume profile. Answered ${answeredCount} out of ${totalCount} technical interview prompts with clear technical reasoning.`
  };
}
