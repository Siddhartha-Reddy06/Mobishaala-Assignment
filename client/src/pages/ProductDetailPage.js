import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        setProduct(response.product);
        
        // Initialize customization options if product has any
        if (response.product.customizationOptions) {
          const initialCustomizations = {};
          response.product.customizationOptions.forEach(option => {
            if (option.options.length > 0) {
              initialCustomizations[option.name] = option.options[0];
            }
          });
          setCustomization(initialCustomizations);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Sample product data if API doesn't return anything
  const sampleProduct = {
    _id: id,
    name: 'Premium Business Cards',
    description: 'Make a lasting impression with our premium business cards. Printed on high-quality 350 GSM art paper with matte or glossy lamination options. Customizable with your own branding and design.',
    price: 599,
    discountPrice: 499,
    images: [
      { url: 'https://images.unsplash.com/photo-1572502742860-16c574c3ecaa?q=80&w=600', alt: 'Business Card Front' },
      { url: 'https://images.unsplash.com/photo-1589041127168-9b1915fd1d8d?q=80&w=600', alt: 'Business Card Back' },
      { url: 'https://images.unsplash.com/photo-1616628188540-925e94e78ea5?q=80&w=600', alt: 'Business Card Stack' }
    ],
    category: 'Business Cards',
    stock: 500,
    ratings: 4.5,
    numReviews: 24,
    reviews: [
      { user: { name: 'Rahul Sharma' }, rating: 5, comment: 'Excellent quality cards! The print is vibrant and clear.', createdAt: '2023-12-10T12:00:00Z' },
      { user: { name: 'Priya Patel' }, rating: 4, comment: 'Great cards, but delivery took longer than expected.', createdAt: '2023-11-25T15:30:00Z' }
    ],
    customizationOptions: [
      {
        name: 'Paper Type',
        options: ['Premium Matte', 'Glossy', 'Textured'],
        required: true
      },
      {
        name: 'Shape',
        options: ['Standard', 'Rounded Corners', 'Custom Die-Cut'],
        required: true
      },
      {
        name: 'Finish',
        options: ['None', 'Spot UV', 'Foil Stamping'],
        required: false
      }
    ],
    specifications: [
      { name: 'Size', value: '90 x 55 mm (Standard)' },
      { name: 'Paper Weight', value: '350 GSM Art Paper' },
      { name: 'Printing', value: 'CMYK, Full Color Both Sides' },
      { name: 'Minimum Order', value: '100 Cards' },
      { name: 'Packaging', value: 'Cardboard Box' }
    ]
  };

  const displayedProduct = product || sampleProduct;

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0 && newQuantity <= displayedProduct.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle customization option change
  const handleCustomizationChange = (optionName, value) => {
    setCustomization({
      ...customization,
      [optionName]: value
    });
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Check if all required customizations are selected
      const missingRequired = displayedProduct.customizationOptions?.find(
        option => option.required && !customization[option.name]
      );
      
      if (missingRequired) {
        setError(`Please select a ${missingRequired.name} option`);
        setAddingToCart(false);
        return;
      }
      
      // Add to cart
      const success = await addToCart(displayedProduct, quantity, customization);
      
      if (success) {
        setSuccessMessage('Product added to cart!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Could not add to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add to cart. Please try again later.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);
      
      // Check if all required customizations are selected
      const missingRequired = displayedProduct.customizationOptions?.find(
        option => option.required && !customization[option.name]
      );
      
      if (missingRequired) {
        setError(`Please select a ${missingRequired.name} option`);
        setAddingToCart(false);
        return;
      }
      
      // Add to cart then navigate to checkout
      const success = await addToCart(displayedProduct, quantity, customization);
      
      if (success) {
        navigate('/cart');
      } else {
        setError('Could not proceed to checkout. Please try again.');
      }
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      setError('Failed to proceed to checkout. Please try again later.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading product details...</p>
      </LoadingContainer>
    );
  }

  if (error && !displayedProduct) {
    return (
      <ErrorContainer>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton to="/products">Back to Products</BackButton>
      </ErrorContainer>
    );
  }

  return (
    <ProductDetailContainer>
      <BackLink to="/products">
        <FaArrowLeft /> Back to Products
      </BackLink>
      
      <ProductLayout>
        {/* Product Images */}
        <ProductImagesContainer>
          <MainImage 
            src={displayedProduct.images[selectedImage]?.url || 'https://via.placeholder.com/600'}
            alt={displayedProduct.images[selectedImage]?.alt || displayedProduct.name}
          />
          
          <ThumbnailContainer>
            {displayedProduct.images.map((image, index) => (
              <ThumbnailImage 
                key={index} 
                src={image.url} 
                alt={image.alt}
                active={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </ThumbnailContainer>
        </ProductImagesContainer>
        
        {/* Product Info */}
        <ProductInfo>
          <ProductName>{displayedProduct.name}</ProductName>
          
          <RatingContainer>
            {[...Array(5)].map((_, i) => {
              if (i < Math.floor(displayedProduct.ratings)) {
                return <FaStar key={i} color="#FFCA28" />;
              } else if (i === Math.floor(displayedProduct.ratings) && displayedProduct.ratings % 1 >= 0.5) {
                return <FaStarHalfAlt key={i} color="#FFCA28" />;
              } else {
                return <FaRegStar key={i} color="#FFCA28" />;
              }
            })}
            <ReviewCount>({displayedProduct.numReviews} reviews)</ReviewCount>
          </RatingContainer>
          
          <PriceContainer>
            {displayedProduct.discountPrice ? (
              <>
                <DiscountPrice>₹{displayedProduct.discountPrice}</DiscountPrice>
                <OriginalPrice>₹{displayedProduct.price}</OriginalPrice>
                <DiscountPercentage>
                  {Math.round((1 - displayedProduct.discountPrice / displayedProduct.price) * 100)}% OFF
                </DiscountPercentage>
              </>
            ) : (
              <ProductPrice>₹{displayedProduct.price}</ProductPrice>
            )}
          </PriceContainer>
          
          <StockInfo inStock={displayedProduct.stock > 0}>
            {displayedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </StockInfo>
          
          <Divider />
          
          <ProductDescription>{displayedProduct.description}</ProductDescription>
          
          <Divider />
          
          {/* Customization Options */}
          {displayedProduct.customizationOptions?.length > 0 && (
            <CustomizationSection>
              <SectionTitle>Customization Options</SectionTitle>
              
              {displayedProduct.customizationOptions.map((option, index) => (
                <CustomizationOption key={index}>
                  <OptionLabel>
                    {option.name} {option.required && <RequiredMark>*</RequiredMark>}:
                  </OptionLabel>
                  <OptionButtons>
                    {option.options.map((value, i) => (
                      <OptionButton 
                        key={i}
                        selected={customization[option.name] === value}
                        onClick={() => handleCustomizationChange(option.name, value)}
                      >
                        {value}
                      </OptionButton>
                    ))}
                  </OptionButtons>
                </CustomizationOption>
              ))}
            </CustomizationSection>
          )}
          
          {/* Quantity Selector */}
          <QuantityContainer>
            <QuantityLabel>Quantity:</QuantityLabel>
            <QuantityControls>
              <QuantityButton 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </QuantityButton>
              <QuantityInput 
                type="number" 
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={displayedProduct.stock}
              />
              <QuantityButton 
                onClick={() => quantity < displayedProduct.stock && setQuantity(quantity + 1)}
                disabled={quantity >= displayedProduct.stock}
              >
                +
              </QuantityButton>
            </QuantityControls>
          </QuantityContainer>
          
          {/* Action Buttons */}
          <ActionButtons>
            <AddToCartButton 
              onClick={handleAddToCart}
              disabled={addingToCart || displayedProduct.stock <= 0}
            >
              <FaShoppingCart /> Add to Cart
            </AddToCartButton>
            <BuyNowButton 
              onClick={handleBuyNow}
              disabled={addingToCart || displayedProduct.stock <= 0}
            >
              Buy Now
            </BuyNowButton>
          </ActionButtons>
          
          {/* Messages */}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ProductInfo>
      </ProductLayout>
      
      <Divider />
      
      {/* Product Specifications */}
      {displayedProduct.specifications?.length > 0 && (
        <SpecificationsSection>
          <SectionTitle>Specifications</SectionTitle>
          <SpecificationsList>
            {displayedProduct.specifications.map((spec, index) => (
              <SpecificationItem key={index}>
                <SpecName>{spec.name}</SpecName>
                <SpecValue>{spec.value}</SpecValue>
              </SpecificationItem>
            ))}
          </SpecificationsList>
        </SpecificationsSection>
      )}
      
      <Divider />
      
      {/* Reviews Section */}
      <ReviewsSection>
        <SectionTitle>Customer Reviews</SectionTitle>
        
        {displayedProduct.reviews?.length > 0 ? (
          <>
            <ReviewsList>
              {displayedProduct.reviews.map((review, index) => (
                <ReviewItem key={index}>
                  <ReviewHeader>
                    <ReviewerName>{review.user.name}</ReviewerName>
                    <ReviewRating>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} filled={i < review.rating}>★</Star>
                      ))}
                    </ReviewRating>
                    <ReviewDate>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </ReviewDate>
                  </ReviewHeader>
                  <ReviewComment>{review.comment}</ReviewComment>
                </ReviewItem>
              ))}
            </ReviewsList>
            
            <ViewAllReviewsButton>View All Reviews</ViewAllReviewsButton>
          </>
        ) : (
          <NoReviewsMessage>No reviews yet. Be the first to review this product!</NoReviewsMessage>
        )}
        
        {currentUser ? (
          <AddReviewButton>Write a Review</AddReviewButton>
        ) : (
          <LoginToReviewMessage>
            <Link to="/login">Log in</Link> to write a review
          </LoginToReviewMessage>
        )}
      </ReviewsSection>
      
      {/* Similar Products Section */}
      <SimilarProductsSection>
        <SectionTitle>You May Also Like</SectionTitle>
        {/* This would typically show products from the same category */}
        <p>Coming Soon</p>
      </SimilarProductsSection>
    </ProductDetailContainer>
  );
};

// Styled Components
const ProductDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

const ErrorContainer = styled.div`
  text-align: center;
  margin: 50px auto;
  max-width: 600px;
  
  h2 {
    color: #d32f2f;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 30px;
    color: #666;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  margin-bottom: 30px;
  font-weight: 500;
  
  &:hover {
    color: #F06292;
  }
`;

const BackButton = styled(Link)`
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

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductImagesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  
  @media (max-width: 576px) {
    height: 300px;
  }
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;

const ThumbnailImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.6};
  border: ${props => props.active ? '2px solid #F06292' : '2px solid transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h1`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.8rem;
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
`;

const ReviewCount = styled.span`
  color: #757575;
  margin-left: 5px;
  font-size: 0.9rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const ProductPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const DiscountPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #F06292;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 1.1rem;
`;

const DiscountPercentage = styled.span`
  background-color: #F06292;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StockInfo = styled.div`
  color: ${props => props.inStock ? '#4CAF50' : '#F44336'};
  font-weight: 600;
  margin-bottom: 15px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
`;

const ProductDescription = styled.p`
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const CustomizationSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
`;

const CustomizationOption = styled.div`
  margin-bottom: 15px;
`;

const OptionLabel = styled.div`
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #F44336;
`;

const OptionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const OptionButton = styled.button`
  padding: 8px 15px;
  border: 1px solid ${props => props.selected ? '#F06292' : '#ddd'};
  background-color: ${props => props.selected ? '#FDE7F0' : 'white'};
  color: ${props => props.selected ? '#F06292' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #F06292;
  }
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const QuantityLabel = styled.span`
  margin-right: 15px;
  font-weight: 500;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #f9f9f9;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  height: 36px;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 1rem;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const AddToCartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background-color: white;
  color: #F06292;
  border: 2px solid #F06292;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #FDE7F0;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    border-color: #ddd;
    cursor: not-allowed;
  }
`;

const BuyNowButton = styled.button`
  padding: 12px 20px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #EC407A;
  }
  
  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #E8F5E9;
  color: #4CAF50;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 15px;
`;

const ErrorMessage = styled.div`
  background-color: #FFEBEE;
  color: #F44336;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 15px;
`;

const SpecificationsSection = styled.div`
  margin: 30px 0;
`;

const SpecificationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const SpecificationItem = styled.div`
  display: flex;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
`;

const SpecName = styled.div`
  background-color: #f0f0f0;
  padding: 10px 15px;
  flex: 0 0 40%;
  font-weight: 500;
`;

const SpecValue = styled.div`
  padding: 10px 15px;
  flex: 1;
`;

const ReviewsSection = styled.div`
  margin: 30px 0;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const ReviewItem = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  color: #333;
`;

const ReviewRating = styled.div`
  display: flex;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#FFCA28' : '#e0e0e0'};
`;

const ReviewDate = styled.span`
  color: #999;
  font-size: 0.9rem;
`;

const ReviewComment = styled.p`
  color: #555;
  line-height: 1.6;
`;

const ViewAllReviewsButton = styled.button`
  background: none;
  border: none;
  color: #F06292;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AddReviewButton = styled.button`
  padding: 10px 20px;
  background-color: #F06292;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #EC407A;
  }
`;

const NoReviewsMessage = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const LoginToReviewMessage = styled.p`
  color: #666;
  
  a {
    color: #F06292;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SimilarProductsSection = styled.div`
  margin: 30px 0;
`;

export default ProductDetailPage;
