import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center font-mono">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-slate-700">IntervueLive</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#docs" className="hover:text-slate-900 transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  );
};
