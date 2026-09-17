import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  Terminal,
  Clock,
  Send,
  Code2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Play,
  Pause,
  StopCircle,
  User,
  MessageSquare,
  Sparkles,
  FileText
} from 'lucide-react';

export const InterviewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real-time state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [presence, setPresence] = useState([]);
  const [candidateAnswerInput, setCandidateAnswerInput] = useState('');

  // Code editor state
  const [code, setCode] = useState('// Write your code here...\nfunction solution() {\n  return true;\n}');
  const [language, setLanguage] = useState('javascript');
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch Interview Data
  useEffect(() => {
    const fetchInterviewRoom = async () => {
      try {
        const res = await api.get(`/interviews/room/${roomId}`);
        setInterview(res.data);
        setCurrentQIndex(res.data.currentQuestionIndex || 0);

        if (res.data.duration) {
          setRemainingSeconds(res.data.duration * 60);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Interview room not found');
      } font: {
        setLoading(false);
      }
    };

    fetchInterviewRoom();
  }, [roomId]);

  // Handle Socket.IO connection & event listeners
  useEffect(() => {
    if (!socket || !interview || !user) return;

    // Join room
    socket.emit('joinRoom', {
      roomId: interview.interviewId,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role
      }
    });

    // Event listeners
    const handlePresenceUpdate = (users) => {
      setPresence(users);
    };

    const handleChatHistory = (history) => {
      setMessages(history);
    };

    const handleReceiveMessage = (msgDoc) => {
      setMessages((prev) => [...prev, msgDoc]);
    };

    const handleReceiveQuestion = ({ questionIndex }) => {
      setCurrentQIndex(questionIndex);
    };

    const handleCodeUpdate = ({ code: remoteCode, language: remoteLang }) => {
      if (user.role === 'interviewer') {
        setCode(remoteCode);
        if (remoteLang) setLanguage(remoteLang);
      }
    };

    const handleCodeSubmitted = (data) => {
      setCodeSubmitted(true);
      setTimeout(() => setCodeSubmitted(false), 3000);
    };

    const handleTimerTick = ({ remainingSeconds: sec, isRunning }) => {
      setRemainingSeconds(sec);
      setIsTimerRunning(isRunning);
    };

    const handleInterviewEnded = () => {
      navigate(`/interview/${interview._id}/report`);
    };

    socket.on('presenceUpdate', handlePresenceUpdate);
    socket.on('chatHistory', handleChatHistory);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('receiveQuestion', handleReceiveQuestion);
    socket.on('codeUpdate', handleCodeUpdate);
    socket.on('codeSubmitted', handleCodeSubmitted);
    socket.on('timerTick', handleTimerTick);
    socket.on('interviewEnded', handleInterviewEnded);

    return () => {
      socket.off('presenceUpdate', handlePresenceUpdate);
      socket.off('chatHistory', handleChatHistory);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('receiveQuestion', handleReceiveQuestion);
      socket.off('codeUpdate', handleCodeUpdate);
      socket.off('codeSubmitted', handleCodeSubmitted);
      socket.off('timerTick', handleTimerTick);
      socket.off('interviewEnded', handleInterviewEnded);
    };
  }, [socket, interview, user, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set candidate answer when question changes
  useEffect(() => {
    if (interview?.questions && interview.questions[currentQIndex]) {
      const q = interview.questions[currentQIndex];
      setCandidateAnswerInput(q.candidateAnswer || '');
      if (q.submittedCode) {
        setCode(q.submittedCode);
      }
    }
  }, [currentQIndex, interview]);

  // Chat Submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && socket && interview) {
      socket.emit('sendMessage', {
        roomId: interview.interviewId,
        message: chatInput
      });
      setChatInput('');
    }
  };

  // Question Navigation (Interviewer or Candidate sync)
  const handleQuestionChange = (newIndex) => {
    if (!interview || newIndex < 0 || newIndex >= interview.questions.length) return;

    setCurrentQIndex(newIndex);
    if (socket) {
      socket.emit('sendQuestion', {
        roomId: interview.interviewId,
        questionIndex: newIndex,
        questionId: interview.questions[newIndex]?._id
      });
    }
  };

  // Save candidate text answer
  const handleSaveAnswer = async () => {
    if (!interview || !interview.questions[currentQIndex]) return;
    const currentQ = interview.questions[currentQIndex];

    try {
      await api.put(`/interviews/question/${currentQ._id}/response`, {
        candidateAnswer: candidateAnswerInput,
        submittedCode: code,
        codeLanguage: language
      });
    } catch (err) {
      console.error('Save answer error:', err);
    }
  };

  // Monaco Code Change Sync
  const handleCodeChange = (newCode) => {
    setCode(newCode || '');
    if (socket && interview && user.role === 'candidate') {
      socket.emit('codeUpdate', {
        roomId: interview.interviewId,
        code: newCode,
        language
      });
    }
  };

  // Code Submission
  const handleSubmitCode = async () => {
    if (!interview || !interview.questions[currentQIndex]) return;
    const currentQ = interview.questions[currentQIndex];
    setSubmittingCode(true);

    try {
      await api.put(`/interviews/question/${currentQ._id}/response`, {
        candidateAnswer: candidateAnswerInput,
        submittedCode: code,
        codeLanguage: language
      });

      if (socket) {
        socket.emit('codeSubmit', {
          roomId: interview.interviewId,
          questionId: currentQ._id,
          code,
          language,
          candidateAnswer: candidateAnswerInput
        });
      }

      setCodeSubmitted(true);
      setTimeout(() => setCodeSubmitted(false), 3000);
    } catch (err) {
      console.error('Submit code error:', err);
    } finally {
      setSubmittingCode(false);
    }
  };

  // Timer Controls (Interviewer)
  const toggleTimer = () => {
    if (!socket || !interview) return;
    if (isTimerRunning) {
      socket.emit('pauseTimer', { roomId: interview.interviewId });
    } else {
      socket.emit('startTimer', { roomId: interview.interviewId, durationMinutes: interview.duration || 45 });
    }
  };

  // End Interview
  const handleEndInterview = async () => {
    if (!interview) return;
    try {
      await api.put(`/interviews/${interview._id}/status`, { status: 'completed' });
      if (socket) {
        socket.emit('endInterview', { roomId: interview.interviewId });
      }
      navigate(`/interview/${interview._id}/report`);
    } catch (err) {
      console.error('End interview error:', err);
    }
  };

  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(interview.interviewId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  // Format seconds MM:SS
  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Connecting to IntervueLive Room...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Room Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'Unable to access the specified interview room.'}</p>
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

  const currentQ = interview.questions[currentQIndex] || {
    question: 'No questions assigned yet.',
    category: 'General',
    difficulty: 'Medium',
    technology: 'General'
  };

  const isInterviewer = user?.role === 'interviewer';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Synchronized Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-mono text-xs font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{interview.title}</span>
              <button
                onClick={copyRoomIdToClipboard}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 flex items-center gap-1 transition-colors"
                title="Copy Room ID"
              >
                <span>{interview.interviewId}</span>
                {copiedRoomId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Timer & Status Center */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-sm">{formatTimer(remainingSeconds)}</span>
            {isInterviewer && (
              <button
                onClick={toggleTimer}
                className="ml-1 p-1 hover:text-white text-slate-400 transition-colors"
                title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
            <span className="text-slate-400">{connected ? 'Live Connected' : 'Reconnecting...'}</span>
          </div>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          {isInterviewer && (
            <button
              onClick={handleEndInterview}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              <StopCircle className="w-3.5 h-3.5 text-slate-400" />
              End Interview
            </button>
          )}

          <Link
            to={isInterviewer ? '/interviewer/dashboard' : '/dashboard'}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Exit
          </Link>
        </div>
      </header>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
        
        {/* LEFT COLUMN: Question & Answer Panel (4 cols) */}
        <div className="lg:col-span-4 p-4 border-r border-slate-800/80 bg-slate-900/60 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Question Progress Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>Question {currentQIndex + 1} of {interview.questions?.length || 1}</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">
                  {currentQ.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                  {currentQ.difficulty}
                </span>
              </div>
            </div>

            {/* Question Content */}
            <div className="mt-4">
              <div className="text-[11px] font-mono text-slate-400 mb-1">Target Technology: {currentQ.technology}</div>
              <h3 className="text-sm font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Input Area for Candidate */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Candidate Verbal / Structural Answer Notes:
              </label>
              <textarea
                rows={4}
                value={candidateAnswerInput}
                onChange={(e) => setCandidateAnswerInput(e.target.value)}
                onBlur={handleSaveAnswer}
                placeholder="Type structured technical explanation or architecture response here..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 font-sans"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-500 font-mono">Auto-saves on blur</span>
                <button
                  onClick={handleSaveAnswer}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Save Answer Note
                </button>
              </div>
            </div>
          </div>

          {/* Question Switch Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handleQuestionChange(currentQIndex - 1)}
              disabled={currentQIndex === 0}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-mono text-slate-400">
              {currentQIndex + 1} / {interview.questions?.length || 1}
            </span>

            <button
              onClick={() => handleQuestionChange(currentQIndex + 1)}
              disabled={currentQIndex >= (interview.questions?.length || 1) - 1}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Live Monaco Code Editor (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800/80 flex flex-col bg-slate-950">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>Live Code Solution</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>

              <button
                onClick={handleSubmitCode}
                disabled={submittingCode}
                className="px-3 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
              >
                {codeSubmitted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Submitted
                  </>
                ) : (
                  'Submit Code'
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[350px]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code, Consolas, monospace',
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Room Presence & Real-Time Chat (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/40 p-4 flex flex-col justify-between overflow-hidden">
          {/* Presence Box */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Participants Online ({presence.length})
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{interview.interviewerId?.name}</span>
                  <span className="text-[10px] text-slate-500 block">Interviewer</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online"></span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{interview.candidateId?.name}</span>
                  <span className="text-[10px] text-slate-500 block">Candidate</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online"></span>
              </div>
            </div>
          </div>

          {/* Real-Time Chat Area */}
          <div className="flex-1 flex flex-col border-t border-slate-800 pt-3 min-h-[220px]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Real-Time Chat
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4">No chat messages yet.</div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className={`p-2 rounded max-w-[90%] text-[11px] ${
                      m.senderRole === user?.role
                        ? 'bg-slate-800 text-slate-100 ml-auto border border-slate-700'
                        : 'bg-slate-950 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-400 flex items-center justify-between mb-0.5">
                      <span>{m.senderName} ({m.senderRole})</span>
                    </div>
                    <p className="leading-normal">{m.message}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Type instant message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600"
              />
              <button
                type="submit"
                className="p-1.5 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
