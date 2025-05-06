import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch cart when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      // Load cart from local storage if not logged in
      const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalPrice: 0 };
      setCart(localCart);
    }
  }, [currentUser]);

  // Save cart to local storage when it changes (for non-logged in users)
  useEffect(() => {
    if (!currentUser && cart.items) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // Fetch user's cart from the server
  const fetchCart = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      setCart(response.cart);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch cart');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1, customization = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        // Add to server cart if logged in
        const response = await cartService.addToCart(product._id, quantity, customization);
        setCart(response.cart);
      } else {
        // Add to local cart if not logged in
        const existingItemIndex = cart.items.findIndex(item => 
          item.product._id === product._id && 
          JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        let newItems;
        
        if (existingItemIndex > -1) {
          // Update quantity if product already in cart
          newItems = [...cart.items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          newItems = [
            ...cart.items,
            {
              product,
              quantity,
              customization,
              price: product.discountPrice || product.price
            }
          ];
        }
        
        // Calculate new total price
        const newTotalPrice = newItems.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
        
        setCart({
          items: newItems,
          totalPrice: newTotalPrice
        });
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add item to cart');
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        // Update server cart if logged in
        const response = await cartService.updateCartItem(itemId, quantity);
        setCart(response.cart);
      } else {
        // Update local cart if not logged in
        const newItems = cart.items.map(item => 
          item._id === itemId ? { ...item, quantity } : item
        );
        
        // Calculate new total price
        const newTotalPrice = newItems.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
        
        setCart({
          items: newItems,
          totalPrice: newTotalPrice
        });
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update cart item');
      console.error('Error updating cart item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        // Remove from server cart if logged in
        const response = await cartService.removeCartItem(itemId);
        setCart(response.cart);
      } else {
        // Remove from local cart if not logged in
        const newItems = cart.items.filter(item => item._id !== itemId);
        
        // Calculate new total price
        const newTotalPrice = newItems.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
        
        setCart({
          items: newItems,
          totalPrice: newTotalPrice
        });
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove item from cart');
      console.error('Error removing cart item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        // Clear server cart if logged in
        await cartService.clearCart();
      }
      
      // Always clear local cart state
      setCart({ items: [], totalPrice: 0 });
      
      if (!currentUser) {
        localStorage.removeItem('cart');
      }
      
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to clear cart');
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Merge local cart with server cart when user logs in
  const mergeWithServerCart = async () => {
    const localCart = JSON.parse(localStorage.getItem('cart'));
    
    if (!localCart || !localCart.items || localCart.items.length === 0) return;
    
    setLoading(true);
    
    try {
      for (const item of localCart.items) {
        await cartService.addToCart(
          item.product._id, 
          item.quantity, 
          item.customization
        );
      }
      
      localStorage.removeItem('cart');
      await fetchCart();
    } catch (error) {
      console.error('Error merging carts:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeWithServerCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
