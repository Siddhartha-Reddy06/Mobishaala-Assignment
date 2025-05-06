import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingBag, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await orderService.getUserOrders();
        
        if (response.success) {
          setOrders(response.orders);
        } else {
          setError('Failed to fetch orders. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser, navigate]);
  
  // Sample order data for development
  const sampleOrders = [
    {
      _id: 'ORD123456789',
      orderNumber: 'ORD123456789',
      createdAt: '2023-12-15T10:30:00Z',
      items: [
        { product: { name: 'Premium Business Cards' }, quantity: 2, price: 499 },
        { product: { name: 'Custom T-Shirt' }, quantity: 1, price: 799 }
      ],
      totalPrice: 1797,
      status: 'delivered',
      isPaid: true,
      paymentMethod: 'card'
    },
    {
      _id: 'ORD987654321',
      orderNumber: 'ORD987654321',
      createdAt: '2023-11-28T14:15:00Z',
      items: [
        { product: { name: 'Personalized Coffee Mug' }, quantity: 3, price: 349 },
        { product: { name: 'Photo Frame' }, quantity: 2, price: 599 }
      ],
      totalPrice: 2245,
      status: 'processing',
      isPaid: true,
      paymentMethod: 'upi'
    },
    {
      _id: 'ORD456789123',
      orderNumber: 'ORD456789123',
      createdAt: '2023-10-05T09:45:00Z',
      items: [
        { product: { name: 'Letterhead Design' }, quantity: 1, price: 999 }
      ],
      totalPrice: 999,
      status: 'cancelled',
      isPaid: false,
      paymentMethod: 'cod'
    },
    {
      _id: 'ORD789123456',
      orderNumber: 'ORD789123456',
      createdAt: '2023-11-10T16:20:00Z',
      items: [
        { product: { name: 'Custom Wall Calendar' }, quantity: 1, price: 649 },
        { product: { name: 'Greeting Cards Set' }, quantity: 2, price: 299 }
      ],
      totalPrice: 1247,
      status: 'shipped',
      isPaid: true,
      paymentMethod: 'card'
    }
  ];
  
  const displayOrders = orders.length > 0 ? orders : sampleOrders;
  
  // Filter orders
  const filteredOrders = displayOrders.filter(order => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Date filter
    let matchesDate = true;
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    
    if (dateFilter === 'last30days') {
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      matchesDate = orderDate >= thirtyDaysAgo;
    } else if (dateFilter === 'last3months') {
      const threeMonthsAgo = new Date(currentDate);
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      matchesDate = orderDate >= threeMonthsAgo;
    } else if (dateFilter === 'last6months') {
      const sixMonthsAgo = new Date(currentDate);
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
      matchesDate = orderDate >= sixMonthsAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sort === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sort === 'priceHighToLow') {
      return b.totalPrice - a.totalPrice;
    } else if (sort === 'priceLowToHigh') {
      return a.totalPrice - b.totalPrice;
    }
    return 0;
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setSort('newest');
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading your orders...</p>
      </LoadingContainer>
    );
  }
  
  return (
    <OrdersContainer>
      <OrdersHeader>
        <PageTitle>
          <FaShoppingBag /> My Orders
        </PageTitle>
        <OrderCount>{sortedOrders.length} order(s)</OrderCount>
      </OrdersHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {/* Search and Filter */}
      <SearchFilterSection>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search by order number or product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </SearchBar>
        
        <FilterToggle onClick={toggleFilter}>
          <FaFilter /> Filter
          <FaChevronDown style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </FilterToggle>
      </SearchFilterSection>
      
      {filterOpen && (
        <FilterPanel>
          <FilterGroup>
            <FilterLabel>Status:</FilterLabel>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Time Period:</FilterLabel>
            <FilterSelect
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
              <option value="last6months">Last 6 Months</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Sort By:</FilterLabel>
            <FilterSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Date (Newest First)</option>
              <option value="oldest">Date (Oldest First)</option>
              <option value="priceHighToLow">Price (High to Low)</option>
              <option value="priceLowToHigh">Price (Low to High)</option>
            </FilterSelect>
          </FilterGroup>
          
          <ResetButton onClick={resetFilters}>
            Reset Filters
          </ResetButton>
        </FilterPanel>
      )}
      
      {/* Orders List */}
      {sortedOrders.length > 0 ? (
        <OrdersList>
          {sortedOrders.map(order => (
            <OrderItem key={order._id}>
              <OrderHeader>
                <OrderInfo>
                  <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                  <OrderDate>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </OrderDate>
                </OrderInfo>
                <OrderStatusSection>
                  <OrderStatus status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </OrderStatus>
                  <PaymentStatus paid={order.isPaid}>
                    {order.isPaid ? 'Paid' : 'Payment Pending'}
                  </PaymentStatus>
                </OrderStatusSection>
              </OrderHeader>
              
              <OrderProducts>
                {order.items.map((item, index) => (
                  <OrderProductItem key={index}>
                    <ProductName>{item.product.name}</ProductName>
                    <ProductQuantityPrice>
                      {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                    </ProductQuantityPrice>
                  </OrderProductItem>
                ))}
              </OrderProducts>
              
              <OrderFooter>
                <OrderTotal>
                  <TotalLabel>Total:</TotalLabel>
                  <TotalValue>₹{order.totalPrice.toFixed(2)}</TotalValue>
                </OrderTotal>
                <ViewOrderButton to={`/orders/${order._id}`}>
                  View Order Details
                </ViewOrderButton>
              </OrderFooter>
            </OrderItem>
          ))}
        </OrdersList>
      ) : (
        <EmptyOrders>
          <EmptyIcon>
            <FaShoppingBag />
          </EmptyIcon>
          <EmptyTitle>No Orders Found</EmptyTitle>
          <EmptyMessage>
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' ? 
              'No orders match your search criteria. Try adjusting your filters.' : 
              "You haven't placed any orders yet."}
          </EmptyMessage>
          {!(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
            <ShopNowButton to="/products">
              Start Shopping
            </ShopNowButton>
          )}
        </EmptyOrders>
      )}
    </OrdersContainer>
  );
};

// Styled Components
const OrdersContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const OrdersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #F06292;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const OrderCount = styled.div`
  color: #666;
  font-size: 1rem;
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
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const SearchFilterSection = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #F06292;
    box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #F06292;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
`;

const FilterPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #F06292;
  }
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: #F06292;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 5px 0;
  align-self: flex-end;
  
  &:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    align-self: flex-start;
    margin-top: 5px;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderItem = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const OrderInfo = styled.div``;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const OrderDate = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const OrderStatusSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  
  @media (max-width: 576px) {
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 4px 10px;
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

const PaymentStatus = styled.div`
  font-size: 0.85rem;
  color: ${props => props.paid ? '#4CAF50' : '#FFC107'};
  font-weight: 500;
`;

const OrderProducts = styled.div`
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  margin-bottom: 20px;
`;

const OrderProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    margin-bottom: 15px;
  }
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #333;
`;

const ProductQuantityPrice = styled.div`
  color: #666;
  font-size: 0.95rem;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
`;

const OrderTotal = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TotalLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const TotalValue = styled.span`
  font-weight: 600;
  color: #F06292;
  font-size: 1.1rem;
`;

const ViewOrderButton = styled(Link)`
  background-color: #F06292;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
  
  @media (max-width: 576px) {
    width: 100%;
    text-align: center;
    padding: 10px;
  }
`;

const EmptyOrders = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 50px;
  color: #ddd;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;
`;

const EmptyMessage = styled.p`
  color: #666;
  margin-bottom: 25px;
  max-width: 400px;
`;

const ShopNowButton = styled(Link)`
  background-color: #F06292;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

export default OrdersPage;
