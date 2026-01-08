import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">amazon</span>
            <span className="logo-dot">.</span>
          </Link>
          
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input-nav"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </form>

          <div className="navbar-right">
            <Link to="/cart" className="navbar-cart">
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="navbar-bottom">
        <div className="navbar-container">
          <div className="navbar-links">
            <Link to="/" className="navbar-link">
              All
            </Link>
            <Link to="/products" className="navbar-link">
              Products
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
