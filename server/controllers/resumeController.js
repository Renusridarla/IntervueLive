import Resume from '../models/Resume.js';
import { extractTextFromFile } from '../services/resumeService.js';
import { analyzeResumeText, generateQuestionsFromResume } from '../services/aiService.js';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    // Extract text from uploaded PDF/DOCX
    const rawText = await extractTextFromFile(filePath);

    // AI Analysis to extract structured profile
    const extractedInfo = await analyzeResumeText(rawText);

    // Find existing resume or create new
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      resume.filename = filename;
      resume.rawText = rawText;
      resume.extractedInfo = extractedInfo;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        filename,
        rawText,
        extractedInfo
      });
    }

    return res.status(201).json({
      message: 'Resume processed successfully',
      resume
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({ message: error.message || 'Error processing resume' });
  }
};

export const getMyResume = async (req, res) => {
  try {
    const userId = req.query.candidateId || req.user._id;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching resume' });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    const { candidateId, difficulty = 'Medium', categories = [] } = req.body;
    const targetUserId = candidateId || req.user._id;

    const resume = await Resume.findOne({ userId: targetUserId });
    const extractedInfo = resume?.extractedInfo || {
      skills: ['JavaScript', 'React', 'Node.js'],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
      projects: ['Full Stack Web Platform']
    };

    const questions = await generateQuestionsFromResume(extractedInfo, categories, difficulty);
    return res.json({ questions });
  } catch (error) {
    console.error('Generate questions error:', error);
    return res.status(500).json({ message: 'Error generating questions' });
  }
};
