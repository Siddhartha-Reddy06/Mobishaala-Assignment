import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import productService from '../services/productService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const featuredResponse = await productService.getFeaturedProducts(8);
        setFeaturedProducts(featuredResponse.products);
        
        // Fetch categories
        const categoriesResponse = await productService.getProductCategories();
        setCategories(categoriesResponse.categories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Sample categories and banner data until backend is fully implemented
  const sampleCategories = [
    { id: 1, name: 'Business Cards', image: 'https://images.unsplash.com/photo-1572502742860-16c574c3ecaa?q=80&w=200' },
    { id: 2, name: 'Flyers & Brochures', image: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=200' },
    { id: 3, name: 'Posters', image: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=200' },
    { id: 4, name: 'Banners', image: 'https://images.unsplash.com/photo-1546198632-9ef6368bef12?q=80&w=200' },
    { id: 5, name: 'Stationery', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=200' },
    { id: 6, name: 'Promotional Items', image: 'https://images.unsplash.com/photo-1535572290543-960a8046f5af?q=80&w=200' }
  ];

  // Sample placeholder products if API doesn't return any
  const sampleProducts = [
    { 
      _id: '1', 
      name: 'Premium Business Cards', 
      price: 599, 
      discountPrice: 499,
      images: [{ url: 'https://images.unsplash.com/photo-1572502742860-16c574c3ecaa?q=80&w=400', alt: 'Business Cards' }],
      ratings: 4.5,
      numReviews: 24
    },
    { 
      _id: '2', 
      name: 'Glossy Flyers', 
      price: 999, 
      discountPrice: 799,
      images: [{ url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=400', alt: 'Flyers' }],
      ratings: 4.2,
      numReviews: 18
    },
    { 
      _id: '3', 
      name: 'Custom Banners', 
      price: 1499, 
      discountPrice: null,
      images: [{ url: 'https://images.unsplash.com/photo-1546198632-9ef6368bef12?q=80&w=400', alt: 'Banners' }],
      ratings: 4.8,
      numReviews: 32
    },
    { 
      _id: '4', 
      name: 'Company Letterheads', 
      price: 799, 
      discountPrice: 699,
      images: [{ url: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?q=80&w=400', alt: 'Letterheads' }],
      ratings: 4.0,
      numReviews: 12
    }
  ];

  const displayedCategories = categories.length > 0 ? categories.map((cat, index) => ({
    id: index + 1,
    name: cat,
    image: sampleCategories[index % sampleCategories.length].image
  })) : sampleCategories;

  const displayedProducts = featuredProducts.length > 0 ? featuredProducts : sampleProducts;

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading...</p>
      </LoadingContainer>
    );
  }

  return (
    <HomeContainer>
      {/* Hero Banner */}
      <HeroBanner>
        <HeroContent>
          <h1>Quality Printing for Your Business</h1>
          <p>Custom printing solutions to help your brand stand out</p>
          <HeroButton to="/products">Shop Now</HeroButton>
        </HeroContent>
      </HeroBanner>

      {/* Categories Section */}
      <Section>
        <SectionTitle>Shop by Category</SectionTitle>
        <CategoryGrid>
          {displayedCategories.map(category => (
            <CategoryCard key={category.id} to={`/products?category=${category.name}`}>
              <CategoryImage src={category.image} alt={category.name} />
              <CategoryName>{category.name}</CategoryName>
            </CategoryCard>
          ))}
        </CategoryGrid>
      </Section>

      {/* Featured Products */}
      <Section>
        <SectionTitle>Featured Products</SectionTitle>
        <ProductGrid>
          {displayedProducts.map(product => (
            <ProductCard key={product._id} to={`/products/${product._id}`}>
              <ProductImage 
                src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/300'} 
                alt={product.name} 
              />
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <PriceContainer>
                  {product.discountPrice ? (
                    <>
                      <DiscountPrice>₹{product.discountPrice}</DiscountPrice>
                      <OriginalPrice>₹{product.price}</OriginalPrice>
                    </>
                  ) : (
                    <ProductPrice>₹{product.price}</ProductPrice>
                  )}
                </PriceContainer>
                <RatingContainer>
                  <Rating>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} filled={i < Math.floor(product.ratings)}>★</Star>
                    ))}
                    {product.ratings % 1 >= 0.5 && <HalfStar>★</HalfStar>}
                  </Rating>
                  <ReviewCount>({product.numReviews})</ReviewCount>
                </RatingContainer>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
        <ViewAllButton to="/products">View All Products</ViewAllButton>
      </Section>

      {/* Special Offers */}
      <OfferBanner>
        <OfferContent>
          <h2>Special Offer</h2>
          <p>Get 20% off on all Business Cards</p>
          <OfferButton to="/products?category=Business Cards">Shop Now</OfferButton>
        </OfferContent>
      </OfferBanner>

      {/* Services */}
      <Section>
        <SectionTitle>Our Services</SectionTitle>
        <ServicesGrid>
          <ServiceCard>
            <ServiceIcon>🚚</ServiceIcon>
            <ServiceTitle>Fast Delivery</ServiceTitle>
            <ServiceDescription>Free shipping on orders above ₹1000</ServiceDescription>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>🔄</ServiceIcon>
            <ServiceTitle>Easy Returns</ServiceTitle>
            <ServiceDescription>30-day return policy for all products</ServiceDescription>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>🔒</ServiceIcon>
            <ServiceTitle>Secure Payments</ServiceTitle>
            <ServiceDescription>Multiple secure payment options</ServiceDescription>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>💬</ServiceIcon>
            <ServiceTitle>24/7 Support</ServiceTitle>
            <ServiceDescription>Get help whenever you need it</ServiceDescription>
          </ServiceCard>
        </ServicesGrid>
      </Section>
    </HomeContainer>
  );
};

// Styled Components
const HomeContainer = styled.div`
  max-width: 100%;
  overflow-x: hidden;
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

const HeroBanner = styled.div`
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=1080');
  background-size: cover;
  background-position: center;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  padding: 0 20px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const HeroButton = styled(Link)`
  display: inline-block;
  background-color: #F06292;
  color: white;
  padding: 12px 30px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
  color: #333;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: #F06292;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(Link)`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  aspect-ratio: 1 / 1;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${CategoryCard}:hover & {
    transform: scale(1.05);
  }
`;

const CategoryName = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: 600;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Link)`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: white;
  text-decoration: none;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 15px;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const ProductPrice = styled.span`
  font-weight: 600;
  color: #333;
`;

const DiscountPrice = styled.span`
  font-weight: 600;
  color: #F06292;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Rating = styled.div`
  color: #FFCA28;
  display: flex;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#FFCA28' : '#e0e0e0'};
`;

const HalfStar = styled.span`
  position: relative;
  color: #e0e0e0;
  
  &::before {
    content: '★';
    position: absolute;
    color: #FFCA28;
    width: 50%;
    overflow: hidden;
  }
`;

const ReviewCount = styled.span`
  color: #757575;
  font-size: 0.8rem;
  margin-left: 5px;
`;

const ViewAllButton = styled(Link)`
  display: block;
  width: fit-content;
  margin: 40px auto 0;
  padding: 10px 25px;
  background-color: transparent;
  color: #F06292;
  border: 2px solid #F06292;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #F06292;
    color: white;
  }
`;

const OfferBanner = styled.div`
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1565367298578-17a5daf7ca40?q=80&w=1080');
  background-size: cover;
  background-position: center;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  margin: 60px 0;
`;

const OfferContent = styled.div`
  max-width: 600px;
  padding: 0 20px;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 25px;
  }
`;

const OfferButton = styled(Link)`
  display: inline-block;
  background-color: #F06292;
  color: white;
  padding: 12px 30px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  padding: 30px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ServiceIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
`;

const ServiceTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
`;

const ServiceDescription = styled.p`
  color: #757575;
  font-size: 0.9rem;
`;

export default HomePage;
