import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ResumeUploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingResume, setLoadingResume] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get('/resumes/my-resume');
        setResume(res.data);
      } catch (err) {
        // No resume yet
      } finally {
        setLoadingResume(false);
      }
    };
    fetchResume();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setError('Only PDF (.pdf) and Word (.docx) files are supported.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResume(res.data.resume);
      setSuccessMsg('Resume parsed and technical profile extracted successfully!');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing resume file.');
    } finally {
      setUploading(false);
    }
  };

  const extracted = resume?.extractedInfo || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Profile & Analysis</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your technical resume. IntervueLive extracts your actual skills, projects, and technologies to generate customized interview questions.
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition-all text-center">
              <Upload className="w-8 h-8 text-slate-400 mb-3" />
              <span className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'Click to select or drag PDF / DOCX resume'}
              </span>
              <span className="text-xs text-slate-500 mt-1">Supports PDF and Word documents up to 10MB</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {resume ? `Active File: ${resume.filename}` : 'No resume uploaded yet'}
              </span>
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Extracting Technical Profile...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Analyze & Parse Resume
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Extracted Profile Display */}
        {extracted && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-900" />
                Extracted Candidate Profile
              </h2>
              <span className="text-xs font-mono text-slate-500">LLM Structured Parser</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Skills Card */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Code2 className="w-4 h-4 text-slate-700" />
                  Skills & Frameworks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extracted.skills && extracted.skills.length > 0 ? (
                    extracted.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None extracted</span>
                  )}
                </div>
              </div>

              {/* Technologies Card */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-slate-700" />
                  Technologies & Stack
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extracted.technologies && extracted.technologies.length > 0 ? (
                    extracted.technologies.map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-mono">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None extracted</span>
                  )}
                </div>
              </div>

              {/* Projects Card */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <FolderGit2 className="w-4 h-4 text-slate-700" />
                  Key Projects
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {extracted.projects && extracted.projects.length > 0 ? (
                    extracted.projects.map((proj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 shrink-0"></span>
                        <span className="font-medium text-slate-900">{proj}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No specific projects detected</li>
                  )}
                </ul>
              </div>

              {/* Internships & Experience Card */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-slate-700" />
                  Internships & Experience
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {extracted.internships && extracted.internships.length > 0 ? (
                    extracted.internships.map((intern, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 shrink-0"></span>
                        <span className="font-medium text-slate-900">{intern}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No internship records found</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Next Step Banner */}
            <div className="p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold">Resume Profile Ready for Interviews</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Interviewers can now create custom rooms and generate questions based on your parsed technical background.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0 flex items-center gap-1"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
