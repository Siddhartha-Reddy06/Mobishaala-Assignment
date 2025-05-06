import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeFromCart(itemId);
    }
  };

  // Handle clearing the cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (!currentUser) {
      // If user is not logged in, redirect to login page
      navigate('/login', { state: { from: '/cart', message: 'Please log in to continue with your purchase' } });
    } else {
      // If user is logged in, proceed to checkout
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading your cart...</p>
      </LoadingContainer>
    );
  }

  return (
    <CartContainer>
      <CartHeader>
        <h1>
          <FaShoppingCart /> Shopping Cart
        </h1>
        <CartItems>{cart.items.length} item(s)</CartItems>
      </CartHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {cart.items.length === 0 ? (
        <EmptyCart>
          <EmptyCartIcon>
            <FaShoppingCart />
          </EmptyCartIcon>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <ContinueShoppingButton to="/products">
            Continue Shopping
          </ContinueShoppingButton>
        </EmptyCart>
      ) : (
        <CartContent>
          {/* Cart Items */}
          <CartItemsContainer>
            <CartTable>
              <CartTableHeader>
                <CartHeaderCell width="50%">Product</CartHeaderCell>
                <CartHeaderCell width="20%">Price</CartHeaderCell>
                <CartHeaderCell width="20%">Quantity</CartHeaderCell>
                <CartHeaderCell width="10%">Total</CartHeaderCell>
              </CartTableHeader>

              {cart.items.map((item) => (
                <CartItem key={item._id}>
                  <ProductCell>
                    <ProductImage 
                      src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://via.placeholder.com/100'} 
                      alt={item.product.name} 
                    />
                    <ProductInfo>
                      <ProductName to={`/products/${item.product._id}`}>
                        {item.product.name}
                      </ProductName>
                      {Object.keys(item.customization || {}).length > 0 && (
                        <CustomizationOptions>
                          {Object.entries(item.customization).map(([key, value]) => (
                            <CustomizationOption key={key}>
                              <strong>{key}:</strong> {value}
                            </CustomizationOption>
                          ))}
                        </CustomizationOptions>
                      )}
                      <RemoveButton onClick={() => handleRemoveItem(item._id)}>
                        <FaTrash /> Remove
                      </RemoveButton>
                    </ProductInfo>
                  </ProductCell>
                  <PriceCell>₹{item.price}</PriceCell>
                  <QuantityCell>
                    <QuantityControls>
                      <QuantityButton 
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </QuantityButton>
                      <QuantityInput 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value, 10))}
                        min="1"
                      />
                      <QuantityButton 
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        +
                      </QuantityButton>
                    </QuantityControls>
                  </QuantityCell>
                  <TotalCell>₹{(item.price * item.quantity).toFixed(2)}</TotalCell>
                </CartItem>
              ))}
            </CartTable>

            <CartActions>
              <ContinueShopping to="/products">
                <FaArrowLeft /> Continue Shopping
              </ContinueShopping>
              <ClearCartButton onClick={handleClearCart}>
                Clear Cart
              </ClearCartButton>
            </CartActions>
          </CartItemsContainer>

          {/* Cart Summary */}
          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
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
            
            {calculateShipping(calculateSubtotal()) > 0 && (
              <ShippingMessage>
                Add ₹{(1000 - calculateSubtotal()).toFixed(2)} more to get FREE shipping!
              </ShippingMessage>
            )}
            
            <Divider />
            
            <TotalRow>
              <TotalLabel>Total</TotalLabel>
              <TotalValue>₹{calculateTotal().toFixed(2)}</TotalValue>
            </TotalRow>
            
            <CheckoutButton onClick={handleCheckout}>
              Proceed to Checkout <FaArrowRight />
            </CheckoutButton>
            
            <SecureCheckoutMessage>
              <span>🔒</span> Secure Checkout
            </SecureCheckoutMessage>
          </CartSummary>
        </CartContent>
      )}
    </CartContainer>
  );
};

// Styled Components
const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  
  h1 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.8rem;
    color: #333;
    
    svg {
      color: #F06292;
    }
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    
    h1 {
      font-size: 1.5rem;
    }
  }
`;

const CartItems = styled.span`
  font-size: 1rem;
  color: #666;
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

const EmptyCart = styled.div`
  text-align: center;
  margin: 80px 0;
  
  h2 {
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    margin-bottom: 30px;
  }
`;

const EmptyCartIcon = styled.div`
  font-size: 60px;
  color: #ddd;
  margin-bottom: 20px;
`;

const ContinueShoppingButton = styled(Link)`
  display: inline-block;
  background-color: #F06292;
  color: white;
  padding: 12px 25px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const CartTable = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const CartTableHeader = styled.div`
  display: flex;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const CartHeaderCell = styled.div`
  width: ${props => props.width || 'auto'};
  font-weight: 600;
  color: #333;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  width: 50%;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
  
  &:hover {
    color: #F06292;
  }
`;

const CustomizationOptions = styled.div`
  margin-top: 5px;
  font-size: 0.85rem;
  color: #666;
`;

const CustomizationOption = styled.div`
  margin-bottom: 3px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #F44336;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PriceCell = styled.div`
  width: 20%;
  font-weight: 500;
`;

const QuantityCell = styled.div`
  width: 20%;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
`;

const QuantityButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #f9f9f9;
  }
`;

const QuantityInput = styled.input`
  width: 40px;
  height: 30px;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.9rem;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const TotalCell = styled.div`
  width: 10%;
  font-weight: 600;
  color: #F06292;
`;

const CartActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ContinueShopping = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  text-decoration: none;
  
  &:hover {
    color: #F06292;
  }
`;

const ClearCartButton = styled.button`
  background: none;
  border: none;
  color: #F44336;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const SummaryLabel = styled.span`
  color: #666;
`;

const SummaryValue = styled.span`
  font-weight: 500;
  color: #333;
`;

const ShippingMessage = styled.div`
  font-size: 0.85rem;
  color: #F06292;
  text-align: right;
  margin-top: -10px;
  margin-bottom: 15px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 15px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
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

const CheckoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 15px;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const SecureCheckoutMessage = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  
  span {
    margin-right: 5px;
  }
`;

export default CartPage;
