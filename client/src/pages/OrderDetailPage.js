import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaCreditCard, FaFileAlt, FaTruck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await orderService.getOrderById(id);
        
        if (response.success) {
          setOrder(response.order);
        } else {
          setError('Failed to fetch order details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, currentUser, navigate]);
  
  // Sample order data for development
  const sampleOrder = {
    _id: id,
    orderNumber: 'ORD' + id,
    createdAt: '2023-12-15T10:30:00Z',
    updatedAt: '2023-12-15T10:30:00Z',
    items: [
      {
        product: {
          _id: 'prod123',
          name: 'Premium Business Cards',
          images: [{ url: 'https://images.unsplash.com/photo-1572502742860-16c574c3ecaa?q=80&w=600' }]
        },
        quantity: 2,
        price: 499,
        customization: {
          'Paper Type': 'Premium Matte',
          'Shape': 'Rounded Corners'
        }
      },
      {
        product: {
          _id: 'prod456',
          name: 'Custom T-Shirt',
          images: [{ url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600' }]
        },
        quantity: 1,
        price: 799,
        customization: {
          'Size': 'Large',
          'Color': 'Navy Blue'
        }
      }
    ],
    shippingAddress: {
      fullName: 'Rahul Sharma',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 9876543210'
    },
    paymentMethod: 'card',
    paymentDetails: {
      method: 'card',
      cardLast4: '4242',
      paidAt: '2023-12-15T10:35:00Z'
    },
    itemsPrice: 1797,
    taxPrice: 323.46,
    shippingPrice: 0,
    totalPrice: 2120.46,
    isPaid: true,
    paidAt: '2023-12-15T10:35:00Z',
    isDelivered: false,
    status: 'processing',
    statusHistory: [
      { status: 'placed', date: '2023-12-15T10:30:00Z', note: 'Order placed successfully' },
      { status: 'processing', date: '2023-12-15T14:20:00Z', note: 'Order processing started' }
    ],
    estimatedDelivery: '2023-12-22T00:00:00Z',
    trackingNumber: null
  };

  const displayOrder = order || sampleOrder;
  
  // Format payment method for display
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      default:
        return method;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#FFC107';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return displayOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading order details...</p>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton to="/orders">Back to Orders</BackButton>
      </ErrorContainer>
    );
  }
  
  return (
    <OrderDetailContainer>
      <BackLink to="/orders">
        <FaArrowLeft /> Back to Orders
      </BackLink>
      
      <OrderHeader>
        <div>
          <OrderTitle>Order #{displayOrder.orderNumber}</OrderTitle>
          <OrderDate>Placed on {formatDate(displayOrder.createdAt)}</OrderDate>
        </div>
        <OrderStatus status={displayOrder.status}>
          {displayOrder.status.charAt(0).toUpperCase() + displayOrder.status.slice(1)}
        </OrderStatus>
      </OrderHeader>
      
      {/* Order Timeline */}
      <TimelineSection>
        <SectionTitle>Order Timeline</SectionTitle>
        <Timeline>
          {displayOrder.statusHistory.map((event, index) => (
            <TimelineItem key={index}>
              <TimelinePoint status={event.status} />
              <TimelineContent>
                <TimelineDate>{formatDate(event.date)}</TimelineDate>
                <TimelineStatus>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </TimelineStatus>
                <TimelineNote>{event.note}</TimelineNote>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineSection>
      
      <OrderDetailsGrid>
        {/* Order Items */}
        <OrderItemsCard>
          <CardTitle>
            <FaBox /> Order Items
          </CardTitle>
          
          <OrderItems>
            {displayOrder.items.map((item, index) => (
              <OrderItem key={index}>
                <ItemImage 
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://via.placeholder.com/80'} 
                  alt={item.product.name} 
                />
                <ItemDetails>
                  <ItemName to={`/products/${item.product._id}`}>
                    {item.product.name}
                  </ItemName>
                  <ItemPrice>₹{item.price.toFixed(2)}</ItemPrice>
                  {Object.keys(item.customization || {}).length > 0 && (
                    <ItemCustomization>
                      {Object.entries(item.customization).map(([key, value], i) => (
                        <span key={i}>{key}: {value}{i < Object.keys(item.customization).length - 1 ? ', ' : ''}</span>
                      ))}
                    </ItemCustomization>
                  )}
                </ItemDetails>
                <ItemQuantity>
                  <span>Qty: {item.quantity}</span>
                </ItemQuantity>
                <ItemTotal>₹{(item.quantity * item.price).toFixed(2)}</ItemTotal>
              </OrderItem>
            ))}
          </OrderItems>
          
          <OrderSummary>
            <SummaryRow>
              <SummaryLabel>Subtotal:</SummaryLabel>
              <SummaryValue>₹{calculateSubtotal().toFixed(2)}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Tax:</SummaryLabel>
              <SummaryValue>₹{displayOrder.taxPrice.toFixed(2)}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Shipping:</SummaryLabel>
              <SummaryValue>
                {displayOrder.shippingPrice === 0 ? 'Free' : `₹${displayOrder.shippingPrice.toFixed(2)}`}
              </SummaryValue>
            </SummaryRow>
            <SummaryTotal>
              <TotalLabel>Total:</TotalLabel>
              <TotalValue>₹{displayOrder.totalPrice.toFixed(2)}</TotalValue>
            </SummaryTotal>
          </OrderSummary>
        </OrderItemsCard>
        
        <OrderInfoSection>
          {/* Shipping Information */}
          <InfoCard>
            <CardTitle>
              <FaMapMarkerAlt /> Shipping Information
            </CardTitle>
            <AddressDetails>
              <AddressLine><strong>{displayOrder.shippingAddress.fullName}</strong></AddressLine>
              <AddressLine>{displayOrder.shippingAddress.address}</AddressLine>
              <AddressLine>{displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state} {displayOrder.shippingAddress.postalCode}</AddressLine>
              <AddressLine>{displayOrder.shippingAddress.country}</AddressLine>
              <AddressLine><strong>Phone:</strong> {displayOrder.shippingAddress.phone}</AddressLine>
            </AddressDetails>
            
            {displayOrder.isDelivered ? (
              <DeliveryStatus delivered>
                Delivered on {formatDate(displayOrder.deliveredAt)}
              </DeliveryStatus>
            ) : (
              <DeliveryStatus>
                {displayOrder.trackingNumber ? (
                  <>
                    <span>Estimated delivery by {new Date(displayOrder.estimatedDelivery).toLocaleDateString()}</span>
                    <TrackingInfo>
                      <FaTruck /> Tracking #: {displayOrder.trackingNumber}
                    </TrackingInfo>
                  </>
                ) : (
                  <span>Not yet shipped</span>
                )}
              </DeliveryStatus>
            )}
          </InfoCard>
          
          {/* Payment Information */}
          <InfoCard>
            <CardTitle>
              <FaCreditCard /> Payment Information
            </CardTitle>
            <PaymentDetails>
              <PaymentLine><strong>Method:</strong> {formatPaymentMethod(displayOrder.paymentMethod)}</PaymentLine>
              
              {displayOrder.paymentMethod === 'card' && displayOrder.paymentDetails?.cardLast4 && (
                <PaymentLine><strong>Card:</strong> **** **** **** {displayOrder.paymentDetails.cardLast4}</PaymentLine>
              )}
              
              <PaymentLine>
                <strong>Status:</strong>{' '}
                <PaymentStatus paid={displayOrder.isPaid}>
                  {displayOrder.isPaid ? `Paid on ${formatDate(displayOrder.paidAt)}` : 'Not Paid'}
                </PaymentStatus>
              </PaymentLine>
            </PaymentDetails>
          </InfoCard>
          
          {/* Actions */}
          <ActionButtons>
            <InvoiceButton>
              <FaFileAlt /> Download Invoice
            </InvoiceButton>
            <ContactButton>
              Contact Support
            </ContactButton>
          </ActionButtons>
        </OrderInfoSection>
      </OrderDetailsGrid>
      
      <HelpSection>
        <HelpText>
          Need help with your order? Contact our customer support at <HelpEmail>support@printmine.in</HelpEmail> or call us at <HelpPhone>+91 9876543210</HelpPhone>
        </HelpText>
      </HelpSection>
    </OrderDetailContainer>
  );
};

// Styled Components
const OrderDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #F06292;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  margin: 50px auto;
  max-width: 600px;
  
  h2 {
    color: #d32f2f;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 30px;
    color: #666;
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  background-color: #F06292;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  margin-bottom: 30px;
  
  &:hover {
    color: #F06292;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const OrderTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 8px;
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const OrderDate = styled.div`
  color: #666;
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  
  ${props => {
    switch (props.status) {
      case 'processing':
        return `
          background-color: #E3F2FD;
          color: #2196F3;
        `;
      case 'shipped':
        return `
          background-color: #FFF8E1;
          color: #FFC107;
        `;
      case 'delivered':
        return `
          background-color: #E8F5E9;
          color: #4CAF50;
        `;
      case 'cancelled':
        return `
          background-color: #FFEBEE;
          color: #F44336;
        `;
      default:
        return `
          background-color: #F5F5F5;
          color: #757575;
        `;
    }
  }}
`;

const TimelineSection = styled.section`
  margin-bottom: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TimelineItem = styled.div`
  display: flex;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 30px;
    left: 12px;
    bottom: -20px;
    width: 2px;
    background-color: #eee;
  }
`;

const TimelinePoint = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => getStatusColor(props.status)};
  margin-right: 15px;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const TimelineStatus = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const TimelineNote = styled.div`
  color: #555;
`;

const OrderDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderItemsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 20px;
  
  svg {
    color: #F06292;
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 15px;
  align-items: center;
  
  &:not(:last-child) {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 10px;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
    grid-row: span 2;
  }
`;

const ItemDetails = styled.div`
  @media (max-width: 576px) {
    grid-column: 2;
  }
`;

const ItemName = styled(Link)`
  display: block;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  margin-bottom: 5px;
  
  &:hover {
    color: #F06292;
  }
`;

const ItemPrice = styled.div`
  color: #666;
  margin-bottom: 5px;
`;

const ItemCustomization = styled.div`
  font-size: 0.85rem;
  color: #777;
`;

const ItemQuantity = styled.div`
  color: #666;
  font-size: 0.95rem;
  
  @media (max-width: 576px) {
    grid-column: 2;
    grid-row: 2;
  }
`;

const ItemTotal = styled.div`
  font-weight: 600;
  color: #333;
  
  @media (max-width: 576px) {
    justify-self: end;
    grid-column: 2;
    grid-row: 1;
  }
`;

const OrderSummary = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SummaryLabel = styled.div`
  color: #666;
`;

const SummaryValue = styled.div`
  color: #333;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const TotalLabel = styled.div`
  font-weight: 600;
  color: #333;
`;

const TotalValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #F06292;
`;

const OrderInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const AddressDetails = styled.div`
  margin-bottom: 20px;
`;

const AddressLine = styled.div`
  color: #555;
  margin-bottom: 5px;
  
  &:last-child {
    margin-top: 10px;
  }
`;

const DeliveryStatus = styled.div`
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.delivered ? '#E8F5E9' : '#FFF8E1'};
  color: ${props => props.delivered ? '#4CAF50' : '#FFC107'};
  font-weight: 500;
`;

const TrackingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.9rem;
`;

const PaymentDetails = styled.div``;

const PaymentLine = styled.div`
  color: #555;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PaymentStatus = styled.span`
  color: ${props => props.paid ? '#4CAF50' : '#FFC107'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const InvoiceButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: white;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #F06292;
    color: #F06292;
  }
  
  svg {
    color: #F06292;
  }
`;

const ContactButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const HelpSection = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const HelpText = styled.p`
  color: #555;
  line-height: 1.6;
`;

const HelpEmail = styled.span`
  color: #F06292;
  font-weight: 500;
`;

const HelpPhone = styled.span`
  color: #F06292;
  font-weight: 500;
`;

export default OrderDetailPage;
