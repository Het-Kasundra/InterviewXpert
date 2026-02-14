
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from './SessionProvider';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  role: string;
  tech_stack: string[];
  image_url?: string;
  status: 'in_progress' | 'completed' | 'upcoming';
  achievements: string[];
  links: {
    github?: string;
    site?: string;
    pdf?: string;
  };
  xp_value: number;
  created_at: string;
  updated_at: string;
}

export interface UserPortfolio {
  user_id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  total_projects: number;
  total_xp: number;
  share_slug?: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioContextType {
  projects: Project[];
  portfolio: UserPortfolio | null;
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  generateShareSlug: () => Promise<string>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  const { user, session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user?.id) {
      setProjects([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        // Set empty array instead of failing - allow page to load
        setProjects([]);
        setError(null); // Don't show error, just show empty state
        return;
      }

      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]); // Set empty array on error
      setError(null); // Don't show error for first load
    }
  };

  const fetchPortfolio = async () => {
    if (!user?.id) {
      setPortfolio(null);
      return;
    }

    try {
      let { data, error } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Portfolio doesn'Human: exist, create one
        const newPortfolio = {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user',
          total_projects: 0,
          total_xp: 0,
        };

        const { data: created, error: createError } = await supabase
          .from('user_portfolio')
          .insert(newPortfolio)
          .select()
          .single();

        if (createError) {
          console.error('Error creating portfolio:', createError);
          // Set default portfolio data if creation fails
          setPortfolio({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'user',
            total_projects: 0,
            total_xp: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
        data = created;
      } else if (error) {
        console.error('Error fetching portfolio:', error);
        // Set default portfolio data on error
        setPortfolio({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user',
          total_projects: 0,
          total_xp: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return;
      }

      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      // Set default portfolio on error
      setPortfolio({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'user',
        total_projects: 0,
        total_xp: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const updatePortfolioStats = async () => {
    if (!user?.id) return;

    const totalProjects = projects.length;
    const totalXp = projects.reduce((sum, project) => sum + project.xp_value, 0);

    try {
      const { error } = await supabase
        .from('user_portfolio')
        .update({
          total_projects: totalProjects,
          total_xp: totalXp,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPortfolio(prev => prev ? {
        ...prev,
        total_projects: totalProjects,
        total_xp: totalXp,
      } : null);
    } catch (err) {
      console.error('Error updating portfolio stats:', err);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      console.log('Adding project...', projectData);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);

        // Provide helpful error messages
        if (error.code === '42P01') {
          throw new Error('Projects table does not exist. Please run the Supabase setup SQL first.');
        } else if (error.code === '23505') {
          throw new Error('A project with this ID already exists.');
        } else if (error.message.includes('permission')) {
          throw new Error('You don not have permission to add projects. Check your Supabase RLS policies.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      console.log('Project added successfully:', data);
      setProjects(prev => [data, ...prev]);
      await updatePortfolioStats();
    } catch (err) {
      console.error('Error adding project:', err);
      if (err instanceof Error) {
        throw err; // Re-throw with the specific error message
      }
      throw new Error('Failed to add project. Please check the console for details.');
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === id ? data : p));
      await updatePortfolioStats();
    } catch (err) {
      console.error('Error updating project:', err);
      throw new Error('Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      await updatePortfolioStats();
    } catch (err) {
      console.error('Error deleting project:', err);
      throw new Error('Failed to delete project');
    }
  };

  const generateShareSlug = async (): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    const slug = `${user.email?.split('@')[0] || 'user'}-${Date.now()}`;

    try {
      const { error } = await supabase
        .from('user_portfolio')
        .update({ share_slug: slug })
        .eq('user_id', user.id);

      if (error) throw error;

      setPortfolio(prev => prev ? { ...prev, share_slug: slug } : null);
      return slug;
    } catch (err) {
      console.error('Error generating share slug:', err);
      throw new Error('Failed to generate share link');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchProjects(), fetchPortfolio()]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && user?.id) {
      refreshData();
    } else {
      setProjects([]);
      setPortfolio(null);
      setLoading(false);
    }
  }, [session, user?.id]);

  useEffect(() => {
    if (projects.length > 0) {
      updatePortfolioStats();
    }
  }, [projects.length]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const projectsSubscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new as Project, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p));
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
    };
  }, [user?.id]);

  const value = {
    projects,
    portfolio,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refreshData,
    generateShareSlug,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
