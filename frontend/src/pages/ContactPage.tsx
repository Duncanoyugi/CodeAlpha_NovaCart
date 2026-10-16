import React from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

const items = [
  { icon: Phone, t: 'Call us', d: '+254 795 946 288', href: 'tel:+254795946288' },
  { icon: MessageCircle, t: 'WhatsApp', d: 'Chat with support', href: 'https://wa.me/254795946288' },
  { icon: Mail, t: 'Email', d: 'support@novacart.co.ke', href: 'mailto:support@novacart.co.ke' },
  { icon: MapPin, t: 'Visit', d: 'Nairobi, Kenya', href: undefined },
];

export const ContactPage: React.FC = () => (
  <div className="container-page max-w-4xl py-12 sm:py-16">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Support</p>
    <h1 className="mt-1 text-4xl font-extrabold">We’re here to help</h1>
    <p className="mt-3 max-w-xl text-ink-500">Questions about an order, a product or a payment? Reach us any of these ways and quote your order number if you have one.</p>
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {items.map(({ icon: Icon, t, d, href }) => {
        const body = (<><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="h-6 w-6" /></span><span><span className="block font-bold">{t}</span><span className="text-sm text-ink-500">{d}</span></span></>);
        return href ? <a key={t} href={href} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:border-brand-200 hover:shadow-lift">{body}</a> : <div key={t} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">{body}</div>;
      })}
    </div>
    <p className="mt-8 flex items-center gap-2 text-sm text-ink-500"><Clock className="h-4 w-4" /> Monday–Saturday, 8am – 6pm (EAT)</p>
  </div>
);

export default ContactPage;
