
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-slate-700 rounded-lg w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded-full w-16"></div>
          </div>

          {/* Image placeholder */}
          <div className="h-32 bg-slate-700 rounded-xl mb-4"></div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>

          {/* Tech stack */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-slate-700 rounded w-16"></div>
            <div className="h-6 bg-slate-700 rounded w-20"></div>
            <div className="h-6 bg-slate-700 rounded w-14"></div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-slate-700 rounded-full w-20"></div>
            <div className="h-4 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
