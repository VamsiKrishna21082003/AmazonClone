import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchOrderById } from '../services/api';

function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If order wasn't passed via state, fetch it
    if (!order && id) {
      loadOrder();
    }
  }, [id, order]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchOrderById(id);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="loading-message">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="error-message">{error || 'Order not found'}</div>
        <button className="back-button" onClick={() => navigate('/products')}>
          ← Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header">
        <div className="confirmation-icon">✓</div>
        <h1 className="confirmation-title">Order Confirmed!</h1>
        <p className="confirmation-message">
          Thank you for your order. We've received your order and will begin processing it right away.
        </p>
      </div>

      <div className="confirmation-details">
        <div className="confirmation-section">
          <h2 className="confirmation-section-title">Order Information</h2>
          <div className="confirmation-info-grid">
            <div className="confirmation-info-item">
              <span className="info-label">Order Number:</span>
              <span className="info-value order-number">{order.order_number || `#${order.id}`}</span>
            </div>
            <div className="confirmation-info-item">
              <span className="info-label">Order ID:</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="confirmation-info-item">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{formatDate(order.created_at)}</span>
            </div>
            <div className="confirmation-info-item">
              <span className="info-label">Status:</span>
              <span className="info-value order-status">{order.status || 'pending'}</span>
            </div>
          </div>
        </div>

        <div className="confirmation-section">
          <h2 className="confirmation-section-title">Order Items</h2>
          <div className="confirmation-items-list">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="confirmation-item">
                  <div className="confirmation-item-info">
                    <div className="confirmation-item-name">{item.product_name}</div>
                    <div className="confirmation-item-details">
                      Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                    </div>
                  </div>
                  <div className="confirmation-item-total">
                    {formatPrice(item.total_price)}
                  </div>
                </div>
              ))
            ) : (
              <p>No items found in this order.</p>
            )}
          </div>
        </div>

        <div className="confirmation-section">
          <div className="confirmation-total">
            <div className="confirmation-total-row">
              <span>Total Amount:</span>
              <span className="confirmation-total-amount">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <Link to="/products" className="continue-shopping-btn-confirmation">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
