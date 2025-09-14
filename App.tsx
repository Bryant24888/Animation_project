import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationState } from './types';
import BrowserWindow from './components/BrowserWindow';
import ResultScene from './components/ResultScene';
import InputBar from './components/InputBar';

// Helper function to get an element's offset relative to a specific parent container.
const getOffsetRelativeToParent = (element: HTMLElement, parent: HTMLElement) => {
  let top = 0;
  let left = 0;
  let el: HTMLElement | null = element;
  while (el && el !== parent) {
    top += el.offsetTop;
    left += el.offsetLeft;
    el = el.offsetParent as HTMLElement | null;
  }
  return { top, left };
};

// Define the structure of messages from the backend
interface BackendMessage {
  action: 'start' | 'result';
  query?: string;
  status?: 'success' | 'fail';
  details?: string;
}

const App: React.FC = () => {
  const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.Idle);
  const [typedText, setTypedText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resultDetails, setResultDetails] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const timeoutIds = useRef<number[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const cleanup = useCallback(() => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setAnimationState(AnimationState.Idle);
    setTypedText('');
    setSearchQuery('');
    setResultDetails('');
    setIsThinking(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
    if (highlightRef.current) {
      highlightRef.current.style.opacity = '0';
    }
  }, [cleanup]);
  
  // Connect to WebSocket server on component mount
  useEffect(() => {
    // This effect should only run once on mount, and cleanup on unmount.
    // An empty dependency array [] ensures this behavior.
    ws.current = new WebSocket('ws://localhost:8765');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onerror = (error) => {
      // This might be logged on the first mount in Strict Mode, which is expected.
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: BackendMessage = JSON.parse(event.data);
        handleBackendMessage(message);
      } catch (error) {
        console.error('Failed to parse backend message:', error);
      }
    };
    
    // Cleanup function to close the socket when the component unmounts
    return () => {
      ws.current?.close();
    };
  }, []); // <-- Dependency array changed to empty []

  const handleBackendMessage = (message: BackendMessage) => {
    if (message.action === 'start' && message.query) {
      reset();
      setSearchQuery(message.query);
      setAnimationState(AnimationState.PoppingUp);
    } else if (message.action === 'result' && message.status) {
      cleanup();
      setIsThinking(false);
      if (message.status === 'success') {
        setResultDetails(message.details || '');
        setAnimationState(AnimationState.Success);
      } else {
        setAnimationState(AnimationState.Fail);
      }
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ query }));
    } else {
      console.error('WebSocket is not connected.');
      alert('无法连接到后端服务，请确保后端正在运行。');
    }
  };

  // Use ref for state inside async loops to get the latest value
  const animationStateRef = useRef(animationState);
  animationStateRef.current = animationState;

  const runTypingAnimation = useCallback(async (targetText: string) => {
    if (!targetText) return;
    for (let i = 0; i < targetText.length; i++) {
      if (animationStateRef.current !== AnimationState.Typing) return;
      setTypedText(targetText.substring(0, i + 1));
      await new Promise(res => timeoutIds.current.push(window.setTimeout(res, Math.random() * 80 + 50)));
    }
    await new Promise(res => timeoutIds.current.push(window.setTimeout(res, 500)));
    if (animationStateRef.current === AnimationState.Typing) {
      setAnimationState(AnimationState.Searching);
    }
  }, []);
  
  const smoothScroll = useCallback((targetY: number) => {
    if (!contentRef.current) return;
    const startY = contentRef.current.scrollTop;
    const distance = targetY - startY;
    let startTime: number | null = null;
    const duration = 800;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const easedProgress = ease(Math.min(progress / duration, 1));
      
      if (contentRef.current) {
        contentRef.current.scrollTop = startY + distance * easedProgress;
      }

      if (progress < duration && animationStateRef.current === AnimationState.Searching) {
        animationFrameId.current = requestAnimationFrame(step);
      }
    };
    animationFrameId.current = requestAnimationFrame(step);
  }, []);

  const runSearchingAnimation = useCallback(async () => {
    const elementsToHighlight = ['#sec-hero', '#sec-thumb', '#sec-l1', '#sec-l2', '#sec-l3', '#sec-sq1', '#sec-sq2', '#sec-gallery', '#sec-footer'];
    const contentEl = contentRef.current;
    const highlightEl = highlightRef.current;

    if (!contentEl || !highlightEl) return;

    for (const selector of elementsToHighlight) {
      if (animationStateRef.current !== AnimationState.Searching) return;

      const targetEl = contentEl.querySelector<HTMLElement>(selector);
      if (targetEl) {
        const { top, left } = getOffsetRelativeToParent(targetEl, contentEl);
        const targetScrollY = top - contentEl.clientHeight / 3;
        smoothScroll(targetScrollY);
        await new Promise(res => timeoutIds.current.push(window.setTimeout(res, 800)));
        
        Object.assign(highlightEl.style, {
          left: `${left - 8}px`,
          top: `${top - 8}px`,
          width: `${targetEl.offsetWidth + 16}px`,
          height: `${targetEl.offsetHeight + 16}px`,
          opacity: '1'
        });
        await new Promise(res => timeoutIds.current.push(window.setTimeout(res, 480)));
      }
    }

    if (animationStateRef.current === AnimationState.Searching) {
      setIsThinking(true);
      // Now we wait for the backend to send the result message
    }
  }, [smoothScroll]);

  // Main animation flow controller
  useEffect(() => {
    const handleStateChange = async () => {
      cleanup(); // Cleanup any previous timeouts before starting a new state
      if (animationState === AnimationState.PoppingUp) {
        timeoutIds.current.push(window.setTimeout(() => {
          if(animationStateRef.current === AnimationState.PoppingUp) setAnimationState(AnimationState.FadingInContent);
        }, 1100));
      } else if (animationState === AnimationState.FadingInContent) {
        timeoutIds.current.push(window.setTimeout(() => {
          if(animationStateRef.current === AnimationState.FadingInContent) setAnimationState(AnimationState.Typing);
        }, 400));
      } else if (animationState === AnimationState.Typing) {
        runTypingAnimation(searchQuery);
      } else if (animationState === AnimationState.Searching) {
        runSearchingAnimation();
      }
    };
    handleStateChange();

    return cleanup;
  }, [animationState, searchQuery, runTypingAnimation, runSearchingAnimation, cleanup]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 font-sans text-slate-200">
      <div className="w-full max-w-5xl mx-auto">
        <InputBar onSubmit={handleSearchSubmit} isConnected={isConnected} disabled={animationState !== AnimationState.Idle} />
        <div className="relative w-full h-[75vh] min-h-[680px] mt-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {animationState === AnimationState.Idle && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>
                <h2 className="text-xl font-medium">等待后端指令</h2>
                <p className="mt-1">请输入查询内容并发送，或等待后端自动触发。</p>
              </div>
            )}
            <BrowserWindow
                state={animationState}
                typedText={typedText}
                contentRef={contentRef}
                highlightRef={highlightRef}
                isThinking={isThinking}
            />
            {(animationState === AnimationState.Success || animationState === AnimationState.Fail) && (
                <ResultScene 
                  variant={animationState === AnimationState.Success ? 'success' : 'fail'}
                  details={resultDetails} 
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default App;