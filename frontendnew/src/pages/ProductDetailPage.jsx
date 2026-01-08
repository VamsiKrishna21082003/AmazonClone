import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, addToCart } from '../services/api';
import ImageCarousel from '../components/ImageCarousel';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchProductById(id);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0 || addingToCart) {
      return;
    }

    setAddingToCart(true);

    try {
      const response = await addToCart(product.id, 1);
      if (response.success) {
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

  const handleBuyNow = async () => {
    if (product.stock_quantity === 0 || addingToCart) {
      return;
    }

    setAddingToCart(true);

    try {
      const response = await addToCart(product.id, 1);
      if (response.success) {
        // Navigate to checkout after adding to cart
        navigate('/checkout');
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

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-message">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="error-message">{error}</div>
        <button
          className="back-button"
          onClick={() => navigate('/products')}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-message">Product not found</div>
        <button
          className="back-button"
          onClick={() => navigate('/products')}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  // Prepare images array - use images from API or fallback to primary_image
  const images = product.images && product.images.length > 0
    ? product.images
    : product.primary_image
    ? [{ image_url: product.primary_image, is_primary: true }]
    : [];

  return (
    <div className="product-detail-page">
      <button
        className="back-button"
        onClick={() => navigate('/products')}
      >
        ← Back to Products
      </button>

      <div className="product-detail-container">
        <div className="product-detail-images">
          <ImageCarousel images={images} />
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          
          {product.category_name && (
            <div className="product-detail-category">
              Category: <span>{product.category_name}</span>
            </div>
          )}

          <div className="product-detail-price">
            {formatPrice(product.price)}
          </div>

          <div className="product-detail-stock">
            {product.stock_quantity > 0 ? (
              <span className="stock-status in-stock">
                ✓ In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="stock-status out-of-stock">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {product.description && (
            <div className="product-detail-description">
              <h2>Product Description</h2>
              <p>{product.description}</p>
            </div>
          )}

          <div className="product-detail-actions">
            <button
              className="add-to-cart-btn-detail"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || addingToCart}
            >
              {addingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0 || addingToCart}
            >
              {addingToCart ? 'Adding...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
