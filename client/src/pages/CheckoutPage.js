import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const CheckoutPage = () => {
  const { cart, clearCart, loading: cartLoading } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'cod', // Default to Cash on Delivery
    saveAddress: false
  });

  // Validate that user is logged in and cart has items
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: '/checkout', 
          message: 'Please log in to continue with checkout' 
        } 
      });
    } else if (cart.items.length === 0 && !cartLoading) {
      navigate('/cart', { 
        state: { 
          message: 'Your cart is empty. Please add items to your cart before checkout.' 
        } 
      });
    }
  }, [currentUser, cart.items.length, cartLoading, navigate]);

  // Calculate totals
  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTaxes = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 1000 ? 0 : 100; // Free shipping for orders above 1000
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + taxes + shipping;
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.fullName || !formData.email || !formData.phone || 
          !formData.address || !formData.city || !formData.state || 
          !formData.postalCode || !formData.country) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Create order data
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || {}
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: calculateSubtotal(),
        taxPrice: calculateTaxes(calculateSubtotal()),
        shippingPrice: calculateShipping(calculateSubtotal()),
        totalPrice: calculateTotal()
      };
      
      // Place order
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        // Save address if requested
        if (formData.saveAddress) {
          // This would typically be handled by updating the user profile
          // You would call a profile update service here
        }
        
        // Clear cart
        await clearCart();
        
        // Set success order
        setSuccessOrder(response.order);
        
        // Redirect to order success page
        navigate(`/order-success/${response.order._id}`);
      } else {
        setError(response.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading checkout information...</p>
      </LoadingContainer>
    );
  }

  return (
    <CheckoutContainer>
      <CheckoutHeader>
        <h1>Checkout</h1>
        <BackButton onClick={() => navigate('/cart')}>
          <FaArrowLeft /> Back to Cart
        </BackButton>
      </CheckoutHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <CheckoutContent>
        {/* Checkout Form */}
        <CheckoutForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Shipping Information</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <FormLabel>Full Name*</FormLabel>
                <FormInput
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <FormLabel>Email Address*</FormLabel>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Phone Number*</FormLabel>
                <FormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <FormLabel>Address*</FormLabel>
                <FormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <FormLabel>City*</FormLabel>
                <FormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>State*</FormLabel>
                <FormInput
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <FormLabel>Postal Code*</FormLabel>
                <FormInput
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Country*</FormLabel>
                <FormSelect
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </FormSelect>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormCheckboxGroup>
                <FormCheckbox
                  type="checkbox"
                  name="saveAddress"
                  checked={formData.saveAddress}
                  onChange={handleInputChange}
                />
                <FormCheckboxLabel>Save this address for future orders</FormCheckboxLabel>
              </FormCheckboxGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Payment Method</SectionTitle>
            
            <PaymentOptions>
              <PaymentOption>
                <PaymentRadio
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  id="cod"
                />
                <PaymentLabel htmlFor="cod">Cash on Delivery</PaymentLabel>
              </PaymentOption>
              
              <PaymentOption>
                <PaymentRadio
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleInputChange}
                  id="card"
                />
                <PaymentLabel htmlFor="card">Credit/Debit Card</PaymentLabel>
              </PaymentOption>
              
              <PaymentOption>
                <PaymentRadio
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleInputChange}
                  id="upi"
                />
                <PaymentLabel htmlFor="upi">UPI Payment</PaymentLabel>
              </PaymentOption>
            </PaymentOptions>
            
            {formData.paymentMethod === 'card' && (
              <CardDetailsForm>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Card Number*</FormLabel>
                    <FormInput
                      type="text"
                      placeholder="•••• •••• •••• ••••"
                      disabled
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <FormLabel>Expiry Date*</FormLabel>
                    <FormInput
                      type="text"
                      placeholder="MM/YY"
                      disabled
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>CVV*</FormLabel>
                    <FormInput
                      type="text"
                      placeholder="•••"
                      disabled
                    />
                  </FormGroup>
                </FormRow>
                
                <PaymentNote>
                  <FaLock /> Secure payment processing. Card details are for demonstration purposes only.
                </PaymentNote>
              </CardDetailsForm>
            )}
            
            {formData.paymentMethod === 'upi' && (
              <UPIForm>
                <FormRow>
                  <FormGroup>
                    <FormLabel>UPI ID*</FormLabel>
                    <FormInput
                      type="text"
                      placeholder="yourname@upi"
                      disabled
                    />
                  </FormGroup>
                </FormRow>
                
                <PaymentNote>
                  <FaLock /> UPI payment will be enabled on the order success page. This is for demonstration only.
                </PaymentNote>
              </UPIForm>
            )}
          </FormSection>
          
          <FormSection>
            <SectionTitle>Terms and Conditions</SectionTitle>
            
            <FormRow>
              <FormCheckboxGroup>
                <FormCheckbox
                  type="checkbox"
                  name="termsAccepted"
                  required
                />
                <FormCheckboxLabel>
                  I agree to the <TermsLink>Terms of Service</TermsLink> and <TermsLink>Privacy Policy</TermsLink>
                </FormCheckboxLabel>
              </FormCheckboxGroup>
            </FormRow>
          </FormSection>
          
          <PlaceOrderButton 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </PlaceOrderButton>
        </CheckoutForm>

        {/* Order Summary */}
        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          
          <OrderItems>
            {cart.items.map((item) => (
              <OrderItem key={item._id}>
                <ItemImageContainer>
                  <ItemImage 
                    src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://via.placeholder.com/50'} 
                    alt={item.product.name} 
                  />
                  <ItemQuantity>{item.quantity}</ItemQuantity>
                </ItemImageContainer>
                <ItemDetails>
                  <ItemName>{item.product.name}</ItemName>
                  {Object.keys(item.customization || {}).length > 0 && (
                    <ItemCustomization>
                      {Object.entries(item.customization)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </ItemCustomization>
                  )}
                </ItemDetails>
                <ItemPrice>₹{(item.price * item.quantity).toFixed(2)}</ItemPrice>
              </OrderItem>
            ))}
          </OrderItems>
          
          <SummaryDivider />
          
          <SummaryRow>
            <SummaryLabel>Subtotal</SummaryLabel>
            <SummaryValue>₹{calculateSubtotal().toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Taxes (18% GST)</SummaryLabel>
            <SummaryValue>₹{calculateTaxes(calculateSubtotal()).toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Shipping</SummaryLabel>
            <SummaryValue>
              {calculateShipping(calculateSubtotal()) === 0 
                ? 'Free' 
                : `₹${calculateShipping(calculateSubtotal()).toFixed(2)}`}
            </SummaryValue>
          </SummaryRow>
          
          <SummaryDivider />
          
          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>₹{calculateTotal().toFixed(2)}</TotalValue>
          </TotalRow>
        </OrderSummary>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

// Styled Components
const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CheckoutHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  
  h1 {
    font-size: 1.8rem;
    color: #333;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    
    h1 {
      font-size: 1.5rem;
    }
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: #F06292;
  }
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

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CheckoutForm = styled.form`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #F06292;
    box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.2);
  }
  
  &:disabled {
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #F06292;
    box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.2);
  }
`;

const FormCheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`;

const FormCheckbox = styled.input`
  margin-right: 10px;
  cursor: pointer;
`;

const FormCheckboxLabel = styled.label`
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
`;

const TermsLink = styled.span`
  color: #F06292;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const PaymentOption = styled.div`
  display: flex;
  align-items: center;
`;

const PaymentRadio = styled.input`
  margin-right: 10px;
  cursor: pointer;
`;

const PaymentLabel = styled.label`
  color: #333;
  cursor: pointer;
`;

const CardDetailsForm = styled.div`
  margin-top: 20px;
`;

const UPIForm = styled.div`
  margin-top: 20px;
`;

const PaymentNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
  font-size: 0.85rem;
  margin-top: 10px;
  
  svg {
    color: #4CAF50;
  }
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #EC407A;
  }
  
  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ItemImageContainer = styled.div`
  position: relative;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const ItemQuantity = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #F06292;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ItemCustomization = styled.div`
  font-size: 0.8rem;
  color: #777;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #333;
`;

const SummaryDivider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 15px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SummaryLabel = styled.span`
  color: #666;
`;

const SummaryValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
`;

const TotalLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const TotalValue = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: #F06292;
`;

export default CheckoutPage;
