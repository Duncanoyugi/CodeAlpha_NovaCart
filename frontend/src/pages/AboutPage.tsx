import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, HeartHandshake, Smartphone, Truck } from 'lucide-react';
import { Button } from '../components/ui';
import { ROUTES } from '../utils/constants';

export const AboutPage: React.FC = () => (
  <div>
    <section className="bg-brand-900 py-16 text-white sm:py-24">
      <div className="container-page max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-300">About NovaCart</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">Everyday tech, made simple and trustworthy.</h1>
        <p className="mt-5 text-lg text-brand-100/85">We’re a Kenyan online store for chargers, audio, power banks and smart accessories — genuine products, fair prices and checkout that works the way Kenyans actually pay.</p>
      </div>
    </section>
    <section className="container-page grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { icon: BadgeCheck, t: 'Genuine products', d: 'We source from trusted suppliers and stand behind what we sell.' },
        { icon: Smartphone, t: 'M-Pesa first', d: 'Pay with an STK prompt in seconds — or use your card.' },
        { icon: Truck, t: 'Reliable delivery', d: 'Same-day in Nairobi and 2–4 days countrywide.' },
        { icon: HeartHandshake, t: 'Human support', d: 'Real people ready to help before and after you buy.' },
      ].map(({ icon: Icon, t, d }) => (
        <div key={t} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="h-6 w-6" /></span>
          <h2 className="mt-4 font-sans text-lg font-bold">{t}</h2><p className="mt-1 text-sm leading-relaxed text-ink-500">{d}</p>
        </div>
      ))}
    </section>
    <section className="container-page pb-16 text-center"><Link to={ROUTES.PRODUCTS}><Button size="lg">Start shopping</Button></Link></section>
  </div>
);

export default AboutPage;
