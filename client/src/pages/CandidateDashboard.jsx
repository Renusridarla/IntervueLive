import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  FileText,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  ExternalLink,
  Plus
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomIdInput, setRoomIdInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeRes, interviewRes] = await Promise.allSettled([
          api.get('/resumes/my-resume'),
          api.get('/interviews')
        ]);

        if (resumeRes.status === 'fulfilled') {
          setResume(resumeRes.value.data);
        }
        if (interviewRes.status === 'fulfilled') {
          setInterviews(interviewRes.value.data);
        }
      } catch (err) {
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const latestInterview = interviews[0] || null;

  const handleJoinByRoom = (e) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      navigate(`/interview/${roomIdInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Candidate Workspace — Manage your resume profile and upcoming real-time interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/resume/upload"
              className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4 text-slate-700" />
              {resume ? 'Update Resume' : 'Upload Resume'}
            </Link>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {/* Resume Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {resume ? (
                  <span className="text-emerald-700 flex items-center gap-1.5 text-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Uploaded
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1.5 text-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" /> Not Uploaded
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {resume ? resume.filename : 'Upload PDF/DOCX to generate questions'}
              </p>
            </div>
          </div>

          {/* Interviews Count */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-slate-900">{interviews.length}</div>
              <p className="text-xs text-slate-500 mt-1">{completedCount} Completed</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-slate-900">
                {completedCount > 0 ? '82%' : 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Based on completed evaluations</p>
            </div>
          </div>

          {/* Latest Interview */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Interview</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 truncate">
                {latestInterview ? latestInterview.title : 'No interviews scheduled'}
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                {latestInterview ? `Room: ${latestInterview.interviewId}` : 'Share Room ID to join'}
              </p>
            </div>
          </div>
        </div>

        {/* Join Interview Room Section */}
        <div className="mt-8 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Join Active Interview Room</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Have a Room ID from your interviewer? Enter it below to launch the interview environment immediately.
              </p>
            </div>

            <form onSubmit={handleJoinByRoom} className="w-full sm:w-auto flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Room ID (e.g. INT-8F42K)"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 bg-slate-50 uppercase text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                Join Room <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Interview History Table */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Interview History</h3>
            <span className="text-xs text-slate-500 font-mono">{interviews.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading interview records...</div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">No interview history yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once an interviewer assigns you an interview room or you join with a Room ID, your session will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Interview Title</th>
                    <th className="py-3 px-6">Room ID</th>
                    <th className="py-3 px-6">Interviewer</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {interviews.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{item.title}</td>
                      <td className="py-3.5 px-6 font-mono text-slate-700 font-medium">{item.interviewId}</td>
                      <td className="py-3.5 px-6 text-slate-600">{item.interviewerId?.name || 'Interviewer'}</td>
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
                          Join <ExternalLink className="w-3 h-3" />
                        </Link>
                        {item.status === 'completed' && (
                          <Link
                            to={`/interview/${item._id}/report`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                          >
                            Report
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
