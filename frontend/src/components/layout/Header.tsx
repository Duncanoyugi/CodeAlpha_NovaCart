import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search } from 'lucide-react';
import { useCart } from '../../features/cart';
import { ROUTES } from '../../utils/constants';

export const Header: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { totalItems, getCart } = useCart();

  useEffect(() => {
    getCart();
  }, [getCart]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="text-2xl font-bold text-primary-600">
            NovaCart
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                placeholder="Search products..."
                className="input-field pl-10"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            <Link to={ROUTES.WISHLIST} className="text-gray-600 hover:text-primary-600 transition">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to={ROUTES.CART} className="text-gray-600 hover:text-primary-600 transition relative">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <Link to={ROUTES.PROFILE} className="text-gray-600 hover:text-primary-600 transition">
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};