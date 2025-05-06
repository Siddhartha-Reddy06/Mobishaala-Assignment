import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaBoxOpen, FaArrowRight, FaFileAlt } from 'react-icons/fa';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderById(id);
        
        if (response.success) {
          setOrder(response.order);
        } else {
          setError('Failed to load order details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrder();
    }
  }, [id]);
  
  // Sample order data for development
  const sampleOrder = {
    _id: id || 'ORD123456789',
    orderNumber: 'ORD123456789',
    user: {
      name: currentUser?.name || 'Guest User',
      email: currentUser?.email || 'guest@example.com'
    },
    items: [
      {
        product: {
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
    paymentMethod: 'cod',
    itemsPrice: 1797,
    taxPrice: 323.46,
    shippingPrice: 0,
    totalPrice: 2120.46,
    isPaid: false,
    isDelivered: false,
    status: 'processing',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  };

  const displayOrder = order || sampleOrder;
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading order information...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton to="/orders">View All Orders</BackButton>
      </ErrorContainer>
    );
  }

  return (
    <SuccessContainer>
      <SuccessHeader>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>
        <SuccessTitle>Order Placed Successfully!</SuccessTitle>
        <SuccessMessage>
          Thank you for your order. We've received your order and will begin processing it soon.
        </SuccessMessage>
      </SuccessHeader>
      
      <OrderInfoSection>
        <OrderInfoCard>
          <OrderNumberRow>
            <OrderLabel>Order Number:</OrderLabel>
            <OrderNumber>{displayOrder.orderNumber || displayOrder._id}</OrderNumber>
          </OrderNumberRow>
          
          <OrderInfoRow>
            <OrderLabel>Order Date:</OrderLabel>
            <OrderValue>
              {new Date(displayOrder.createdAt).toLocaleDateString()} at {' '}
              {new Date(displayOrder.createdAt).toLocaleTimeString()}
            </OrderValue>
          </OrderInfoRow>
          
          <OrderInfoRow>
            <OrderLabel>Payment Method:</OrderLabel>
            <OrderValue>
              {displayOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
               displayOrder.paymentMethod === 'card' ? 'Credit/Debit Card' : 
               displayOrder.paymentMethod === 'upi' ? 'UPI Payment' : 
               displayOrder.paymentMethod}
            </OrderValue>
          </OrderInfoRow>
          
          <OrderInfoRow>
            <OrderLabel>Payment Status:</OrderLabel>
            <PaymentStatus paid={displayOrder.isPaid}>
              {displayOrder.isPaid ? 'Paid' : 'Pending'}
            </PaymentStatus>
          </OrderInfoRow>
          
          <OrderInfoRow>
            <OrderLabel>Estimated Delivery:</OrderLabel>
            <OrderValue>
              {new Date(displayOrder.estimatedDelivery).toLocaleDateString()}
            </OrderValue>
          </OrderInfoRow>
          
          <OrderInfoRow>
            <OrderLabel>Order Status:</OrderLabel>
            <OrderStatus status={displayOrder.status}>
              {displayOrder.status.charAt(0).toUpperCase() + displayOrder.status.slice(1)}
            </OrderStatus>
          </OrderInfoRow>
        </OrderInfoCard>
      </OrderInfoSection>
      
      <OrderDetailsSection>
        <SectionTitle>Order Details</SectionTitle>
        
        <OrderDetailsGrid>
          {/* Order Items */}
          <OrderItemsCard>
            <CardTitle>
              <FaBoxOpen /> Items Ordered
            </CardTitle>
            
            <OrderItems>
              {displayOrder.items.map((item, index) => (
                <OrderItem key={index}>
                  <ItemImage 
                    src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://via.placeholder.com/60'} 
                    alt={item.product.name} 
                  />
                  <ItemDetails>
                    <ItemName>{item.product.name}</ItemName>
                    <ItemQuantityPrice>
                      {item.quantity} x ₹{item.price.toFixed(2)}
                    </ItemQuantityPrice>
                    {Object.keys(item.customization || {}).length > 0 && (
                      <ItemCustomization>
                        {Object.entries(item.customization).map(([key, value], i) => (
                          <span key={i}>{key}: {value}{i < Object.keys(item.customization).length - 1 ? ', ' : ''}</span>
                        ))}
                      </ItemCustomization>
                    )}
                  </ItemDetails>
                  <ItemTotal>₹{(item.quantity * item.price).toFixed(2)}</ItemTotal>
                </OrderItem>
              ))}
            </OrderItems>
            
            <OrderSummary>
              <SummaryRow>
                <SummaryLabel>Subtotal:</SummaryLabel>
                <SummaryValue>₹{displayOrder.itemsPrice.toFixed(2)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Taxes:</SummaryLabel>
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
          
          {/* Shipping Address */}
          <ShippingAddressCard>
            <CardTitle>Shipping Address</CardTitle>
            
            <AddressDetails>
              <AddressName>{displayOrder.shippingAddress.fullName}</AddressName>
              <AddressLine>{displayOrder.shippingAddress.address}</AddressLine>
              <AddressLine>
                {displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state} {displayOrder.shippingAddress.postalCode}
              </AddressLine>
              <AddressLine>{displayOrder.shippingAddress.country}</AddressLine>
              <AddressPhone>Phone: {displayOrder.shippingAddress.phone}</AddressPhone>
            </AddressDetails>
          </ShippingAddressCard>
        </OrderDetailsGrid>
      </OrderDetailsSection>
      
      <ActionButtonsSection>
        <InvoiceButton>
          <FaFileAlt /> Download Invoice
        </InvoiceButton>
        <ContinueShoppingButton to="/products">
          Continue Shopping <FaArrowRight />
        </ContinueShoppingButton>
      </ActionButtonsSection>
      
      <HelpSection>
        <HelpTitle>Need Help?</HelpTitle>
        <HelpText>
          If you have any questions about your order, please contact our customer support team at <HelpEmail>support@printmine.in</HelpEmail> or call us at <HelpPhone>+91 9876543210</HelpPhone>
        </HelpText>
      </HelpSection>
    </SuccessContainer>
  );
};

// Styled Components
const SuccessContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SuccessIcon = styled.div`
  font-size: 60px;
  color: #4CAF50;
  margin-bottom: 20px;
`;

const SuccessTitle = styled.h1`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.8rem;
`;

const SuccessMessage = styled.p`
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const OrderInfoSection = styled.section`
  margin-bottom: 40px;
`;

const OrderInfoCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const OrderNumberRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
`;

const OrderNumber = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #F06292;
`;

const OrderInfoRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    margin-bottom: 15px;
  }
`;

const OrderLabel = styled.div`
  width: 150px;
  color: #666;
  font-weight: 500;
  
  @media (max-width: 576px) {
    margin-bottom: 5px;
  }
`;

const OrderValue = styled.div`
  color: #333;
`;

const PaymentStatus = styled.div`
  color: ${props => props.paid ? '#4CAF50' : '#FFC107'};
  font-weight: 500;
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  
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

const OrderDetailsSection = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const OrderDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderItemsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ShippingAddressCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #F06292;
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
`;

const ItemQuantityPrice = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const ItemCustomization = styled.div`
  font-size: 0.85rem;
  color: #777;
`;

const ItemTotal = styled.div`
  font-weight: 600;
  color: #333;
`;

const OrderSummary = styled.div`
  margin-top: 30px;
  border-top: 1px dashed #ddd;
  padding-top: 20px;
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

const AddressDetails = styled.div`
  line-height: 1.6;
`;

const AddressName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const AddressLine = styled.div`
  color: #666;
`;

const AddressPhone = styled.div`
  color: #666;
  margin-top: 10px;
`;

const ActionButtonsSection = styled.section`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const InvoiceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 25px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f9f9f9;
    border-color: #ccc;
  }
  
  svg {
    color: #F06292;
  }
`;

const ContinueShoppingButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 25px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const HelpSection = styled.section`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const HelpTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 10px;
`;

const HelpText = styled.p`
  color: #666;
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

export default OrderSuccessPage;
