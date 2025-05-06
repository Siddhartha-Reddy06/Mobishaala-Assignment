import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>PrintMine</FooterTitle>
          <FooterText>
            Your one-stop shop for all custom printing needs. We offer high-quality printing services for businesses and individuals.
          </FooterText>
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </SocialLink>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialLink>
            <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <FooterLink>
              <Link to="/">Home</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/products">Products</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/about">About Us</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/contact">Contact</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Categories</FooterTitle>
          <FooterLinks>
            <FooterLink>
              <Link to="/products?category=Business Cards">Business Cards</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/products?category=Flyers">Flyers & Brochures</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/products?category=Banners">Banners & Signage</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/products?category=Stationery">Stationery</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/products?category=Promotional">Promotional Items</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contact Us</FooterTitle>
          <ContactInfo>
            <ContactItem>
              <FaMapMarkerAlt />
              <span>123 Print Street, Design District, Cityville</span>
            </ContactItem>
            <ContactItem>
              <FaPhone />
              <span>+91 98765 43210</span>
            </ContactItem>
            <ContactItem>
              <FaEnvelope />
              <span>info@printmine.in</span>
            </ContactItem>
          </ContactInfo>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <Copyright>
          &copy; {currentYear} PrintMine. All rights reserved.
        </Copyright>
        <FooterBottomLinks>
          <FooterBottomLink>
            <Link to="/privacy">Privacy Policy</Link>
          </FooterBottomLink>
          <FooterBottomLink>
            <Link to="/terms">Terms of Service</Link>
          </FooterBottomLink>
        </FooterBottomLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

// Styled Components
const FooterContainer = styled.footer`
  background-color: #262626;
  color: #f5f5f5;
  padding-top: 60px;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 200px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const FooterTitle = styled.h3`
  color: #f06292;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
`;

const FooterText = styled.p`
  line-height: 1.6;
  margin-bottom: 20px;
  color: #bdbdbd;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialLink = styled.a`
  color: #f5f5f5;
  font-size: 18px;
  transition: color 0.3s ease;
  
  &:hover {
    color: #f06292;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 10px;
  
  a {
    color: #bdbdbd;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: #f06292;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #bdbdbd;
  
  svg {
    color: #f06292;
    margin-top: 4px;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-top: 30px;
  border-top: 1px solid #424242;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Copyright = styled.p`
  color: #9e9e9e;
  margin: 0;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const FooterBottomLink = styled.div`
  a {
    color: #9e9e9e;
    text-decoration: none;
    
    &:hover {
      color: #f06292;
    }
  }
`;

export default Footer;
