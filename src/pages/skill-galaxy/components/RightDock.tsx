import { motion } from 'framer-motion';
import { LayoutType, FilterState } from '../types';

interface RightDockProps {
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  nodeCount: number;
}

export const RightDock = ({
  layout,
  onLayoutChange,
  filters,
  onFiltersChange,
  nodeCount
}: RightDockProps) => {
  const layouts: { id: LayoutType; name: string; icon: string }[] = [
    { id: 'force-directed', name: 'Force', icon: 'ri-bubble-chart-line' },
    { id: 'cluster', name: 'Cluster', icon: 'ri-group-line' },
    { id: 'layered', name: 'Layers', icon: 'ri-stack-line' }
  ];

  const domains = ['Technical', 'Soft Skills', 'Additional Skills', 'Achievements', 'Learning'];
  const recencyOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' }
  ];

  return (
    <motion.div
      className="absolute top-20 right-4 z-30 bg-black/20 backdrop-blur-md border border-white/10 
               rounded-xl p-4 w-64 space-y-6"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      {/* Layout Selection */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <i className="ri-layout-grid-line mr-2" />
          Layout
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {layouts.map((layoutOption) => (
            <motion.button
              key={layoutOption.id}
              onClick={() => onLayoutChange(layoutOption.id)}
              className={`p-3 rounded-lg border transition-all duration-160 ${
                layout === layoutOption.id
                  ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={`${layoutOption.icon} text-lg mb-1 block`} />
              <span className="text-xs">{layoutOption.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Domain Filters */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <i className="ri-filter-line mr-2" />
          Domains
        </h3>
        <div className="space-y-2">
          {domains.map((domain) => (
            <motion.label
              key={domain}
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ x: 2 }}
            >
              <input
                type="checkbox"
                checked={filters.domains.includes(domain)}
                onChange={(e) => {
                  const newDomains = e.target.checked
                    ? [...filters.domains, domain]
                    : filters.domains.filter(d => d !== domain);
                  onFiltersChange({ ...filters, domains: newDomains });
                }}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 
                         focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-white/80 text-sm">{domain}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Score Range */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <i className="ri-bar-chart-line mr-2" />
          Score Range
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.scoreRange[0]}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                onFiltersChange({
                  ...filters,
                  scoreRange: [newMin, Math.max(newMin, filters.scoreRange[1])]
                });
              }}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white/80 text-sm w-8">{filters.scoreRange[0]}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.scoreRange[1]}
              onChange={(e) => {
                const newMax = parseInt(e.target.value);
                onFiltersChange({
                  ...filters,
                  scoreRange: [Math.min(filters.scoreRange[0], newMax), newMax]
                });
              }}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white/80 text-sm w-8">{filters.scoreRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Recency Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <i className="ri-time-line mr-2" />
          Recency
        </h3>
        <select
          value={filters.recency}
          onChange={(e) => onFiltersChange({ ...filters, recency: e.target.value })}
          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white 
                   focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        >
          {recencyOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Visible Nodes</span>
          <motion.span
            className="text-white font-semibold"
            key={nodeCount}
            initial={{ scale: 1.2, color: '#60a5fa' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            {nodeCount}
          </motion.span>
        </div>
      </div>

      {/* Legend */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <i className="ri-information-line mr-2" />
          Legend
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-white/80">Technical Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white/80">Soft Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-white/80">Additional Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/80">Achievements</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-white/80">Learning</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};