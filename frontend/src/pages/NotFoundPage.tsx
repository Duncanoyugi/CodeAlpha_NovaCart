import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui';
import { ROUTES } from '../utils/constants';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const NotFoundPage: React.FC = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700"><Compass className="h-10 w-10" /></div>
      <p className="mt-6 font-display text-7xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-2 text-2xl font-bold">We can’t find that page</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">The link may be broken or the page may have moved.</p>
      <div className="mt-8 flex gap-3"><Link to={ROUTES.HOME}><Button size="lg">Go home</Button></Link><Link to={ROUTES.PRODUCTS}><Button size="lg" variant="outline">Shop products</Button></Link></div>
    </main>
    <Footer />
  </div>
);

export default NotFoundPage;
