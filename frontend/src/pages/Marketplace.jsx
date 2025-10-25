import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import SearchFilters from '../components/SearchFilters';
import SeasonalCalendar from '../components/SeasonalCalendar';

const Marketplace = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  const { addToCart, cart } = useCart();
  const { products, loading: productsLoading } = useProducts();

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'grains', label: 'Grains' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'others', label: 'Others' }
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseInt(filters.maxPrice));
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'freshness':
        // Assuming newer products are fresher (simplified)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [products, filters]);

  useEffect(() => {
    if (!productsLoading) {
      setLoading(false);
    }
  }, [productsLoading]);

  const ProductCard = ({ product }) => {
    const cartItem = cart.find(item => item._id === product._id);
    const inCartQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        addToCart(product, 1);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    };

    const handleCardClick = (e) => {
      if (e.target.closest('button') || e.target.tagName === 'BUTTON') {
        return;
      }
      window.location.href = `/product/${product._id}`;
    };

    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 hover:scale-105 cursor-pointer"
      >
        <img
          src={product.images?.[0]?.url || product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-green-600 mb-1">
            By {product.farmer?.farmName || product.farmer?.name || 'Local Farmer'}
          </p>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}/{product.unit}</span>
            <span className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              ⭐ {product.averageRating || '0'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Stock: {product.currentStock} {product.unit}</span>
            <span className={`px-2 py-1 rounded-full ${product.freshness === 'today' ? 'bg-green-100 text-green-800' :
              product.freshness === '1-day' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
              {product.freshness === 'today' ? 'Harvested Today' :
                product.freshness === '1-day' ? '1 Day Old' : '2+ Days Old'}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.currentStock === 0}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-200 ${product.currentStock === 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
          >
            {product.currentStock === 0 ? 'Out of Stock' : `Add to Cart (${inCartQuantity})`}
          </button>
        </div>
      </div>
    );
  }; // Fixed: Added closing brace for ProductCard

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <div className="text-xl text-gray-600">Loading fresh produce...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Local Marketplace</h1>
          <p className="text-gray-600">Fresh produce from farmers near you</p>
        </div>

        {/* Search & Filters */}
        <SearchFilters
          onFiltersChange={setFilters}
          categories={categories}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mb-8">
          <SeasonalCalendar />
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category || filters.minPrice || filters.maxPrice
                ? 'Try adjusting your filters'
                : 'No products available yet. Check back later!'}
            </p>
            {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  sortBy: 'newest'
                })}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;