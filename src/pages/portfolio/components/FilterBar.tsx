
import React from 'react';
import { motion } from 'framer-motion';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalProjects: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalProjects,
}) => {
  const categories = ['All', 'Tech', 'Design', 'Marketing', 'AI/ML', 'Mobile', 'Web'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'xp', label: 'Highest XP' },
    { value: 'alphabetical', label: 'A-Z' },
  ];

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right side - Sort and Count */}
        <div className="flex items-center gap-4">
          {/* Project Count */}
          <div className="text-slate-400 text-sm whitespace-nowrap">
            {totalProjects} project{totalProjects !== 1 ? 's' : ''}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
