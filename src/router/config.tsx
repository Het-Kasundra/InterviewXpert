
import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../components/guards/AuthGuard';
import { AppLayout } from '../components/layout/AppLayout';

// Public pages
import { LandingPage } from '../pages/landing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { PrivacyPage } from '../pages/legal/PrivacyPage';
import { TermsPage } from '../pages/legal/TermsPage';

// Protected pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { InterviewsPage } from '../pages/interviews/InterviewsPage';
import { StartInterviewPage } from '../pages/interviews/StartInterviewPage';
import { InterviewRunnerPage } from '../pages/interviews/InterviewRunnerPage';
import { InterviewResultPage } from '../pages/interviews/InterviewResultPage';
import { SchedulePage } from '../pages/schedule/SchedulePage';
import { TestsPage } from '../pages/tests/TestsPage';
import { AdditionalSkillsPage } from '../pages/additional-skills/AdditionalSkillsPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { GamifiedLearningPage } from '../pages/gamified-learning/GamifiedLearningPage';
import { SkillsPage } from '../pages/skills/SkillsPage';
import { ResumeAnalyzerPage } from '../pages/resume-analyzer/ResumeAnalyzerPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { SupportPage } from '../pages/support/SupportPage';
import { NotFound } from '../pages/NotFound';

import PortfolioPage from '../pages/portfolio/PortfolioPage';
import PublicPortfolioPage from '../pages/portfolio/PublicPortfolioPage';
import ChallengeArenaPage from '../pages/challenge-arena/ChallengeArenaPage';
import { InterviewPrepPage } from '../pages/interview-prep/InterviewPrepPage';
import { JobAnalysisPage } from '../pages/job-analysis/JobAnalysisPage';
import { MockInterviewSimulatorPage } from '../pages/mock-interview/MockInterviewSimulatorPage';
import { InterviewTipsPage } from '../pages/interview-tips/InterviewTipsPage';

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: (
      <AuthGuard requireAuth={false}>
        <LandingPage />
      </AuthGuard>
    ),
  },
  {
    path: '/login',
    element: (
      <AuthGuard requireAuth={false}>
        <LoginPage />
      </AuthGuard>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthGuard requireAuth={false}>
        <SignupPage />
      </AuthGuard>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthGuard requireAuth={false}>
        <ResetPasswordPage />
      </AuthGuard>
    ),
  },
  {
    path: '/privacy',
    element: (
      <AuthGuard requireAuth={false}>
        <PrivacyPage />
      </AuthGuard>
    ),
  },
  {
    path: '/terms',
    element: (
      <AuthGuard requireAuth={false}>
        <PrivacyPage />
      </AuthGuard>
    ),
  },

  // Protected routes with app layout
  {
    path: '/dashboard',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/interviews',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <InterviewsPage />,
      },
      {
        path: 'start',
        element: <StartInterviewPage />,
      },
      {
        path: 'runner',
        element: <InterviewRunnerPage />,
      },
      {
        path: ':id',
        element: <InterviewResultPage />,
      },
    ],
  },
  {
    path: '/schedule',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <SchedulePage />,
      },
    ],
  },
  {
    path: '/tests',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <TestsPage />,
      },
    ],
  },
  {
    path: '/analytics',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <AnalyticsPage />,
      },
    ],
  },
  {
    path: '/gamified-learning',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <GamifiedLearningPage />,
      },
    ],
  },
  {
    path: '/skills',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <SkillsPage />,
      },
    ],
  },
  {
    path: '/resume-analyzer',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <ResumeAnalyzerPage />,
      },
    ],
  },
  {
    path: '/settings',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/support',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <SupportPage />,
      },
    ],
  },
  {
    path: '/additional-skills',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <AdditionalSkillsPage />,
      },
    ],
  },

  {
    path: '/challenge-arena',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <ChallengeArenaPage />,
      },
    ],
  },

  {
    path: '/portfolio',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <PortfolioPage />,
      },
    ],
  },

  {
    path: '/u/:slug',
    element: <PublicPortfolioPage />,
  },

  {
    path: '/interview-prep',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <InterviewPrepPage />,
      },
    ],
  },

  {
    path: '/job-analysis',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <JobAnalysisPage />,
      },
    ],
  },
  {
    path: '/mock-interview',
    element: (
      <AuthGuard requireAuth={true}>
        <MockInterviewSimulatorPage />
      </AuthGuard>
    ),
  },
  {
    path: '/interview-tips',
    element: (
      <AuthGuard requireAuth={true}>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <InterviewTipsPage />,
      },
    ],
  },

  // 404 page
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
