import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    scores: {
      technicalUnderstanding: { type: Number, default: 80 },
      communication: { type: Number, default: 75 },
      answerRelevance: { type: Number, default: 85 },
      problemSolving: { type: Number, default: 78 }
    },
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    topicsToStudy: [{ type: String }],
    overallSummary: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Feedback', feedbackSchema);
