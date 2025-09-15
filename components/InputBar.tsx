
import React, { useState } from 'react';

interface InputBarProps {
  onSubmit: (query: string) => void;
  isConnected: boolean;
  disabled: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSubmit, isConnected, disabled }) => {
  const [query, setQuery] = useState<string>('scsfjt.com 集团新闻');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
    }
  };

  return (
    <div className="flex items-center gap-4 mb-2">
      <form onSubmit={handleSubmit} className="flex-grow flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入搜索内容..."
          disabled={disabled}
          className="flex-grow px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all"
          aria-label="搜索内容"
        />
        <button
          type="submit"
          disabled={disabled || !isConnected}
          className="px-5 py-2 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
          aria-label="发送"
        >
          发送
        </button>
      </form>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span>{isConnected ? '后端已连接' : '后端未连接'}</span>
      </div>
    </div>
  );
};

export default InputBar;
