import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../services/authService';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [validating, setValidating] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const { password, confirmPassword } = formData;
  
  // Validate reset token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidating(true);
        await authService.validateResetToken(token);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
        setError('Invalid or expired password reset link. Please request a new one.');
      } finally {
        setValidating(false);
      }
    };
    
    validateToken();
  }, [token]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validatePassword = (password) => {
    // Password must be at least 8 characters with at least 1 letter and 1 number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include at least 1 letter and 1 number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (validating) {
    return (
      <PageContainer>
        <FormContainer>
          <LoadingMessage>Validating your reset link...</LoadingMessage>
        </FormContainer>
      </PageContainer>
    );
  }
  
  if (!isValid) {
    return (
      <PageContainer>
        <FormContainer>
          <ErrorCard>
            <ErrorTitle>Invalid Reset Link</ErrorTitle>
            <ErrorText>{error}</ErrorText>
            <ActionButton to="/forgot-password">Request New Link</ActionButton>
          </ErrorCard>
        </FormContainer>
      </PageContainer>
    );
  }
  
  if (success) {
    return (
      <PageContainer>
        <FormContainer>
          <SuccessContainer>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Password Reset Complete</SuccessTitle>
            <SuccessMessage>
              Your password has been successfully updated.
              You will be redirected to the login page shortly.
            </SuccessMessage>
            <ActionButton to="/login">Go to Login</ActionButton>
          </SuccessContainer>
        </FormContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <FormContainer>
        <PageTitle>Reset Your Password</PageTitle>
        <FormDescription>
          Please enter your new password below.
        </FormDescription>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <InputLabel htmlFor="password">New Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={handleChange}
                required
              />
              <PasswordToggle type="button" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
            <PasswordStrength>
              Password must be at least 8 characters and include letters and numbers
            </PasswordStrength>
          </FormGroup>
          
          <FormGroup>
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              <PasswordToggle type="button" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Updating Password...' : 'Reset Password'}
          </SubmitButton>
        </Form>
        
        <FormFooter>
          Remember your password? <FormLink to="/login">Login</FormLink>
        </FormFooter>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 30px 20px;
  background-color: #f8f9fa;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
`;

const FormDescription = styled.p`
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const Form = styled.form`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #F06292;
    box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.1);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #F06292;
  }
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #666;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
  
  &:disabled {
    background-color: #F8BBD0;
    cursor: not-allowed;
  }
`;

const FormFooter = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const FormLink = styled(Link)`
  color: #F06292;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 30px 0;
`;

const ErrorCard = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const ErrorTitle = styled.h2`
  color: #F44336;
  margin-bottom: 15px;
  font-size: 22px;
`;

const ErrorText = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 10px 0;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #E8F5E9;
  color: #4CAF50;
  font-size: 28px;
  border-radius: 50%;
  margin: 0 auto 20px;
`;

const SuccessTitle = styled.h2`
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
`;

const SuccessMessage = styled.p`
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  background-color: #F06292;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 10px;
  
  &:hover {
    background-color: #EC407A;
  }
`;

export default ResetPasswordPage;
