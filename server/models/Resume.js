import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    filename: {
      type: String,
      required: true
    },
    rawText: {
      type: String,
      default: ''
    },
    extractedInfo: {
      skills: [{ type: String }],
      projects: [{ type: String }],
      internships: [{ type: String }],
      education: [{ type: String }],
      experience: [{ type: String }],
      technologies: [{ type: String }]
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Resume', resumeSchema);
