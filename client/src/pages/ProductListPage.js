import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaFilter, FaTimes, FaSort, FaSearch } from 'react-icons/fa';
import productService from '../services/productService';

const ProductListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for products and filters
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    keyword: queryParams.get('keyword') || '',
    category: queryParams.get('category') || '',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    sort: queryParams.get('sort') || 'newest',
    page: parseInt(queryParams.get('page') || '1', 10)
  });
  
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Update URL with current filters
        const params = new URLSearchParams();
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page > 1) params.append('page', filters.page.toString());
        
        navigate(`/products?${params.toString()}`, { replace: true });
        
        // Fetch products based on filters
        const response = await productService.getProducts(filters);
        setProducts(response.products);
        setTotalPages(response.totalPages || 1);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters, navigate]);
  
  // Fetch categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getProductCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Sample placeholder products if API doesn't return any
  const sampleProducts = [
    { 
      _id: '1', 
      name: 'Premium Business Cards', 
      price: 599, 
      discountPrice: 499,
      images: [{ url: 'https://images.unsplash.com/photo-1572502742860-16c574c3ecaa?q=80&w=400', alt: 'Business Cards' }],
      category: 'Business Cards',
      ratings: 4.5,
      numReviews: 24
    },
    { 
      _id: '2', 
      name: 'Glossy Flyers', 
      price: 999, 
      discountPrice: 799,
      images: [{ url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=400', alt: 'Flyers' }],
      category: 'Flyers',
      ratings: 4.2,
      numReviews: 18
    },
    { 
      _id: '3', 
      name: 'Custom Banners', 
      price: 1499, 
      discountPrice: null,
      images: [{ url: 'https://images.unsplash.com/photo-1546198632-9ef6368bef12?q=80&w=400', alt: 'Banners' }],
      category: 'Banners',
      ratings: 4.8,
      numReviews: 32
    },
    { 
      _id: '4', 
      name: 'Company Letterheads', 
      price: 799, 
      discountPrice: 699,
      images: [{ url: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?q=80&w=400', alt: 'Letterheads' }],
      category: 'Stationery',
      ratings: 4.0,
      numReviews: 12
    },
    { 
      _id: '5', 
      name: 'Custom Mugs', 
      price: 349, 
      discountPrice: 299,
      images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400', alt: 'Mugs' }],
      category: 'Promotional Items',
      ratings: 4.6,
      numReviews: 42
    },
    { 
      _id: '6', 
      name: 'T-shirt Printing', 
      price: 499, 
      discountPrice: null,
      images: [{ url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=400', alt: 'T-shirts' }],
      category: 'Apparel',
      ratings: 4.3,
      numReviews: 27
    }
  ];

  // Sample categories if API doesn't return any
  const sampleCategories = [
    'Business Cards',
    'Flyers & Brochures',
    'Posters',
    'Banners',
    'Stationery',
    'Promotional Items',
    'Apparel'
  ];

  const displayedProducts = products.length > 0 ? products : sampleProducts;
  const displayedCategories = categories.length > 0 ? categories : sampleCategories;

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      page: 1 // Reset to first page on new search
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page on filter change
    });
  };

  // Handle price filter
  const handlePriceFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page on filter change
    });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setFilters({
      ...filters,
      sort: e.target.value
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
    
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1
    });
  };

  // Toggle mobile filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading && products.length === 0) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading products...</p>
      </LoadingContainer>
    );
  }

  return (
    <ProductListContainer>
      <PageTitle>
        {filters.category ? filters.category : filters.keyword ? `Search: ${filters.keyword}` : 'All Products'}
      </PageTitle>
      
      <ProductListContent>
        {/* Mobile Filter Toggle */}
        <MobileFilterToggle onClick={toggleFilters}>
          <FaFilter /> Filters
        </MobileFilterToggle>
        
        {/* Filters Sidebar */}
        <FiltersSidebar className={showFilters ? 'show' : ''}>
          <FilterHeader>
            <h3>Filters</h3>
            <CloseFiltersButton onClick={toggleFilters}>
              <FaTimes />
            </CloseFiltersButton>
          </FilterHeader>
          
          <FilterSection>
            <FilterTitle>Categories</FilterTitle>
            <CategoryList>
              <CategoryItem>
                <input
                  type="radio"
                  id="all-categories"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={handleFilterChange}
                />
                <label htmlFor="all-categories">All Categories</label>
              </CategoryItem>
              
              {displayedCategories.map((category, index) => (
                <CategoryItem key={index}>
                  <input
                    type="radio"
                    id={`category-${index}`}
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={handleFilterChange}
                  />
                  <label htmlFor={`category-${index}`}>{category}</label>
                </CategoryItem>
              ))}
            </CategoryList>
          </FilterSection>
          
          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            <PriceInputs>
              <PriceInput
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handlePriceFilterChange}
                min="0"
              />
              <span>to</span>
              <PriceInput
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handlePriceFilterChange}
                min="0"
              />
            </PriceInputs>
          </FilterSection>
          
          <ClearFiltersButton onClick={clearFilters}>
            Clear All Filters
          </ClearFiltersButton>
        </FiltersSidebar>
        
        {/* Products Section */}
        <ProductsSection>
          {/* Products Header */}
          <ProductsHeader>
            <SearchForm onSubmit={handleSearchSubmit}>
              <SearchInput
                type="text"
                name="keyword"
                placeholder="Search products..."
                value={filters.keyword}
                onChange={handleFilterChange}
              />
              <SearchButton type="submit">
                <FaSearch />
              </SearchButton>
            </SearchForm>
            
            <SortContainer>
              <SortLabel>
                <FaSort /> Sort by:
              </SortLabel>
              <SortSelect
                name="sort"
                value={filters.sort}
                onChange={handleSortChange}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </SortSelect>
            </SortContainer>
          </ProductsHeader>
          
          {/* Products Grid */}
          {displayedProducts.length > 0 ? (
            <>
              <ProductGrid>
                {displayedProducts.map(product => (
                  <ProductCard key={product._id} to={`/products/${product._id}`}>
                    <ProductImage 
                      src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/300'} 
                      alt={product.name} 
                    />
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductCategory>{product.category}</ProductCategory>
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
              
              {/* Pagination */}
              <Pagination>
                <PaginationButton 
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Previous
                </PaginationButton>
                
                <PageInfo>
                  Page {filters.page} of {totalPages}
                </PageInfo>
                
                <PaginationButton 
                  disabled={filters.page === totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                </PaginationButton>
              </Pagination>
            </>
          ) : (
            <NoProductsMessage>
              <p>No products found matching your criteria.</p>
              <ClearFiltersButton onClick={clearFilters}>
                Clear All Filters
              </ClearFiltersButton>
            </NoProductsMessage>
          )}
        </ProductsSection>
      </ProductListContent>
    </ProductListContainer>
  );
};

// Styled Components
const ProductListContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProductListContent = styled.div`
  display: flex;
  gap: 30px;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
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

const MobileFilterToggle = styled.button`
  display: none;
  background: #F06292;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
  font-weight: 600;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const FiltersSidebar = styled.div`
  flex: 0 0 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    width: 280px;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.show {
      transform: translateX(0);
    }
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const CloseFiltersButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const FilterTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1rem;
  color: #333;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  label {
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  input {
    cursor: pointer;
  }
`;

const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #666;
  }
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #F06292;
  }
`;

const ClearFiltersButton = styled.button`
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  width: 100%;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const SearchForm = styled.form`
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  flex: 1;
  max-width: 300px;
  
  @media (max-width: 576px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  
  &:focus {
    outline: none;
    border-color: #F06292;
  }
`;

const SearchButton = styled.button`
  background: #F06292;
  color: white;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  
  &:hover {
    background: #EC407A;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SortLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const SortSelect = styled.select`
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #F06292;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.a`
  display: block;
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
  margin-bottom: 5px;
`;

const ProductCategory = styled.p`
  font-size: 0.8rem;
  color: #757575;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 20px;
`;

const PaginationButton = styled.button`
  background: ${props => props.disabled ? '#f5f5f5' : '#F06292'};
  color: ${props => props.disabled ? '#999' : 'white'};
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  
  &:hover:not(:disabled) {
    background: #EC407A;
  }
`;

const PageInfo = styled.div`
  color: #666;
`;

const NoProductsMessage = styled.div`
  text-align: center;
  margin: 50px 0;
  
  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 20px;
  }
  
  button {
    display: inline-block;
  }
`;

export default ProductListPage;
