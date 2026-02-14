
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { TopBar } from './components/TopBar';
import { RightDock } from './components/RightDock';
import { BottomCrumbs } from './components/BottomCrumbs';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { SkillNode, LayoutType, FilterState } from './types';

export const SkillGalaxyPage = () => {
  const { user } = useSession();
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [layout, setLayout] = useState<LayoutType>('force-directed');
  const [performanceMode, setPerformanceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    domains: [],
    levels: [],
    scoreRange: [0, 100],
    recency: 'all'
  });
  const [totalXP, setTotalXP] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState(['Skill Galaxy']);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Generate mock data for demonstration
  const generateMockData = (): SkillNode[] => {
    const mockSkills = [
      { name: 'JavaScript Fundamentals', category: 'Technical', score: 85, xp: 150 },
      { name: 'React Development', category: 'Technical', score: 78, xp: 200 },
      { name: 'Node.js Backend', category: 'Technical', score: 72, xp: 120 },
      { name: 'Database Design', category: 'Technical', score: 68, xp: 100 },
      { name: 'Communication Skills', category: 'Soft Skills', score: 92, xp: 180 },
      { name: 'Leadership', category: 'Soft Skills', score: 75, xp: 140 },
      { name: 'Problem Solving', category: 'Soft Skills', score: 88, xp: 160 },
      { name: 'Finance Basics', category: 'Additional Skills', score: 65, xp: 90 },
      { name: 'Marketing Strategy', category: 'Additional Skills', score: 70, xp: 110 },
      { name: 'Sales Techniques', category: 'Additional Skills', score: 82, xp: 130 },
      { name: 'First Interview', category: 'Achievements', score: 100, xp: 50 },
      { name: 'Streak Master', category: 'Achievements', score: 100, xp: 75 },
      { name: 'Continuous Learning', category: 'Learning', score: 95, xp: 200 },
      { name: 'Skill Explorer', category: 'Learning', score: 80, xp: 150 }
    ];

    return mockSkills.map((skill, index) => ({
      id: `mock-${index}`,
      name: skill.name,
      category: skill.category as any,
      score: skill.score,
      xp: skill.xp,
      improvement: Math.random() * 20 - 5, // -5% to +15%
      streakDays: Math.floor(Math.random() * 30),
      rubric: {
        clarity: 70 + Math.random() * 30,
        depth: 60 + Math.random() * 40,
        relevance: 75 + Math.random() * 25,
        structure: 65 + Math.random() * 35,
        communication: 80 + Math.random() * 20,
        accuracy: skill.score + Math.random() * 10 - 5
      },
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      sessions: [
        {
          id: `session-${index}`,
          overall_score: skill.score,
          created_at: new Date().toISOString(),
          rubric: {
            clarity: 70 + Math.random() * 30,
            depth: 60 + Math.random() * 40,
            structure: 65 + Math.random() * 35,
            communication: 80 + Math.random() * 20,
            accuracy: skill.score
          }
        }
      ],
      position: { x: 0, y: 0, z: 0 }
    }));
  };

  // Fetch data from Supabase
  useEffect(() => {
    if (!user) {
      // Show mock data for non-authenticated users
      const mockNodes = generateMockData();
      setNodes(mockNodes);
      setTotalXP(mockNodes.reduce((sum, node) => sum + node.xp, 0));
      setBadges(['Explorer', 'Learner', 'Achiever']);
      setLoading(false);
      return;
    }

    const fetchSkillData = async () => {
      try {
        setLoading(true);

        // Fetch interview data
        const { data: interviews } = await supabase
          .from('interviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch additional skills data
        const { data: skillsSessions } = await supabase
          .from('additional_skills_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('Fetched interviews:', interviews);
        console.log('Fetched skills sessions:', skillsSessions);

        // Process and merge data into skill nodes
        const processedNodes = processSkillData(interviews || [], skillsSessions || []);
        
        // If no real data, use mock data with a mix of real and sample
        if (processedNodes.length === 0) {
          const mockNodes = generateMockData();
          setNodes(mockNodes);
          setTotalXP(mockNodes.reduce((sum, node) => sum + node.xp, 0));
          setBadges(['Getting Started', 'Explorer']);
        } else {
          setNodes(processedNodes);
          // Calculate total XP
          const xp = calculateTotalXP(interviews || [], skillsSessions || []);
          setTotalXP(xp);

          // Determine badges
          const earnedBadges = calculateBadges(interviews || [], skillsSessions || []);
          setBadges(earnedBadges);
        }

      } catch (error) {
        console.error('Error fetching skill data:', error);
        // Fallback to mock data on error
        const mockNodes = generateMockData();
        setNodes(mockNodes);
        setTotalXP(mockNodes.reduce((sum, node) => sum + node.xp, 0));
        setBadges(['Explorer', 'Resilient']);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();

    // Set up real-time subscriptions
    const interviewsSubscription = supabase
      .channel('interviews_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'interviews', filter: `user_id=eq.${user.id}` },
        () => fetchSkillData()
      )
      .subscribe();

    const skillsSubscription = supabase
      .channel('skills_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'additional_skills_sessions', filter: `user_id=eq.${user.id}` },
        () => fetchSkillData()
      )
      .subscribe();

    return () => {
      interviewsSubscription.unsubscribe();
      skillsSubscription.unsubscribe();
    };
  }, [user]);

  // Process raw data into skill nodes
  const processSkillData = (interviews: any[], skillsSessions: any[]): SkillNode[] => {
    const skillMap = new Map<string, SkillNode>();

    // Process interviews
    interviews.forEach(interview => {
      const skillName = `${interview.role || 'Technical'} Interview`;
      const existing = skillMap.get(skillName);
      
      if (existing) {
        existing.sessions.push(interview);
        existing.score = (existing.score + (interview.overall_score || 0)) / 2;
        existing.xp += 50;
        existing.lastUpdated = new Date(Math.max(
          new Date(existing.lastUpdated).getTime(),
          new Date(interview.created_at).getTime()
        ));
      } else {
        skillMap.set(skillName, {
          id: `interview-${skillName}`,
          name: skillName,
          category: 'Technical',
          score: interview.overall_score || 0,
          xp: 50,
          improvement: 0,
          streakDays: 0,
          rubric: {
            clarity: interview.rubric?.clarity || 0,
            depth: interview.rubric?.depth || 0,
            structure: interview.rubric?.structure || 0,
            communication: interview.rubric?.communication || 0,
            accuracy: interview.rubric?.technical_accuracy || 0
          },
          lastUpdated: new Date(interview.created_at),
          sessions: [interview],
          position: { x: 0, y: 0, z: 0 }
        });
      }
    });

    // Process additional skills sessions
    skillsSessions.forEach(session => {
      if (session.domains && Array.isArray(session.domains)) {
        session.domains.forEach((domain: string) => {
          const existing = skillMap.get(domain);
          
          if (existing) {
            existing.sessions.push(session);
            existing.score = (existing.score + (session.overall_score || 0)) / 2;
            existing.xp += 30;
            existing.lastUpdated = new Date(Math.max(
              new Date(existing.lastUpdated).getTime(),
              new Date(session.created_at).getTime()
            ));
          } else {
            skillMap.set(domain, {
              id: `skill-${domain}`,
              name: domain,
              category: getCategoryForDomain(domain),
              score: session.overall_score || 0,
              xp: 30,
              improvement: 0,
              streakDays: 0,
              rubric: session.details?.[0]?.rubric || {
                clarity: 0,
                relevance: 0,
                structure: 0,
                communication: 0,
                accuracy: 0
              },
              lastUpdated: new Date(session.created_at),
              sessions: [session],
              position: { x: 0, y: 0, z: 0 }
            });
          }
        });
      }
    });

    // Calculate improvements and streaks
    const nodes = Array.from(skillMap.values());
    nodes.forEach(node => {
      if (node.sessions.length > 1) {
        const firstScore = node.sessions[node.sessions.length - 1].overall_score || 0;
        const latestScore = node.sessions[0].overall_score || 0;
        if (firstScore > 0) {
          node.improvement = ((latestScore - firstScore) / firstScore) * 100;
        }
      }
      
      // Calculate streak days (simplified)
      node.streakDays = calculateStreakDays(node.sessions);
    });

    return nodes;
  };

  const getCategoryForDomain = (domain: string): SkillNode['category'] => {
    const categoryMap: Record<string, SkillNode['category']> = {
      'Finance': 'Additional Skills',
      'Soft Skills': 'Soft Skills',
      'Marketing': 'Additional Skills',
      'Sales': 'Additional Skills',
      'HR': 'Additional Skills',
      'Operations': 'Additional Skills',
      'Consulting': 'Additional Skills'
    };
    return categoryMap[domain] || 'Additional Skills';
  };

  const calculateTotalXP = (interviews: any[], skillsSessions: any[]): number => {
    return (interviews.length * 50) + (skillsSessions.length * 30);
  };

  const calculateBadges = (interviews: any[], skillsSessions: any[]): string[] => {
    const badges: string[] = [];
    
    if (interviews.length >= 5) badges.push('Interview Veteran');
    if (skillsSessions.length >= 10) badges.push('Skill Explorer');
    if (interviews.some(i => (i.overall_score || 0) >= 90)) badges.push('Excellence Achiever');
    if (skillsSessions.some(s => (s.overall_score || 0) >= 85)) badges.push('Domain Master');
    
    return badges;
  };

  const calculateStreakDays = (sessions: any[]): number => {
    if (sessions.length < 2) return 0;
    
    const dates = sessions
      .map(s => new Date(s.created_at).toDateString())
      .sort();
    
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Filter nodes based on search and filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Search filter
      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Domain filter
      if (filters.domains.length > 0 && !filters.domains.includes(node.category)) {
        return false;
      }
      
      // Score range filter
      if (node.score < filters.scoreRange[0] || node.score > filters.scoreRange[1]) {
        return false;
      }
      
      // Recency filter
      if (filters.recency !== 'all') {
        const days = parseInt(filters.recency);
        const daysSinceUpdate = (Date.now() - node.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > days) {
          return false;
        }
      }
      
      return true;
    });
  }, [nodes, searchQuery, filters]);

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
    setCurrentPath(['Skill Galaxy', node.category, node.name]);
  };

  const handleNodeDoubleClick = (node: SkillNode) => {
    // Center camera on node - will be implemented in GalaxyCanvas
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
    setCurrentPath(['Skill Galaxy']);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  };

  if (loading) {
    return (
      <motion.div 
        className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-white text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Initializing Skill Galaxy...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: performanceMode ? 100 : 200 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 3D Galaxy Canvas */}
      <GalaxyCanvas
        nodes={filteredNodes}
        layout={layout}
        performanceMode={performanceMode}
        hoveredNode={hoveredNode}
        selectedNode={selectedNode}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeHover={setHoveredNode}
        mouseX={springX}
        mouseY={springY}
      />

      {/* Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        performanceMode={performanceMode}
        onPerformanceModeToggle={setPerformanceMode}
        totalXP={totalXP}
        badges={badges}
      />

      {/* Right Dock */}
      <RightDock
        layout={layout}
        onLayoutChange={setLayout}
        filters={filters}
        onFiltersChange={setFilters}
        nodeCount={filteredNodes.length}
      />

      {/* Bottom Crumbs */}
      <BottomCrumbs path={currentPath} />

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            className="fixed pointer-events-none z-50 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20"
            style={{
              left: springX,
              top: springY,
              transform: 'translate(-50%, -120%)',
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.16 }}
          >
            <div className="text-sm font-semibold">{hoveredNode.name}</div>
            <div className="text-xs text-gray-300">
              Score: {hoveredNode.score.toFixed(1)} • XP: {hoveredNode.xp}
            </div>
            <div className="text-xs text-gray-400">
              Updated: {hoveredNode.lastUpdated.toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs">
          <div>Nodes: {filteredNodes.length}</div>
          <div>Total XP: {totalXP}</div>
          <div>Badges: {badges.length}</div>
        </div>
      )}
    </motion.div>
  );
};
