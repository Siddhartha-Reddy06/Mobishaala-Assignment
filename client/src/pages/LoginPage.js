import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, currentUser, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      // Redirect to home page or the page they were trying to access
      const redirect = location.state?.from || '/';
      navigate(redirect);
    }
    
    // Check if there's a message from another page (e.g., checkout redirect)
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
    }
  }, [currentUser, navigate, location]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    setError('');
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      // Attempt login
      await login(formData.email, formData.password);
      
      // If successful, the useEffect with currentUser dependency will handle redirection
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    }
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginTitle>Sign In</LoginTitle>
          <LoginSubtitle>Welcome back! Please enter your details</LoginSubtitle>
        </LoginHeader>
        
        {/* Display redirect message if any */}
        {redirectMessage && <RedirectMessage>{redirectMessage}</RedirectMessage>}
        
        {/* Display errors */}
        {(error || authError) && <ErrorMessage>{error || authError}</ErrorMessage>}
        
        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaEnvelope />
              </FormIcon>
              <FormInput
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaLock />
              </FormIcon>
              <FormInput
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordToggle onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <ForgotPasswordLink to="/forgot-password">
            Forgot password?
          </ForgotPasswordLink>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </LoginForm>
        
        <OrDivider>
          <OrLine />
          <OrText>or</OrText>
          <OrLine />
        </OrDivider>
        
        <SocialLoginButtons>
          <SocialButton type="button">
            <FaGoogle /> Continue with Google
          </SocialButton>
          <SocialButton type="button">
            <FaFacebook /> Continue with Facebook
          </SocialButton>
        </SocialLoginButtons>
        
        <SignupPrompt>
          Don't have an account? <SignupLink to="/register">Sign up</SignupLink>
        </SignupPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  background-color: #f9f9f9;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  
  @media (max-width: 576px) {
    padding: 30px 20px;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LoginTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
`;

const LoginSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
`;

const RedirectMessage = styled.div`
  background-color: #E8F5E9;
  color: #4CAF50;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const LoginForm = styled.form`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #999;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #F06292;
    box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.2);
  }
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 12px;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #666;
  }
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  color: #F06292;
  text-decoration: none;
  margin-bottom: 20px;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #EC407A;
  }
  
  &:disabled {
    background-color: #f3a6c0;
    cursor: not-allowed;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 25px 0;
`;

const OrLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #eee;
`;

const OrText = styled.span`
  color: #999;
  padding: 0 15px;
  font-size: 0.9rem;
`;

const SocialLoginButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  svg {
    font-size: 1.2rem;
  }
  
  &:first-child svg {
    color: #DB4437;
  }
  
  &:last-child svg {
    color: #4267B2;
  }
`;

const SignupPrompt = styled.div`
  text-align: center;
  color: #666;
`;

const SignupLink = styled(Link)`
  color: #F06292;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage;
