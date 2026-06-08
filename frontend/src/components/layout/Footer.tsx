import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] border-t border-[var(--color-border-light)]">
      <div className="container-normal section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to={ROUTES.HOME} className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-[var(--color-text-inverse)]">
                Nova<span className="text-[var(--color-gold-400)]">Cart</span>
              </span>
            </Link>
            <p className="text-sm text-[rgba(240,235,224,0.6)] leading-relaxed max-w-xs">
              A curated marketplace for quality products. Editorial curation meets seamless commerce.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui text-xs uppercase tracking-[0.14em] text-[rgba(240,235,224,0.4)] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to={ROUTES.HOME} className="text-sm text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRODUCTS} className="text-sm text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ABOUT} className="text-sm text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="text-sm text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-ui text-xs uppercase tracking-[0.14em] text-[rgba(240,235,224,0.4)] mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-[rgba(240,235,224,0.75)]">Shipping & Returns</span>
              </li>
              <li>
                <span className="text-sm text-[rgba(240,235,224,0.75)]">FAQ</span>
              </li>
              <li>
                <span className="text-sm text-[rgba(240,235,224,0.75)]">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-[rgba(240,235,224,0.75)]">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-ui text-xs uppercase tracking-[0.14em] text-[rgba(240,235,224,0.4)] mb-4">
              Contact
            </h4>
            <p className="text-sm text-[rgba(240,235,224,0.75)] leading-relaxed">
              support@novacart.com<br />
              +1 (555) 000-0000
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[rgba(240,235,224,0.08)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[rgba(240,235,224,0.4)]">
            © {new Date().getFullYear()} NovaCart. All rights reserved.
          </p>
          <p className="text-xs text-[rgba(240,235,224,0.4)]">
            Crafted with care. Built for quality.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
