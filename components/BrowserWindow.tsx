import React from 'react';
import { AnimationState } from '../types';

interface BrowserWindowProps {
  state: AnimationState;
  typedText: string;
  contentRef: React.RefObject<HTMLDivElement>;
  highlightRef: React.RefObject<HTMLDivElement>;
  isThinking: boolean;
}

const TrafficLights: React.FC = () => (
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
  </div>
);

const BlinkingCursor: React.FC = () => (
  <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5"></span>
);

const SkeletonCard: React.FC<React.PropsWithChildren<{ id?: string; className?: string }>> = ({ id, className, children }) => (
    <div className="p-7">
        <div id={id} className={`bg-slate-800 border border-slate-700 rounded-2xl p-5 ${className}`}>
            {children}
        </div>
    </div>
);

const SkeletonElement: React.FC<{ id?: string; className?: string }> = ({ id, className }) => (
    <div id={id} className={`animate-shimmer rounded-lg bg-slate-700 ${className}`}></div>
);

const BrowserWindow: React.FC<BrowserWindowProps> = ({ state, typedText, contentRef, highlightRef, isThinking }) => {
  const isWindowVisible = state >= AnimationState.PoppingUp;
  const isContentVisible = state >= AnimationState.FadingInContent;
  const isFadingOut = state === AnimationState.Success || state === AnimationState.Fail;

  return (
    <div className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-500 ${state === AnimationState.Idle ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isWindowVisible ? 'opacity-100 scale-100 translate-x-0 translate-y-0' : 'opacity-0 scale-25 -translate-x-1/2 translate-y-1/2'} ${isFadingOut ? 'opacity-40 blur-sm scale-95' : ''}`}>
          <div className="flex flex-col w-full h-full bg-slate-950 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Unified Top Bar */}
              <div className="flex items-center gap-2 p-3 border-b border-slate-700/80">
                  <TrafficLights />
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-slate-400 text-sm min-h-[28px]">
                      <span>{typedText}</span>
                      {state === AnimationState.Typing && <BlinkingCursor />}
                  </div>
              </div>

              {/* Scrollable Content */}
              <div ref={contentRef} className={`relative flex-1 overflow-y-auto transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                 <SkeletonCard>
                    <SkeletonElement id="sec-hero" className="h-20 mb-4" />
                    <SkeletonElement className="h-5 mb-2.5" />
                    <SkeletonElement className="h-5 w-3/4" />
                 </SkeletonCard>
                 <SkeletonCard>
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
                        <SkeletonElement id="sec-thumb" className="h-40" />
                        <div>
                            <SkeletonElement id="sec-l1" className="h-5 mb-2.5" />
                            <SkeletonElement id="sec-l2" className="h-5 mb-2.5" />
                            <SkeletonElement id="sec-l3" className="h-5 w-3/4 mb-2.5" />
                            <SkeletonElement id="sec-l4" className="h-5" />
                        </div>
                    </div>
                 </SkeletonCard>
                 <SkeletonCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div id="sec-sq1">
                            <SkeletonElement className="h-40 md:h-52 mb-4" />
                            <SkeletonElement className="h-5 w-full mb-2.5" />
                            <SkeletonElement className="h-5 w-3/4" />
                        </div>
                        <div id="sec-sq2">
                            <SkeletonElement className="h-40 md:h-52 mb-4" />
                            <SkeletonElement className="h-5 w-full mb-2.5" />
                            <SkeletonElement className="h-5 w-3/4" />
                        </div>
                    </div>
                 </SkeletonCard>
                 <SkeletonCard>
                    <div id="sec-gallery">
                      <SkeletonElement className="h-5 w-1/3 mb-4" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <SkeletonElement className="h-28" />
                          <SkeletonElement className="h-28" />
                          <SkeletonElement className="h-28" />
                          <SkeletonElement className="h-28" />
                      </div>
                    </div>
                 </SkeletonCard>
                  <SkeletonCard>
                      <SkeletonElement id="sec-footer" className="h-5 mb-2.5" />
                      <SkeletonElement className="h-5 mb-2.5" />
                      <SkeletonElement className="h-5" />
                  </SkeletonCard>
                 <div className="h-32 flex items-center justify-center">
                    <div className={`flex items-center gap-3 text-slate-400 transition-all duration-500 ${isThinking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing and preparing results...</span>
                    </div>
                 </div>
                 <div ref={highlightRef} className="absolute border-2 border-blue-400 rounded-xl shadow-lg shadow-blue-500/20 opacity-0 transition-all duration-300 pointer-events-none"></div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default BrowserWindow;