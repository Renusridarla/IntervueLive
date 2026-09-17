import Feedback from '../models/Feedback.js';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import { generateInterviewFeedback } from '../services/aiService.js';

export const generateOrGetFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId)
      .populate('questions')
      .populate('candidateId', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    let feedback = await Feedback.findOne({ interviewId: interview._id });

    if (!feedback) {
      // Generate new AI Feedback using questions & candidate answers
      const aiFeedbackData = await generateInterviewFeedback(
        interview,
        interview.questions
      );

      feedback = await Feedback.create({
        interviewId: interview._id,
        candidateId: interview.candidateId._id,
        scores: aiFeedbackData.scores,
        strengths: aiFeedbackData.strengths,
        areasToImprove: aiFeedbackData.areasToImprove,
        topicsToStudy: aiFeedbackData.topicsToStudy,
        overallSummary: aiFeedbackData.overallSummary
      });
    }

    return res.json({
      interview,
      feedback
    });
  } catch (error) {
    console.error('Generate feedback error:', error);
    return res.status(500).json({ message: 'Error generating feedback report' });
  }
};
