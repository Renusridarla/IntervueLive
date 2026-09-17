import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Sparkles,
  Video,
  User,
  Clock,
  Layers,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const InterviewCreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [interviewType, setInterviewType] = useState('Full-Stack Technical Interview');
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('Medium');
  const [candidates, setCandidates] = useState([]);

  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/auth/candidates');
        setCandidates(res.data);
        if (res.data.length > 0) {
          setCandidateId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !candidateId) {
      setError('Please fill in the title and select a candidate.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/interviews', {
        title,
        candidateId,
        interviewType,
        duration: Number(duration),
        difficulty
      });

      // Navigate to the newly created room
      navigate(`/interview/${res.data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating interview session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Interview Room</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Setup a real-time interview session. The AI will automatically parse the candidate's resume and generate custom technical questions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior React & Node.js Developer Evaluation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
              />
            </div>

            {/* Candidate Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Candidate</label>
              {loadingCandidates ? (
                <div className="text-xs text-slate-400 p-2">Loading candidates...</div>
              ) : candidates.length === 0 ? (
                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200">
                  No registered candidates found. Tell your candidate to register an account first.
                </div>
              ) : (
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                >
                  {candidates.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Type</label>
              <input
                type="text"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
              />
            </div>

            {/* Grid for Duration & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Generates unique Room ID (e.g. INT-8F42K)</span>
              <button
                type="submit"
                disabled={submitting || candidates.length === 0}
                className="px-6 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Generating Questions & Room...
                  </>
                ) : (
                  <>
                    <span>Generate Room & Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
