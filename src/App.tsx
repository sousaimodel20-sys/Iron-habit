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
import Meetings from './screens/Meetings';
import Settings from './screens/Settings';

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/meetings', label: 'Meetings' },
  { to: '/talk', label: 'Talk', center: true },
  { to: '/train', label: 'Train' },
  { to: '/profile', label: 'Proof' },
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
          <Route path="/setup-profile" element={<Onboarding />} />
          <Route path="/daily-check-in" element={<DailyCheckIn />} />
          <Route path="/habit-tracker" element={<HabitTracker />} />
          <Route path="/fitness-tracker" element={<FitnessTracker />} />
          <Route path="/train" element={<FitnessTracker />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/progress-dashboard" element={<ProgressDashboard />} />
          <Route path="/profile" element={<ProgressDashboard />} />
          <Route path="/share-progress" element={<ShareProgressScreen />} />
          <Route path="/craving-rescue" element={<CravingRescue />} />
          <Route path="/rescue" element={<CravingRescue />} />
          <Route path="/talk" element={<TalkCoach />} />
          <Route path="/workout-mode" element={<WorkoutMode />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const trainActive = (item.to === '/train' || item.to === '/fitness-tracker') && ['/train', '/fitness-tracker', '/workout-mode'].includes(location.pathname);
          const proofActive = item.to === '/profile' && ['/profile', '/progress-dashboard', '/share-progress'].includes(location.pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `${item.center ? 'center-talk' : ''} ${isActive || trainActive || proofActive ? 'active' : ''}`.trim()}
            >
              {item.center && <span className="talk-nav-orb" aria-hidden="true">●</span>}
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
