import { Navigate, NavLink, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import DailyCheckIn from './screens/DailyCheckIn';
import FitnessTracker from './screens/FitnessTracker';
import HabitTracker from './screens/HabitTracker';
import LaunchKit from './screens/LaunchKit';
import LaunchOnboarding from './screens/LaunchOnboarding';
import Onboarding from './screens/Onboarding';
import ProgressDashboard from './screens/ProgressDashboard';
import CravingRescue from './screens/CravingRescue';
import Settings from './screens/Settings';
import ShareProgressScreen from './screens/ShareProgressScreen';
import WorkoutMode from './screens/WorkoutMode';
import {
  ExerciseDetail,
  FuelPage,
  MeetingsPage as MockMeetingsPage,
  OnboardingFlow,
  TalkPage as MockTalkPage,
  TodayPage,
  TrainPage,
} from './screens/IronHabitMockup';

const navItems = [
  { to: '/today', label: 'Today', icon: '⌂' },
  { to: '/meetings', label: 'Meetings', icon: '◎' },
  { to: '/train', label: 'Train', icon: '♞' },
  { to: '/fuel', label: 'Fuel', icon: '◒' },
  { to: '/profile', label: 'Progress', icon: '◈' },
];

const isActiveRoute = (path: string, target: string) => {
  if (target === '/meetings') return path.startsWith('/meetings');
  if (target === '/train') return ['/train', '/exercise', '/workout-mode', '/fitness-tracker'].some((route) => path.startsWith(route));
  if (target === '/profile') return ['/profile', '/progress-dashboard', '/share-progress', '/proof'].some((route) => path.startsWith(route));
  if (target === '/today') return path === '/today' || path === '/talk' || path === '/check-in' || path === '/daily-check-in' || path === '/habit-tracker';
  return path.startsWith(target);
};

function AppLayout() {
  const location = useLocation();
  const introRoutes = ['/', '/intro', '/onboarding', '/onboarding-preview', '/setup-profile'];
  const showDock = !introRoutes.includes(location.pathname);
  const useFloatingRescue = location.pathname.startsWith('/fuel');
  const useReferenceTrainDock = location.pathname === '/train' || location.pathname.startsWith('/workout-mode');

  return (
    <div className="app-shell ih-app-shell">
      <main className={`screen-frame ih-screen-frame${useReferenceTrainDock ? ' ih-reference-scroll-frame' : ''}`}>
        <Routes>
          <Route path="/" element={<LaunchOnboarding />} />
          <Route path="/intro" element={<LaunchOnboarding />} />
          <Route path="/onboarding" element={<LaunchOnboarding />} />
          <Route path="/onboarding-preview" element={<OnboardingFlow />} />
          <Route path="/setup-profile" element={<Onboarding />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/talk" element={<MockTalkPage />} />
          <Route path="/meetings" element={<MockMeetingsPage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/fitness-tracker" element={<FitnessTracker />} />
          <Route path="/exercise" element={<ExerciseDetail />} />
          <Route path="/workout-mode" element={<WorkoutMode />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/rescue" element={<CravingRescue />} />
          <Route path="/craving-rescue" element={<CravingRescue />} />
          <Route path="/proof" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProgressDashboard />} />
          <Route path="/progress-dashboard" element={<ProgressDashboard />} />
          <Route path="/share-progress" element={<ShareProgressScreen />} />
          <Route path="/check-in" element={<DailyCheckIn />} />
          <Route path="/daily-check-in" element={<DailyCheckIn />} />
          <Route path="/habit-tracker" element={<HabitTracker />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/launch-kit" element={<LaunchKit />} />
        </Routes>
      </main>

      {showDock && useFloatingRescue && (
        <NavLink to="/rescue?chain=1" className="ih-floating-rescue" aria-label="Open Rescue">
          <span aria-hidden="true">+</span>
          <b>Rescue</b>
        </NavLink>
      )}

      {showDock && (
        <div className={`ih-dock-wrap${useFloatingRescue ? ' ih-dock-wrap-compact' : ''}${useReferenceTrainDock ? ' ih-dock-reference' : ''}`} aria-label="Launch navigation">
          {!useFloatingRescue && !useReferenceTrainDock && (
            <NavLink to="/rescue?chain=1" className="ih-rescue-dock-action">
              <span aria-hidden="true">⚕</span>
              Need help now?
            </NavLink>
          )}
          <nav className="bottom-nav ih-bottom-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={isActiveRoute(location.pathname, item.to) ? 'active' : ''}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
