import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../../../components/ui';
import { ROUTES } from '../../../utils/constants';

export const OrderCancelPage: React.FC = () => (
  <div className="container-page max-w-lg py-20 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600"><XCircle className="h-11 w-11" /></div>
    <h1 className="mt-6 text-3xl font-extrabold">Payment not completed</h1>
    <p className="mt-2 text-ink-500">No money was taken. Your order is still saved for a short while — you can finish paying from My orders.</p>
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link to={ROUTES.ORDERS}><Button size="lg">Go to my orders</Button></Link>
      <Link to={ROUTES.CART}><Button size="lg" variant="outline">Back to cart</Button></Link>
    </div>
  </div>
);

export default OrderCancelPage;
