import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaLock, FaShoppingBag, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { currentUser, updateUserProfile, logout, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state for user profile
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  
  // Initialize form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        state: currentUser.address?.state || '',
        postalCode: currentUser.address?.postalCode || '',
        country: currentUser.address?.country || 'India'
      });
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear messages when user types
    setError('');
    setSuccess('');
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    // Reset form data if canceling edit
    if (isEditing) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        state: currentUser.address?.state || '',
        postalCode: currentUser.address?.postalCode || '',
        country: currentUser.address?.country || 'India'
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.name) {
      setError('Name is required');
      return;
    }
    
    try {
      // Format the address data
      const updatedUserData = {
        name: profileData.name,
        phone: profileData.phone,
        address: {
          street: profileData.address,
          city: profileData.city,
          state: profileData.state,
          postalCode: profileData.postalCode,
          country: profileData.country
        }
      };
      
      // Update profile
      await updateUserProfile(updatedUserData);
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to logout. Please try again.');
    }
  };
  
  // Sample order data for UI display (would typically come from an API)
  const sampleOrders = [
    {
      _id: 'ORD123456789',
      createdAt: '2023-12-15T10:30:00Z',
      totalPrice: 2150.45,
      status: 'delivered',
      items: [
        { name: 'Premium Business Cards', quantity: 2 },
        { name: 'Custom T-Shirt', quantity: 1 }
      ]
    },
    {
      _id: 'ORD987654321',
      createdAt: '2023-11-28T14:15:00Z',
      totalPrice: 1299.99,
      status: 'processing',
      items: [
        { name: 'Personalized Coffee Mug', quantity: 3 },
        { name: 'Photo Frame', quantity: 2 }
      ]
    }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSection>
            <SectionHeader>
              <SectionTitle>Personal Information</SectionTitle>
              <EditButton onClick={toggleEditMode}>
                {isEditing ? 'Cancel' : <><FaEdit /> Edit</>}
              </EditButton>
            </SectionHeader>
            
            {(error || authError) && <ErrorMessage>{error || authError}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            {isEditing ? (
              <ProfileForm onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel>Full Name*</FormLabel>
                  <FormInput
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Email</FormLabel>
                  <FormInput
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                  />
                  <FieldHint>Email cannot be changed</FieldHint>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Phone Number</FormLabel>
                  <FormInput
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                  />
                </FormGroup>
                
                <FormGroupTitle>Address Information</FormGroupTitle>
                
                <FormGroup>
                  <FormLabel>Street Address</FormLabel>
                  <FormInput
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                  />
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <FormLabel>City</FormLabel>
                    <FormInput
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>State</FormLabel>
                    <FormInput
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <FormLabel>Postal Code</FormLabel>
                    <FormInput
                      type="text"
                      name="postalCode"
                      value={profileData.postalCode}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Country</FormLabel>
                    <FormSelect
                      name="country"
                      value={profileData.country}
                      onChange={handleChange}
                    >
                      <option value="India">India</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </FormSelect>
                  </FormGroup>
                </FormRow>
                
                <SaveButton type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </ProfileForm>
            ) : (
              <ProfileInfo>
                <InfoItem>
                  <InfoIcon><FaUser /></InfoIcon>
                  <InfoLabel>Name:</InfoLabel>
                  <InfoValue>{currentUser?.name || 'Not provided'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoIcon><FaEnvelope /></InfoIcon>
                  <InfoLabel>Email:</InfoLabel>
                  <InfoValue>{currentUser?.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoIcon><FaPhone /></InfoIcon>
                  <InfoLabel>Phone:</InfoLabel>
                  <InfoValue>{currentUser?.phone || 'Not provided'}</InfoValue>
                </InfoItem>
                
                <InfoDivider />
                
                <InfoItem>
                  <InfoIcon><FaMapMarkerAlt /></InfoIcon>
                  <InfoLabel>Address:</InfoLabel>
                  <InfoValue>
                    {currentUser?.address?.street ? (
                      <>
                        {currentUser.address.street}<br />
                        {currentUser.address.city}, {currentUser.address.state} {currentUser.address.postalCode}<br />
                        {currentUser.address.country}
                      </>
                    ) : (
                      'No address on file'
                    )}
                  </InfoValue>
                </InfoItem>
                
                <InfoActions>
                  <ActionLink to="/change-password">
                    <FaLock /> Change Password
                  </ActionLink>
                  <ActionButton onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </ActionButton>
                </InfoActions>
              </ProfileInfo>
            )}
          </ProfileSection>
        );
      
      case 'orders':
        return (
          <OrdersSection>
            <SectionHeader>
              <SectionTitle>Order History</SectionTitle>
            </SectionHeader>
            
            {sampleOrders.length > 0 ? (
              <OrdersList>
                {sampleOrders.map(order => (
                  <OrderItem key={order._id}>
                    <OrderHeader>
                      <OrderNumberDate>
                        <OrderNumber>Order #{order._id}</OrderNumber>
                        <OrderDate>
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </OrderDate>
                      </OrderNumberDate>
                      <OrderStatus status={order.status}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </OrderStatus>
                    </OrderHeader>
                    
                    <OrderSummary>
                      <OrderItems>
                        {order.items.map((item, index) => (
                          <OrderItemName key={index}>
                            {item.quantity}x {item.name}
                            {index < order.items.length - 1 ? ', ' : ''}
                          </OrderItemName>
                        ))}
                      </OrderItems>
                      <OrderTotal>₹{order.totalPrice.toFixed(2)}</OrderTotal>
                    </OrderSummary>
                    
                    <OrderActions>
                      <OrderLink to={`/orders/${order._id}`}>
                        View Order Details
                      </OrderLink>
                    </OrderActions>
                  </OrderItem>
                ))}
              </OrdersList>
            ) : (
              <EmptyState>
                <EmptyStateText>You haven't placed any orders yet.</EmptyStateText>
                <ShopNowButton to="/products">Shop Now</ShopNowButton>
              </EmptyState>
            )}
          </OrdersSection>
        );
      
      case 'wishlist':
        return (
          <WishlistSection>
            <SectionHeader>
              <SectionTitle>My Wishlist</SectionTitle>
            </SectionHeader>
            
            <EmptyState>
              <EmptyStateText>Your wishlist is empty.</EmptyStateText>
              <ShopNowButton to="/products">Add Items</ShopNowButton>
            </EmptyState>
          </WishlistSection>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <ProfileContainer>
      <ProfileSidebar>
        <UserInfo>
          <UserAvatar>
            {currentUser?.name?.charAt(0) || 'U'}
          </UserAvatar>
          <UserName>{currentUser?.name || 'User'}</UserName>
          <UserEmail>{currentUser?.email}</UserEmail>
        </UserInfo>
        
        <SidebarMenu>
          <MenuItem
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            <MenuIcon><FaUser /></MenuIcon>
            Profile
          </MenuItem>
          <MenuItem
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          >
            <MenuIcon><FaShoppingBag /></MenuIcon>
            Orders
          </MenuItem>
          <MenuItem
            active={activeTab === 'wishlist'}
            onClick={() => setActiveTab('wishlist')}
          >
            <MenuIcon><FaHeart /></MenuIcon>
            Wishlist
          </MenuItem>
          <MenuItemButton onClick={handleLogout}>
            <MenuIcon><FaSignOutAlt /></MenuIcon>
            Logout
          </MenuItemButton>
        </SidebarMenu>
      </ProfileSidebar>
      
      <ProfileContent>
        {renderTabContent()}
      </ProfileContent>
    </ProfileContainer>
  );
};

// Styled Components
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
`;

const UserInfo = styled.div`
  padding: 30px 20px;
  background-color: #F06292;
  color: white;
  text-align: center;
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  color: #F06292;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 15px;
`;

const UserName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const SidebarMenu = styled.div`
  padding: 20px 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: ${props => props.active ? '#F06292' : '#333'};
  background-color: ${props => props.active ? '#FDE7F0' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#FDE7F0' : '#f9f9f9'};
  }
`;

const MenuItemButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  cursor: pointer;
  color: #333;
  background-color: transparent;
  border: none;
  text-align: left;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const MenuIcon = styled.span`
  margin-right: 12px;
  font-size: 1.1rem;
  width: 20px;
`;

const ProfileContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  
  @media (max-width: 576px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const ProfileSection = styled.div``;

const OrdersSection = styled.div``;

const WishlistSection = styled.div``;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  color: #F06292;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background-color: #E8F5E9;
  color: #4CAF50;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
`;

const InfoIcon = styled.span`
  margin-right: 15px;
  color: #F06292;
  font-size: 1.1rem;
  width: 20px;
`;

const InfoLabel = styled.span`
  color: #666;
  width: 80px;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #333;
  flex: 1;
`;

const InfoDivider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
`;

const InfoActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
`;

const ActionLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
    color: #F06292;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
    color: #F06292;
  }
`;

const ProfileForm = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormGroupTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 30px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 15px;
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
  width: 100%;
  padding: 10px 15px;
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

const FieldHint = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
`;

const SaveButton = styled.button`
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  
  &:hover:not(:disabled) {
    background-color: #EC407A;
  }
  
  &:disabled {
    background-color: #f3a6c0;
    cursor: not-allowed;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrderItem = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const OrderNumberDate = styled.div``;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const OrderDate = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 5px 12px;
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

const OrderSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const OrderItems = styled.div`
  color: #333;
`;

const OrderItemName = styled.span`
  font-size: 0.95rem;
`;

const OrderTotal = styled.div`
  font-weight: 600;
  color: #F06292;
  font-size: 1.1rem;
`;

const OrderActions = styled.div`
  margin-top: 15px;
`;

const OrderLink = styled(Link)`
  color: #F06292;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyStateText = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const ShopNowButton = styled(Link)`
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

export default ProfilePage;
