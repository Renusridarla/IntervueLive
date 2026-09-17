import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    interviewId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    interviewType: {
      type: String,
      default: 'Technical Interview'
    },
    duration: {
      type: Number,
      default: 45 // in minutes
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed'],
      default: 'scheduled'
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Interview', interviewSchema);
