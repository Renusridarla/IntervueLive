import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Award,
  BookOpen,
  ArrowLeft,
  Code2
} from 'lucide-react';

export const InterviewReportPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/feedback/${interviewId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading interview report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-mono">Generating AI Final Performance Report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Report Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'Feedback report not available.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { interview, feedback } = data;
  const scores = feedback?.scores || {
    technicalUnderstanding: 80,
    communication: 75,
    answerRelevance: 85,
    problemSolving: 78
  };

  const chartData = [
    { name: 'Technical', score: scores.technicalUnderstanding },
    { name: 'Communication', score: scores.communication },
    { name: 'Relevance', score: scores.answerRelevance },
    { name: 'Problem Solving', score: scores.problemSolving }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <span className="text-xs font-mono text-slate-500">
            Session Room: {interview.interviewId}
          </span>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 mb-2">
                <Sparkles className="w-3 h-3 text-slate-900" /> AI-Generated Evaluation Report
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {interview.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Candidate: <strong>{interview.candidateId?.name}</strong> ({interview.candidateId?.email})
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-slate-900">
                {Math.round(
                  (scores.technicalUnderstanding +
                    scores.communication +
                    scores.answerRelevance +
                    scores.problemSolving) / 4
                )}%
              </div>
              <div className="text-xs text-slate-500">Overall Performance Index</div>
            </div>
          </div>

          {/* AI Summary Banner */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Executive Evaluation Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {feedback?.overallSummary || 'The candidate demonstrated strong foundational knowledge aligned with their resume profile.'}
            </p>
          </div>

          {/* Performance Chart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
            {/* Chart Column */}
            <div className="md:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-700" /> Performance Metric Breakdown
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths & Improvements Column */}
            <div className="md:col-span-6 space-y-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-800" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {feedback?.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-700" /> Areas for Improvement
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {feedback?.areasToImprove?.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Topics to Study */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-300" /> Recommended Study Topics
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedback?.topicsToStudy?.map((topic, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Question & Answer Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            Interview Questions & Candidate Responses Log
          </h3>

          <div className="space-y-6">
            {interview.questions?.map((q, idx) => (
              <div key={q._id || idx} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
                  <span>Question {idx + 1} ({q.category})</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-sans">
                    {q.technology}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mb-3">{q.question}</h5>

                {/* Candidate Verbal Answer */}
                {q.candidateAnswer && (
                  <div className="mb-3 p-3 bg-white rounded border border-slate-200 text-xs text-slate-800">
                    <strong className="block text-slate-500 text-[11px] mb-1">Verbal / Text Response:</strong>
                    <p className="leading-relaxed">{q.candidateAnswer}</p>
                  </div>
                )}

                {/* Candidate Submitted Code */}
                {q.submittedCode && (
                  <div className="p-3 bg-slate-950 rounded border border-slate-900 font-mono text-xs text-slate-200 overflow-x-auto">
                    <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                      <span>Submitted Code ({q.codeLanguage || 'javascript'})</span>
                    </div>
                    <pre className="text-[11px]">{q.submittedCode}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
