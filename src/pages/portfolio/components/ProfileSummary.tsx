
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '../../../contexts/SessionProvider';
import { usePortfolio } from '../../../contexts/PortfolioProvider';

const ProfileSummary: React.FC = () => {
  const { user, profile } = useSession();
  const { portfolio, generateShareSlug } = usePortfolio();
  const [copying, setCopying] = useState(false);

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      let shareSlug = portfolio?.share_slug;
      
      if (!shareSlug) {
        shareSlug = await generateShareSlug();
      }
      
      const shareUrl = `${window.location.origin}/u/${shareSlug}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success feedback
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setCopying(false);
    }
  };

  const handleShare = async (platform: string) => {
    let shareSlug = portfolio?.share_slug;
    
    if (!shareSlug) {
      shareSlug = await generateShareSlug();
    }
    
    const shareUrl = `${window.location.origin}/u/${shareSlug}`;
    const text = `Check out my portfolio: ${portfolio?.username || user?.email}'s Projects`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 p-0.5">
              <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-white">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
              <i className="ri-check-line text-white text-xs"></i>
            </div>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {profile?.full_name || portfolio?.username || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-slate-400 mb-3">
              {portfolio?.bio || 'Building amazing projects and sharing knowledge'}
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <i className="ri-folder-line text-blue-400"></i>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{portfolio?.total_projects || 0}</div>
                  <div className="text-xs text-slate-400">Projects</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <i className="ri-star-fill text-amber-400"></i>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{portfolio?.total_xp || 0}</div>
                  <div className="text-xs text-slate-400">Total XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleCopyLink}
            disabled={copying}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              copying
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 hover:border-slate-500'
            } whitespace-nowrap`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className={`${copying ? 'ri-check-line' : 'ri-link'} mr-2`}></i>
            {copying ? 'Copied!' : 'Copy Link'}
          </motion.button>

          {/* Social Share Dropdown */}
          <div className="relative group">
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-share-line mr-2"></i>
              Share
            </motion.button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <i className="ri-twitter-x-line text-blue-400"></i>
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <i className="ri-linkedin-line text-blue-500"></i>
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <i className="ri-facebook-line text-blue-600"></i>
                  Share on Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSummary;
