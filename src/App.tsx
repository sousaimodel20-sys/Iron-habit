import { NavLink, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import DailyCheckIn from './screens/DailyCheckIn';
import HabitTracker from './screens/HabitTracker';
import FitnessTracker from './screens/FitnessTracker';
import ProgressDashboard from './screens/ProgressDashboard';
import ShareProgressScreen from './screens/ShareProgressScreen';
import CravingRescue from './screens/CravingRescue';
import TalkCoach from './screens/TalkCoach';
import WorkoutMode from './screens/WorkoutMode';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/fitness-tracker', label: 'Train' },
  { to: '/daily-check-in', label: 'Check-In' },
  { to: '/talk', label: 'Talk' },
  { to: '/progress-dashboard', label: 'Profile' },
];

function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Iron Habit home">
          <span className="brand-mark">IH</span>
          <span>
            <strong>Iron Habit</strong>
            <small>Sober • Strong • Consistent</small>
          </span>
        </NavLink>
        <span className="live-pill">Beta Access</span>
      </header>

      <main className="screen-frame">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/daily-check-in" element={<DailyCheckIn />} />
          <Route path="/habit-tracker" element={<HabitTracker />} />
          <Route path="/fitness-tracker" element={<FitnessTracker />} />
          <Route path="/progress-dashboard" element={<ProgressDashboard />} />
          <Route path="/profile" element={<ProgressDashboard />} />
          <Route path="/share-progress" element={<ShareProgressScreen />} />
          <Route path="/craving-rescue" element={<CravingRescue />} />
          <Route path="/rescue" element={<CravingRescue />} />
          <Route path="/talk" element={<TalkCoach />} />
          <Route path="/workout-mode" element={<WorkoutMode />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const trainActive = item.to === '/fitness-tracker' && location.pathname === '/workout-mode';
          const profileActive = item.to === '/progress-dashboard' && location.pathname === '/profile';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive || trainActive || profileActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
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
