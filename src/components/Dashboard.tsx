import { JSX } from "react";

const Dashboard = (): JSX.Element => {
  return (
    <main style={{ flex: 1, padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Dashboard</h1>
      <p>Her kommer kort, grafer og oversigter...</p>
    </main>
  );
};

export default Dashboard;
