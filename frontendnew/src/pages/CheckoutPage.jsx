import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCart, placeOrder } from '../services/api';

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // Shipping form state
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCart();
      
      if (response.success) {
        const items = response.data || [];
        setCartItems(items);
        
        if (items.length === 0) {
          setError('Your cart is empty. Please add items before checkout.');
        }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{4,10}(-\d{4})?$/.test(formData.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid postal code (4-10 digits, optional extension)';
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    setError(null);

    try {
      const response = await placeOrder();
      
      if (response.success && response.data) {
        // Redirect to confirmation page with order ID
        navigate(`/order-confirmation/${response.data.id}`, {
          state: { order: response.data },
        });
      } else {
        setError(response.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
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
    return calculateSubtotal();
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-message">Loading checkout...</div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/cart')}>
          ← Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-page-title">Checkout</h1>

      <div className="checkout-container">
        <div className="checkout-form-section">
          <div className="checkout-section">
            <h2 className="checkout-section-title">Shipping Address</h2>
            
            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={formErrors.fullName ? 'input-error' : ''}
                  placeholder="John Doe"
                />
                {formErrors.fullName && (
                  <span className="error-text">{formErrors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={formErrors.address ? 'input-error' : ''}
                  placeholder="123 Main St"
                />
                {formErrors.address && (
                  <span className="error-text">{formErrors.address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? 'input-error' : ''}
                    placeholder="New York"
                  />
                  {formErrors.city && (
                    <span className="error-text">{formErrors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={formErrors.state ? 'input-error' : ''}
                    placeholder="NY"
                  />
                  {formErrors.state && (
                    <span className="error-text">{formErrors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={formErrors.zipCode ? 'input-error' : ''}
                    placeholder="10001"
                  />
                  {formErrors.zipCode && (
                    <span className="error-text">{formErrors.zipCode}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={formErrors.country ? 'input-error' : ''}
                />
                {formErrors.country && (
                  <span className="error-text">{formErrors.country}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={formErrors.phone ? 'input-error' : ''}
                  placeholder="(555) 123-4567"
                />
                {formErrors.phone && (
                  <span className="error-text">{formErrors.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-summary-section">
          <div className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-info">
                    <div className="checkout-item-name">{item.product_name}</div>
                    <div className="checkout-item-details">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="checkout-item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-summary-totals">
              <div className="checkout-summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>

              <div className="checkout-summary-row checkout-summary-total">
                <span>Total:</span>
                <span className="checkout-total-amount">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            {error && (
              <div className="checkout-error-message">{error}</div>
            )}

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placingOrder || cartItems.length === 0}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
