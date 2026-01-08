import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../services/api';

function ProductCard({ product }) {
  const [addingToCart, setAddingToCart] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity === 0 || addingToCart) {
      return;
    }

    setAddingToCart(true);

    try {
      const response = await addToCart(product.id, 1);
      if (response.success) {
        // Show success feedback (you could use a toast notification library here)
        alert(`Added ${product.name} to cart!`);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <img
            src={product.primary_image || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">{formatPrice(product.price)}</div>
          {product.stock_quantity > 0 ? (
            <span className="product-stock">In Stock</span>
          ) : (
            <span className="product-stock out-of-stock">Out of Stock</span>
          )}
        </div>
      </Link>
      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stock_quantity === 0 || addingToCart}
      >
        {addingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}

export default ProductCard;
