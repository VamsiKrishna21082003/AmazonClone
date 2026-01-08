import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Home & Kitchen', label: 'Home & Kitchen' },
  { value: 'Sports', label: 'Sports' },
];

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('q') || '');

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('q');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setDebouncedSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Update URL when search changes
      if (searchTerm.trim()) {
        setSearchParams({ q: searchTerm.trim() });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  // Fetch products when search term or category changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (debouncedSearchTerm.trim()) {
          params.q = debouncedSearchTerm.trim();
        }
        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const response = await fetchProducts(params);
        
        if (response.success) {
          setProducts(response.data || []);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1>Products</h1>
        <div className="product-list-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-filter"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-message">Loading products...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="no-products-message">
          No products found. Try adjusting your search or filter.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="products-count">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </div>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductListPage;
