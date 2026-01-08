import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Amazon Clone</h1>
      <p>React app is running successfully!</p>
      <Link to="/products" className="home-page-link">
        Browse Products →
      </Link>
    </div>
  );
}

export default HomePage;
