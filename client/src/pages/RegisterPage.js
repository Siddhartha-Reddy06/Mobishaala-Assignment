import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, currentUser, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
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
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Attempt registration
      await register(formData.name, formData.email, formData.password, formData.phone);
      
      // If successful, the useEffect with currentUser dependency will handle redirection
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    }
  };
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>Create an Account</RegisterTitle>
          <RegisterSubtitle>Join PrintMine to access exclusive deals and offers</RegisterSubtitle>
        </RegisterHeader>
        
        {/* Display errors */}
        {(error || authError) && <ErrorMessage>{error || authError}</ErrorMessage>}
        
        <RegisterForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Full Name*</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaUser />
              </FormIcon>
              <FormInput
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Email*</FormLabel>
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
            <FormLabel>Phone Number (Optional)</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaPhone />
              </FormIcon>
              <FormInput
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Password*</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaLock />
              </FormIcon>
              <FormInput
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordToggle onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
            <PasswordHint>Password must be at least 6 characters long</PasswordHint>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Confirm Password*</FormLabel>
            <InputWrapper>
              <FormIcon>
                <FaLock />
              </FormIcon>
              <FormInput
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <PasswordToggle onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <TermsCheckbox>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <TermsLink to="/terms">Terms of Service</TermsLink> and <TermsLink to="/privacy">Privacy Policy</TermsLink>
            </label>
          </TermsCheckbox>
          
          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </RegisterForm>
        
        <OrDivider>
          <OrLine />
          <OrText>or</OrText>
          <OrLine />
        </OrDivider>
        
        <SocialLoginButtons>
          <SocialButton type="button">
            <FaGoogle /> Sign up with Google
          </SocialButton>
          <SocialButton type="button">
            <FaFacebook /> Sign up with Facebook
          </SocialButton>
        </SocialLoginButtons>
        
        <LoginPrompt>
          Already have an account? <LoginLink to="/login">Sign in</LoginLink>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

// Styled Components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  background-color: #f9f9f9;
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  
  @media (max-width: 576px) {
    padding: 30px 20px;
  }
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const RegisterTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
`;

const RegisterSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const RegisterForm = styled.form`
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

const PasswordHint = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  
  input {
    margin-right: 10px;
    margin-top: 4px;
  }
  
  label {
    font-size: 0.9rem;
    color: #666;
  }
`;

const TermsLink = styled(Link)`
  color: #F06292;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterButton = styled.button`
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

const LoginPrompt = styled.div`
  text-align: center;
  color: #666;
`;

const LoginLink = styled(Link)`
  color: #F06292;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default RegisterPage;
