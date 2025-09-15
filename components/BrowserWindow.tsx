import React, { useState, useEffect } from 'react';
import { AnimationState } from '../types';

interface BrowserWindowProps {
  animationState: AnimationState;
  query: string;
  agentLogs: string[];
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({ animationState, query, agentLogs }) => {
  const [showContent, setShowContent] = useState(false);
  const [typedUrl, setTypedUrl] = useState('');

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  useEffect(() => {
    if (animationState >= AnimationState.PoppingUp) {
      const timer = setTimeout(() => setShowContent(true), 300); // After window pops up
      return () => clearTimeout(timer);
    }
  }, [animationState]);
  
  useEffect(() => {
    if (animationState === AnimationState.Typing) {
      let i = 0;
      setTypedUrl('');
      const typingInterval = setInterval(() => {
        if (i < url.length) {
          setTypedUrl(prev => prev + url.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);
      return () => clearInterval(typingInterval);
    } else if (animationState > AnimationState.Typing) {
      setTypedUrl(url);
    }
  }, [animationState, url]);

  return (
    <div
      className={`absolute inset-0 bg-slate-800 rounded-lg flex flex-col transition-all duration-500 ease-out transform-gpu ${
        animationState >= AnimationState.PoppingUp
          ? 'scale-100 opacity-100'
          : 'scale-90 opacity-0'
      }`}
    >
      {/* Window Header */}
      <div className="flex-shrink-0 bg-slate-700/50 rounded-t-lg px-3 py-2 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
      </div>

      {/* URL Bar */}
      <div className="flex-shrink-0 bg-slate-900/50 p-2 flex items-center gap-2 border-b border-slate-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <div className="flex-grow bg-slate-800 rounded px-3 py-1 text-sm text-slate-300 font-mono break-all">
           {typedUrl}
           {animationState === AnimationState.Typing && <span className="animate-ping">|</span>}
        </div>
      </div>
      
      {/* Content */}
      <div
        className={`flex-grow p-4 overflow-y-auto transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">
          搜索: {query}
        </h2>
        <div className="bg-slate-900/70 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">AI 代理日志：</h3>
          <div className="space-y-2 text-sm font-mono">
            {agentLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-slate-300 animate-fade-in">
                <svg
                  className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                <p>{log}</p>
              </div>
            ))}
             {(animationState === AnimationState.Searching) && (
                <div className="flex items-center gap-2 text-slate-400">
                   <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>执行中...</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserWindow;
