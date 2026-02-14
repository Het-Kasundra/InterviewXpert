# Supabase Database Setup Instructions

## ✅ Step 1: New Credentials Updated

Your new Supabase credentials have been updated in the `.env` file:
- **Project URL**: `https://bfzabyyikqfmxrvafdgv.supabase.co`
- **API Key**: `sb_publishable_g0hz9D8mDeW7ssqR4UbKXg_N4xXn2DR`

## 📋 Step 2: Run SQL Setup Script

1. **Go to your Supabase Dashboard**:
   - Visit: https://bfzabyyikqfmxrvafdgv.supabase.co
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the setup script**:
   - Click **"New query"**
   - Copy the entire contents of `supabase_setup.sql`
   - Paste it into the SQL editor
   - Click **"Run"** or press `Cmd/Ctrl + Enter`

## 🗃️ Tables Created

The setup script will create the following 11 tables:

1. **profiles** - User profile information
2. **interviews** - Interview session records
3. **scheduled_interviews** - Upcoming scheduled interviews
4. **additional_skills_sessions** - Additional skills assessment sessions
5. **user_gamification** - User gamification stats (XP, level, streaks)
6. **daily_goals** - Daily practice goals
7. **user_badges** - User achievements and badges
8. **weekly_challenges** - Weekly challenges
9. **resume_analyses** - Resume analysis results
10. **user_portfolio** - User portfolio data
11. **projects** - User project showcase

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Public portfolios accessible to everyone
- ✅ Automatic timestamp updates
- ✅ Referential integrity with foreign keys

## ⚡ Performance Optimizations

- ✅ Indexes on frequently queried columns
- ✅ Triggers for automatic timestamp updates
- ✅ Optimized RLS policies

## 🔧 RPC Functions Included

1. **create_initial_daily_goals** - Creates default daily goals for new users
2. **create_initial_badges** - Creates initial badge set for new users

## 🚀 Next Steps

After running the SQL script:

1. ✅ Restart your development server (automatic)
2. ✅ Test login/signup functionality
3. ✅ Verify data is being saved correctly

## 🔍 Troubleshooting

If you encounter errors:

1. **Check Supabase connection**: Make sure your project is not paused
2. **Verify credentials**: Ensure the URL and API key are correct
3. **Check SQL errors**: Review any error messages in the SQL editor
4. **Clear browser cache**: Sometimes helps with authentication issues

## 💡 Tips

- The database is configured to work immediately after running the SQL script
- New user signups will automatically create a profile entry
- Gamification features will initialize on first use
- All timestamps are in UTC

---

**Ready to use!** Your database should be fully functional after running the SQL script.
