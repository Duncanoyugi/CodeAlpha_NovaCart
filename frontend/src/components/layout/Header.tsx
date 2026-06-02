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
    <header className="sticky top-0 z-50 bg-[#2b2350] shadow-md">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#ff902b]">NOVA</span>
            <span className="text-2xl font-extrabold text-white">CART</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                placeholder="Search products, brands and categories"
                className="w-full rounded-full py-3 pl-12 pr-4 bg-white text-gray-800 shadow-sm"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearch}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                onClick={() => query.trim() && navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#ff902b] text-white px-4 py-2 rounded-full font-semibold"
              >
                SEARCH
              </button>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6 text-white">
            <Link to={ROUTES.WISHLIST} className="hover:text-[#ff902b] transition">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to={ROUTES.CART} className="relative hover:text-[#ff902b] transition">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ff902b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <Link to={ROUTES.PROFILE} className="hover:text-[#ff902b] transition">
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};