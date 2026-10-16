import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { Logo } from './Header';

const perks = [
  { icon: Truck, title: 'Fast delivery', text: 'Nairobi same-day, countrywide in 2–4 days' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'M-Pesa STK push & encrypted card checkout' },
  { icon: RotateCcw, title: 'Easy returns', text: '7-day returns on unused items' },
  { icon: Headset, title: 'Real support', text: 'Friendly help, every day of the week' },
];

export const Footer: React.FC = () => (
  <footer className="mt-20 bg-brand-950 text-brand-100">
    <div className="border-b border-white/10">
      <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300"><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs leading-relaxed text-brand-200/80">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div>
        <Logo light />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200/80">
          Chargers, earbuds, power banks and smart gadgets you can trust — delivered to your door anywhere in Kenya.
        </p>
        <div className="mt-5 flex gap-2 text-[11px] font-bold">
          <span className="rounded-md bg-white px-2.5 py-1 text-brand-700">M-PESA</span>
          <span className="rounded-md bg-white px-2.5 py-1 text-[#1a1f71]">VISA</span>
          <span className="rounded-md bg-white px-2.5 py-1 text-[#eb001b]">Mastercard</span>
        </div>
      </div>

      <div>
        <p className="mb-4 text-sm font-bold text-white">Shop</p>
        <ul className="space-y-2.5 text-sm">
          <li><Link className="hover:text-white" to={ROUTES.PRODUCTS}>All products</Link></li>
          <li><Link className="hover:text-white" to={`${ROUTES.PRODUCTS}?new_arrival=true`}>New arrivals</Link></li>
          <li><Link className="hover:text-white" to={`${ROUTES.PRODUCTS}?best_seller=true`}>Best sellers</Link></li>
          <li><Link className="hover:text-white" to={`${ROUTES.PRODUCTS}?on_sale=true`}>Deals</Link></li>
        </ul>
      </div>

      <div>
        <p className="mb-4 text-sm font-bold text-white">Company</p>
        <ul className="space-y-2.5 text-sm">
          <li><Link className="hover:text-white" to={ROUTES.ABOUT}>About us</Link></li>
          <li><Link className="hover:text-white" to={ROUTES.CONTACT}>Contact</Link></li>
          <li><Link className="hover:text-white" to={ROUTES.ORDERS}>Track your order</Link></li>
          <li><Link className="hover:text-white" to={ROUTES.PROFILE}>My account</Link></li>
        </ul>
      </div>

      <div>
        <p className="mb-4 text-sm font-bold text-white">Get in touch</p>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" /> Nairobi, Kenya</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-accent-300" /> +254 700 000 000</li>
          <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-accent-300" /> support@novacart.co.ke</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-200/70 sm:flex-row">
        <p>© {new Date().getFullYear()} NovaCart. All rights reserved.</p>
        <p>Prices in Kenyan Shillings (KES), VAT inclusive.</p>
      </div>
    </div>
  </footer>
);
