
import React, { useState, useEffect, useRef } from 'react';
import { AnimationState } from './types';
import BrowserWindow from './components/BrowserWindow';
import InputBar from './components/InputBar';
import ResultScene from './components/ResultScene';

function App() {
  const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.Idle);
  const [query, setQuery] = useState('');
  const [taskResult, setTaskResult] = useState<{ success: boolean; details?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      // Connect to the Python WebSocket server
      ws.current = new WebSocket('ws://localhost:8765');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);

          // The backend confirms that the task has started.
          // Now we can run the visual animations.
          if (message.action === 'start') {
            setAgentLogs(prev => [`任务已接收: ${message.query}`]);
            setTimeout(() => {
              setAnimationState(AnimationState.FadingInContent);
            }, 500);
            setTimeout(() => {
              setAnimationState(AnimationState.Typing);
            }, 1000);
            setTimeout(() => {
              setAnimationState(AnimationState.Searching);
              setAgentLogs(prev => [...prev, '代理正在导航和分析页面...']);
            }, 2500);
          } 
          // The backend has finished its work and sent back the result.
          else if (message.action === 'result') {
            if (message.status === 'success') {
              setTaskResult({ success: true, details: message.details });
              setAnimationState(AnimationState.Success);
            } else {
              setTaskResult({ success: false, details: message.details });
              setAnimationState(AnimationState.Fail);
            }
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          setTaskResult({ success: false, details: '从后端接收到无效的消息格式。' });
          setAnimationState(AnimationState.Fail);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        setIsConnected(false);
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        // The onclose event will be triggered next, which handles reconnection.
        ws.current?.close();
      };
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Disable reconnection logic on unmount
        ws.current.close();
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  const handleSubmit = (submittedQuery: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setQuery(submittedQuery);
      setTaskResult(null);
      setAgentLogs([]);
      // Start the popping up animation immediately
      setAnimationState(AnimationState.PoppingUp);
      
      // Send the task to the backend
      ws.current.send(JSON.stringify({ query: submittedQuery }));
    } else {
      console.error('WebSocket is not connected.');
      setTaskResult({ success: false, details: '无法连接到后端服务。请检查后端是否正在运行并刷新页面。' });
      setAnimationState(AnimationState.Fail);
    }
  };
  
  const isTaskRunning = animationState !== AnimationState.Idle && animationState !== AnimationState.Success && animationState !== AnimationState.Fail;

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">AI 代理搜索</h1>
          <p className="text-slate-400 text-center mb-6">输入一个任务，AI 代理将在模拟浏览器中为您完成。</p>

          <InputBar
            onSubmit={handleSubmit}
            isConnected={isConnected}
            disabled={isTaskRunning}
          />
          
          <div className="aspect-[16/10] bg-slate-900/50 rounded-lg border border-slate-700 mt-4 overflow-hidden relative">
            {animationState === AnimationState.Idle && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-500">等待任务...</p>
              </div>
            )}
            {(animationState === AnimationState.PoppingUp ||
              animationState === AnimationState.FadingInContent ||
              animationState === AnimationState.Typing ||
              animationState === AnimationState.Searching) && (
              <BrowserWindow
                animationState={animationState}
                query={query}
                agentLogs={agentLogs}
              />
            )}
            {animationState === AnimationState.Success && taskResult && (
              <ResultScene variant="success" details={taskResult.details} />
            )}
            {animationState === AnimationState.Fail && taskResult && (
              <ResultScene variant="fail" details={taskResult.details} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
