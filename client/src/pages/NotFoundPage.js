import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <NotFoundContent>
        <IconWrapper>
          <FaExclamationTriangle />
        </IconWrapper>
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundMessage>Oops! Page Not Found</NotFoundMessage>
        <NotFoundDescription>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </NotFoundDescription>
        <BackHomeButton to="/">
          <FaHome /> Back to Homepage
        </BackHomeButton>
      </NotFoundContent>
    </NotFoundContainer>
  );
};

// Styled Components
const NotFoundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
`;

const NotFoundContent = styled.div`
  text-align: center;
  max-width: 500px;
`;

const IconWrapper = styled.div`
  font-size: 60px;
  color: #F06292;
  margin-bottom: 20px;
`;

const NotFoundTitle = styled.h1`
  font-size: 5rem;
  color: #F06292;
  margin: 0 0 10px;
`;

const NotFoundMessage = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin: 0 0 20px;
`;

const NotFoundDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const BackHomeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #F06292;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

export default NotFoundPage;
