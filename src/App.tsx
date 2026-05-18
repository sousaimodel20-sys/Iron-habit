import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import DailyCheckIn from './screens/DailyCheckIn';
import HabitTracker from './screens/HabitTracker';
import FitnessTracker from './screens/FitnessTracker';
import ProgressDashboard from './screens/ProgressDashboard';
import ShareProgressScreen from './screens/ShareProgressScreen';

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 flex space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Onboarding
        </Link>
        <Link to="/daily-check-in" className="text-blue-600 hover:underline">
          Daily Check-In
        </Link>
        <Link to="/habit-tracker" className="text-blue-600 hover:underline">
          Habit Tracker
        </Link>
        <Link to="/fitness-tracker" className="text-blue-600 hover:underline">
          Fitness Tracker
        </Link>
        <Link to="/progress-dashboard" className="text-blue-600 hover:underline">
          Progress Dashboard
        </Link>
        <Link to="/share-progress" className="text-blue-600 hover:underline">
          Share Progress
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/daily-check-in" element={<DailyCheckIn />} />
        <Route path="/habit-tracker" element={<HabitTracker />} />
        <Route path="/fitness-tracker" element={<FitnessTracker />} />
        <Route path="/progress-dashboard" element={<ProgressDashboard />} />
        <Route path="/share-progress" element={<ShareProgressScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
