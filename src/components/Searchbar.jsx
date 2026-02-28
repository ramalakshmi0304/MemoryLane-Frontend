import React from "react";
import { Search, Trophy, ChevronDown, Filter } from "lucide-react";

const SearchBar = ({ 
  search, 
  setSearch, 
  tagFilter, 
  setTagFilter, 
  tags, 
  isMilestone, 
  setIsMilestone 
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full items-center">
      {/* TEXT SEARCH - Increased height and refined borders */}
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search title, description or tags..."
          className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base font-medium dark:text-white placeholder:text-slate-400 placeholder:font-normal shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-3 w-full lg:w-auto">
        {/* MILESTONE TOGGLE BUTTON - Matches Dashboard Stat Card Style */}
        <button
          type="button"
          onClick={() => setIsMilestone(!isMilestone)}
          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${
            isMilestone
              ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none"
              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-amber-200 dark:hover:border-amber-500/50"
          }`}
        >
          <Trophy size={18} className={isMilestone ? "fill-white" : "text-amber-500"} />
          <span>Milestones</span>
        </button>

        {/* TAG FILTER - Custom styled select container */}
        <div className="relative flex-1 lg:flex-none min-w-[180px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-4 text-sm font-black uppercase tracking-widest outline-none cursor-pointer focus:border-indigo-500/50 transition-all dark:text-white shadow-sm"
          >
            <option value="all">Categories</option>
            {Array.isArray(tags) && tags.map((tag, idx) => {
              const tagName = typeof tag === 'object' && tag !== null ? tag.name : tag;
              return (
                <option key={tag.id || idx} value={tagName}>
                  {tagName}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;