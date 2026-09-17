import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Video,
  Plus,
  Users,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const InterviewerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interviews');
        setInterviews(res.data);
      } catch (err) {
        console.error('Error fetching interviewer interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const handleCopyRoomId = (roomId) => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = interviews.filter((i) => i.status === 'in-progress' || i.status === 'scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome & Create CTA Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interviewer Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome, {user?.name} — Manage candidates, create AI resume-based rooms, and conduct live coding evaluations.
            </p>
          </div>

          <Link
            to="/interviews/create"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create New Interview Room
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Conducted</span>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">{interviews.length}</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active / Scheduled</span>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">{activeCount}</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Reports</span>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">{completedCount}</div>
          </div>
        </div>

        {/* Interviews List Table */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Technical Interview Sessions</h3>
            <span className="text-xs font-mono text-slate-500">{interviews.length} sessions</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading interview records...</div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">No interview sessions created yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Create New Interview Room" above to select a candidate and generate AI questions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Title & Type</th>
                    <th className="py-3 px-6">Room ID</th>
                    <th className="py-3 px-6">Candidate</th>
                    <th className="py-3 px-6">Questions</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {interviews.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        <div>{item.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.interviewType || 'Technical'}</div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-800 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{item.interviewId}</span>
                          <button
                            onClick={() => handleCopyRoomId(item.interviewId)}
                            title="Copy Room ID"
                            className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {copiedId === item.interviewId ? (
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700">
                        <div className="font-semibold">{item.candidateId?.name || 'Candidate'}</div>
                        <div className="text-[11px] text-slate-400">{item.candidateId?.email}</div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-mono">
                        {item.questions?.length || 0} AI Questions
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.status === 'completed'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : item.status === 'in-progress'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <Link
                          to={`/interview/${item.interviewId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          Enter Room <ExternalLink className="w-3 h-3" />
                        </Link>
                        {item.status === 'completed' && (
                          <Link
                            to={`/interview/${item._id}/report`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                          >
                            AI Report
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
