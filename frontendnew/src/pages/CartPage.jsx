import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../services/api';

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCart();
      
      if (response.success) {
        setCartItems(response.data || []);
      } else {
        setError('Failed to load cart');
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      const response = await updateCartItem(cartItemId, newQuantity);
      
      if (response.success) {
        // Reload cart to get updated data
        await loadCart();
      } else {
        alert('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      const response = await removeFromCart(cartItemId);
      
      if (response.success) {
        // Reload cart to get updated data
        await loadCart();
      } else {
        alert('Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    // For now, total equals subtotal (no tax/shipping)
    return calculateSubtotal();
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-message">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/products')}>
          ← Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart to get started!</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span className="cart-items-count">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const itemTotal = item.price * item.quantity;

                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <Link to={`/products/${item.product_id}`}>
                        <img
                          src={item.product_image || 'https://via.placeholder.com/150x150?text=No+Image'}
                          alt={item.product_name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                          }}
                        />
                      </Link>
                    </div>

                    <div className="cart-item-details">
                      <Link to={`/products/${item.product_id}`} className="cart-item-name">
                        {item.product_name}
                      </Link>
                      <div className="cart-item-price">
                        {formatPrice(item.price)}
                      </div>
                      {item.stock_quantity < item.quantity && (
                        <div className="stock-warning">
                          Only {item.stock_quantity} available
                        </div>
                      )}
                    </div>

                    <div className="cart-item-quantity">
                      <label htmlFor={`quantity-${item.id}`}>Qty:</label>
                      <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        disabled={isUpdating}
                        className="quantity-select"
                      >
                        {Array.from({ length: Math.min(item.stock_quantity || 10, 10) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="cart-item-total">
                      <div className="cart-item-total-label">Subtotal:</div>
                      <div className="cart-item-total-price">{formatPrice(itemTotal)}</div>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        aria-label="Remove item"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-subtotal-mobile">
              <div className="cart-subtotal-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):</span>
                <span className="cart-subtotal-amount">{formatPrice(calculateSubtotal())}</span>
              </div>
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary">
              <div className="cart-summary-title">Order Summary</div>
              
              <div className="cart-summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>

              <div className="cart-summary-row cart-summary-total">
                <span>Total:</span>
                <span className="cart-total-amount">{formatPrice(calculateTotal())}</span>
              </div>

              <button
                className="proceed-to-checkout-btn"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
