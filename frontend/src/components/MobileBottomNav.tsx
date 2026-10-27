import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookMarked, PlayCircle, CheckSquare, Sparkles } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 pb-safe shadow-2xl">
      <div className="grid grid-cols-5 h-16">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        <NavLink
          to="/vocabulary"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Words</span>
        </NavLink>

        {/* Highlighted Practice Button */}
        <NavLink
          to="/practice"
          className="flex flex-col items-center justify-center -mt-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white group-active:scale-95 transition-transform ring-4 ring-slate-900">
            <PlayCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-blue-400 font-bold mt-0.5">Practice</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Tasks</span>
        </NavLink>

        <NavLink
          to="/ai-tutor"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">AI Tutor</span>
        </NavLink>
      </div>
    </nav>
  );
};
