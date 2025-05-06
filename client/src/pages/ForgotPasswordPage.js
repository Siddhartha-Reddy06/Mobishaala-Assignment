import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <FormContainer>
        <BackLink to="/login">
          <FaArrowLeft /> Back to Login
        </BackLink>
        
        {!isSubmitted ? (
          <>
            <PageTitle>Forgot Password</PageTitle>
            <FormDescription>
              Enter your email address and we'll send you a link to reset your password.
            </FormDescription>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <InputLabel htmlFor="email">Email Address</InputLabel>
                <InputWrapper>
                  <InputIcon>
                    <FaEnvelope />
                  </InputIcon>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputWrapper>
              </FormGroup>
              
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Sending Reset Link...' : 'Reset Password'}
              </SubmitButton>
            </Form>
            
            <FormFooter>
              Remember your password? <FormLink to="/login">Login</FormLink>
            </FormFooter>
          </>
        ) : (
          <SuccessContainer>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Reset Link Sent</SuccessTitle>
            <SuccessMessage>
              A password reset link has been sent to <strong>{email}</strong>. 
              Please check your email and follow the instructions to reset your password.
            </SuccessMessage>
            <SuccessMessage>
              If you don't see the email in your inbox, please check your spam folder.
            </SuccessMessage>
            <BackToLoginButton to="/login">
              Back to Login
            </BackToLoginButton>
          </SuccessContainer>
        )}
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  margin-bottom: 20px;
  
  &:hover {
    color: #F06292;
  }
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

const BackToLoginButton = styled(Link)`
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #F06292;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: #EC407A;
  }
`;

export default ForgotPasswordPage;
