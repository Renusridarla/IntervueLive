import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Resume from '../models/Resume.js';
import { generateQuestionsFromResume } from '../services/aiService.js';

// Helper to generate crisp Room ID like INT-8F42K
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'INT-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createInterview = async (req, res) => {
  try {
    const {
      title,
      candidateId,
      interviewType = 'Technical Interview',
      duration = 45,
      difficulty = 'Medium',
      customQuestions = []
    } = req.body;

    if (!title || !candidateId) {
      return res.status(400).json({ message: 'Title and candidate are required' });
    }

    const roomId = generateRoomId();

    // Fetch candidate resume to build AI questions
    const resume = await Resume.findOne({ userId: candidateId });
    const extractedInfo = resume?.extractedInfo || {
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
      projects: ['Full Stack Web Platform']
    };

    let questionsData = [];
    if (customQuestions && customQuestions.length > 0) {
      questionsData = customQuestions;
    } else {
      questionsData = await generateQuestionsFromResume(extractedInfo, [], difficulty);
    }

    // Create Interview document first
    const interview = await Interview.create({
      interviewId: roomId,
      title,
      interviewerId: req.user._id,
      candidateId,
      interviewType,
      duration,
      questions: [],
      status: 'scheduled'
    });

    // Save Questions with interview reference
    const savedQuestions = await Promise.all(
      questionsData.map((q) =>
        Question.create({
          interviewId: interview._id,
          question: q.question,
          category: q.category || 'Technical',
          difficulty: q.difficulty || difficulty,
          technology: q.technology || 'General'
        })
      )
    );

    interview.questions = savedQuestions.map((sq) => sq._id);
    await interview.save();

    const populatedInterview = await Interview.findById(interview._id)
      .populate('interviewerId', 'name email')
      .populate('candidateId', 'name email')
      .populate('questions');

    return res.status(201).json(populatedInterview);
  } catch (error) {
    console.error('Create interview error:', error);
    return res.status(500).json({ message: 'Error creating interview' });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const query = req.user.role === 'interviewer'
      ? { interviewerId: req.user._id }
      : { candidateId: req.user._id };

    const interviews = await Interview.find(query)
      .populate('interviewerId', 'name email')
      .populate('candidateId', 'name email')
      .populate('questions')
      .sort({ createdAt: -1 });

    return res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    return res.status(500).json({ message: 'Error fetching interviews' });
  }
};

export const getInterviewByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await Interview.findOne({ interviewId: roomId.toUpperCase() })
      .populate('interviewerId', 'name email role')
      .populate('candidateId', 'name email role')
      .populate('questions');

    if (!interview) {
      return res.status(404).json({ message: 'Interview room not found' });
    }

    return res.json(interview);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching interview room' });
  }
};

export const saveQuestionResponse = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { candidateAnswer, submittedCode, codeLanguage } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (candidateAnswer !== undefined) question.candidateAnswer = candidateAnswer;
    if (submittedCode !== undefined) question.submittedCode = submittedCode;
    if (codeLanguage !== undefined) question.codeLanguage = codeLanguage;

    await question.save();
    return res.json(question);
  } catch (error) {
    return res.status(500).json({ message: 'Error saving question response' });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentQuestionIndex } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (status) {
      interview.status = status;
      if (status === 'in-progress' && !interview.startTime) {
        interview.startTime = new Date();
      }
      if (status === 'completed' && !interview.endTime) {
        interview.endTime = new Date();
      }
    }

    if (currentQuestionIndex !== undefined) {
      interview.currentQuestionIndex = currentQuestionIndex;
    }

    await interview.save();
    return res.json(interview);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating interview status' });
  }
};
