import React, { useState, useEffect } from 'react';

interface ResultSceneProps {
  variant: 'success' | 'fail';
  details?: string;
}

const ResultScene: React.FC<ResultSceneProps> = ({ variant, details }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsAnimating(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const config = {
    success: {
      icon: '✓',
      title: '操作成功',
      message: 'AI 代理已成功完成您的任务。',
      iconClass: 'text-green-400',
    },
    fail: {
      icon: '✕',
      title: '操作失败',
      message: '无法完成任务，或在处理时发生错误。',
      iconClass: 'text-red-400',
    },
  }[variant];

  return (
    <div className="absolute inset-0 flex flex-col items-center text-center text-slate-300 p-4 overflow-y-auto">
      {/* This wrapper ensures content is vertically centered, but allows scrolling when content overflows. */}
      <div className="my-auto">
        <div
          className={`text-7xl font-light border-4 rounded-full w-28 h-28 flex items-center justify-center mx-auto transition-all duration-500 ease-out ${config.iconClass} ${isAnimating ? 'scale-100 opacity-100 border-opacity-100' : 'scale-50 opacity-0 border-opacity-0'}`}
          style={{ borderColor: 'currentColor' }}
        >
          {config.icon}
        </div>
        <h2 className={`mt-6 text-3xl font-bold transition-all duration-500 delay-100 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {config.title}
        </h2>
        <p className={`mt-2 text-slate-400 transition-all duration-500 delay-200 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {config.message}
        </p>
        {details && (
          <div className={`mt-6 w-full max-w-md bg-slate-800/50 p-4 rounded-lg border border-slate-700 transition-all duration-500 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">返回信息：</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap text-left">{details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultScene;
