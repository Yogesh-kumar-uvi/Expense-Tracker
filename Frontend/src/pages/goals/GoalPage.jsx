// src/pages/goals/GoalPage.jsx
import { Link } from 'react-router-dom';

export default function GoalPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Goals</h2>
      <p>Goal management coming soon.</p>
      <Link to="/goals/new" style={{ marginTop: '1rem' }}>
        + New Goal
      </Link>
    </div>
  );
}