import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Video,
  Code2,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      navigate(`/interview/${roomIdInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-xs font-medium text-slate-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>AI-Powered Real-Time Technical Interview Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Practice Interviews. Build Confidence. Get Interview-Ready.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          IntervueLive analyzes candidate resumes, generates tailored technical interview questions based on actual projects and skills, and provides a real-time collaborative interview room.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to={user ? (user.role === 'interviewer' ? '/interviewer/dashboard' : '/dashboard') : '/register'}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-all flex items-center justify-center"
          >
            Explore Platform
          </a>
        </div>

        {/* Quick Room Join Bar */}
        <form onSubmit={handleJoinRoom} className="mt-8 max-w-sm mx-auto flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            placeholder="Enter Room ID (e.g. INT-8F42K)"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs text-slate-900 font-mono bg-transparent focus:outline-none placeholder-slate-400 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            Join <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Visual Mockup Card */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
              <span className="ml-2 font-semibold text-white">INT-8F42K — Senior Full Stack Developer Interview</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <Clock className="w-3 h-3" /> 34:12 Remaining
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-sans font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Connected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 text-left bg-slate-50 min-h-[380px]">
            {/* Left Question Preview */}
            <div className="md:col-span-4 p-5 border-r border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span>Question 2 of 6</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">React & Node.js</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Explain how state management and server-side authentication work in your React and Node.js projects.
                </h4>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Focus on JWT token transmission, middleware verification, and candidate project architecture (Traverge).
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">Difficulty: Medium</span>
                <span className="text-slate-400 font-mono">Category: Technical</span>
              </div>
            </div>

            {/* Middle Live Code Mockup */}
            <div className="md:col-span-5 p-4 bg-slate-950 font-mono text-xs text-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>solution.js</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">JavaScript</span>
              </div>
              <pre className="py-3 text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
{`const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = decoded;
    next();
  });
};`}
              </pre>
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Synchronized Code Buffer</span>
                <span className="px-3 py-1 rounded bg-slate-800 text-white font-sans text-xs">Submitted</span>
              </div>
            </div>

            {/* Right Presence & Chat */}
            <div className="md:col-span-3 p-4 bg-white border-l border-slate-200 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Participants</h5>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Interviewer</span>
                    <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Candidate</span>
                    <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Live Room Chat</div>
                <div className="p-2 bg-slate-100 rounded text-slate-700 text-[11px]">
                  <strong>Interviewer:</strong> Please explain the JWT verification middleware.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Realistic Software Interviews
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Clean monochrome design with real-time Socket.IO synchronization, Monaco code editor, and AI resume analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Resume Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extracts actual skills, frameworks, and projects from PDF and DOCX files. Generates candidate-tailored technical questions.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Interview Room</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Socket.IO powered communication supporting live question switching, presence tracking, synchronized timer, and instant chat.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Monaco Live Code Editor</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Multi-language coding environment for JavaScript, Python, and Java with synchronized code submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How IntervueLive Works</h2>
            <p className="mt-3 text-base text-slate-600">A seamless 4-step workflow from resume upload to final AI feedback.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200 relative">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">STEP 01</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Upload Resume</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Candidate uploads PDF/DOCX resume to extract technical skills and project details.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 relative">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">STEP 02</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI Question Setup</h4>
              <p className="text-xs text-slate-600 leading-relaxed">AI generates tailored technical, project, programming, and behavioral questions.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 relative">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">STEP 03</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Join Real-Time Room</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Interviewer and candidate connect using a shared Room ID with chat and timer.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 relative">
              <div className="text-xs font-mono font-bold text-slate-400 mb-2">STEP 04</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI Feedback Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Get performance breakdown, strengths, areas for improvement, and study topics.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
