import { NavLink, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import DailyCheckIn from './screens/DailyCheckIn';
import HabitTracker from './screens/HabitTracker';
import Settings from './screens/Settings';
import LaunchKit from './screens/LaunchKit';
import {
  ExerciseDetail,
  FuelPage,
  MeetingsPage,
  OnboardingFlow,
  ProofPage,
  RescuePage,
  TalkPage,
  TodayPage,
  TrainPage,
  WelcomeSplash,
  WorkoutLogger,
} from './screens/IronHabitMockup';

const navItems = [
  { to: '/today', label: 'Today', icon: '⌂' },
  { to: '/talk', label: 'Talk', icon: '◌' },
  { to: '/meetings', label: 'Meetings', icon: '♜' },
  { to: '/train', label: 'Train', icon: '♞' },
  { to: '/fuel', label: 'Fuel', icon: '◒' },
  { to: '/rescue', label: 'Rescue', icon: '⚕' },
  { to: '/proof', label: 'Proof', icon: '◈' },
];

const isActiveRoute = (path: string, target: string) => {
  if (target === '/train') return ['/train', '/exercise', '/workout-mode', '/fitness-tracker'].some((route) => path.startsWith(route));
  if (target === '/proof') return ['/proof', '/profile', '/progress-dashboard', '/share-progress'].some((route) => path.startsWith(route));
  if (target === '/today') return path === '/today';
  return path.startsWith(target);
};

function AppLayout() {
  const location = useLocation();
  const showDock = location.pathname !== '/' && location.pathname !== '/onboarding';

  return (
    <div className="app-shell ih-app-shell">
      <main className="screen-frame ih-screen-frame">
        <Routes>
          <Route path="/" element={<WelcomeSplash />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/setup-profile" element={<OnboardingFlow />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/talk" element={<TalkPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/fitness-tracker" element={<TrainPage />} />
          <Route path="/exercise" element={<ExerciseDetail />} />
          <Route path="/workout-mode" element={<WorkoutLogger />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/rescue" element={<RescuePage />} />
          <Route path="/craving-rescue" element={<RescuePage />} />
          <Route path="/proof" element={<ProofPage />} />
          <Route path="/profile" element={<ProofPage />} />
          <Route path="/progress-dashboard" element={<ProofPage />} />
          <Route path="/share-progress" element={<ProofPage />} />
          <Route path="/check-in" element={<DailyCheckIn />} />
          <Route path="/daily-check-in" element={<DailyCheckIn />} />
          <Route path="/habit-tracker" element={<HabitTracker />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/launch-kit" element={<LaunchKit />} />
        </Routes>
      </main>

      {showDock && (
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
