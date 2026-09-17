import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: false,
      index: true
    },
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Project', 'Programming', 'Behavioral', 'HR'],
      default: 'Technical'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    technology: {
      type: String,
      default: 'General'
    },
    candidateAnswer: {
      type: String,
      default: ''
    },
    submittedCode: {
      type: String,
      default: ''
    },
    codeLanguage: {
      type: String,
      default: 'javascript'
    },
    status: {
      type: String,
      enum: ['pending', 'current', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Question', questionSchema);
