import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <HeaderContainer>
      <Container>
        <Logo>
          <Link to="/">PrintMine</Link>
        </Logo>

        <MobileMenuIcon onClick={toggleMobileMenu}>
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </MobileMenuIcon>

        <MainNav className={showMobileMenu ? 'show-mobile-menu' : ''}>
          <NavItems>
            <NavItem>
              <Link to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>
            </NavItem>
            <NavItem>
              <Link to="/products" onClick={() => setShowMobileMenu(false)}>Products</Link>
            </NavItem>
          </NavItems>

          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton type="submit">
              <FaSearch />
            </SearchButton>
          </SearchForm>

          <NavActions>
            <CartLink to="/cart" onClick={() => setShowMobileMenu(false)}>
              <FaShoppingCart />
              {cart.items.length > 0 && (
                <CartBadge>{cart.items.length}</CartBadge>
              )}
            </CartLink>

            {currentUser ? (
              <UserMenu>
                <UserButton>
                  <FaUser />
                  <span>{currentUser.name.split(' ')[0]}</span>
                </UserButton>
                <UserDropdown>
                  <UserDropdownItem>
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
                  </UserDropdownItem>
                  <UserDropdownItem>
                    <Link to="/orders" onClick={() => setShowMobileMenu(false)}>My Orders</Link>
                  </UserDropdownItem>
                  <UserDropdownItem>
                    <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                  </UserDropdownItem>
                </UserDropdown>
              </UserMenu>
            ) : (
              <AuthLinks>
                <Link to="/login" onClick={() => setShowMobileMenu(false)}>Login</Link>
                <Link to="/register" onClick={() => setShowMobileMenu(false)}>Register</Link>
              </AuthLinks>
            )}
          </NavActions>
        </MainNav>
      </Container>
    </HeaderContainer>
  );
};

// Styled Components
const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  position: relative;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  
  a {
    color: #F06292;
    text-decoration: none;
  }
`;

const MainNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-left: 40px;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: #fff;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-150%);
    transition: transform 0.3s ease;
    z-index: 1000;
    
    &.show-mobile-menu {
      transform: translateY(0);
    }
  }
`;

const NavItems = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const NavItem = styled.li`
  margin-right: 20px;
  
  a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      color: #F06292;
    }
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 15px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  margin: 0 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    margin: 15px 0;
  }
`;

const SearchInput = styled.input`
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  outline: none;
  
  &:focus {
    border-color: #F06292;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SearchButton = styled.button`
  background: #F06292;
  color: white;
  border: none;
  padding: 0 15px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  
  &:hover {
    background: #EC407A;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-top: 15px;
  }
`;

const CartLink = styled(Link)`
  position: relative;
  color: #333;
  margin-right: 20px;
  font-size: 20px;
  
  &:hover {
    color: #F06292;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #F06292;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
  
  &:hover > div {
    display: block;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    
    &:hover > div {
      position: static;
      box-shadow: none;
      margin-top: 10px;
    }
  }
`;

const UserButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    color: #F06292;
  }
`;

const UserDropdown = styled.div`
  display: none;
  position: absolute;
  right: 0;
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 180px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const UserDropdownItem = styled.div`
  padding: 10px 15px;
  
  a, button {
    text-decoration: none;
    color: #333;
    display: block;
    width: 100%;
    text-align: left;
    
    &:hover {
      color: #F06292;
    }
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  width: 100%;
  text-align: left;
`;

const AuthLinks = styled.div`
  display: flex;
  
  a {
    color: #333;
    text-decoration: none;
    margin-left: 15px;
    
    &:hover {
      color: #F06292;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    
    a {
      margin-left: 0;
      margin-bottom: 15px;
    }
  }
`;

const MobileMenuIcon = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export default Header;
