import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';

const inputClasses =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] transition-all';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container-custom py-12">
      <div className="mb-10 text-center">
        <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
          Get in touch
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">Contact Us</h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)] mt-3 max-w-lg mx-auto">
          Have questions, feedback or partnership inquiries? We'd love to hear from you.
        </p>
      </div>

      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="bg-[var(--color-bg-inverse)] px-8 py-12 text-[var(--color-text-inverse)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 30%, var(--color-accent) 0%, transparent 60%)' }}
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl mb-6">Let's start a conversation</h2>
              <p className="text-[rgba(240,235,224,0.7)] font-body text-sm leading-relaxed mb-10">
                We're here to help and answer any questions you might have. We look forward to hearing from you.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-[0.16em] text-[rgba(240,235,224,0.5)] font-semibold">
                      Email
                    </p>
                    <p className="font-body text-sm text-[rgba(240,235,224,0.9)] mt-0.5">support@novacart.example</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-[0.16em] text-[rgba(240,235,224,0.5)] font-semibold">
                      Phone
                    </p>
                    <p className="font-body text-sm text-[rgba(240,235,224,0.9)] mt-0.5">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-[0.16em] text-[rgba(240,235,224,0.5)] font-semibold">
                      Address
                    </p>
                    <p className="font-body text-sm text-[rgba(240,235,224,0.9)] mt-0.5">123 Market Street, Cityville</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-body uppercase tracking-[0.16em] text-[rgba(240,235,224,0.5)] font-semibold">
                      Business Hours
                    </p>
                    <p className="font-body text-sm text-[rgba(240,235,224,0.9)] mt-0.5">Mon–Fri, 9am–6pm EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 md:p-10">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-7 h-7 text-[var(--color-success-text)]" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl text-[var(--color-text-primary)] mb-2">Message sent</h3>
                <p className="font-body text-sm text-[var(--color-text-secondary)] max-w-xs mb-6">
                  Thanks for reaching out. Our team will get back to you within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="font-body text-sm font-semibold text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] mb-2.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] mb-2.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] mb-2.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="How can we help you?"
                    required
                    className={`${inputClasses} resize-y`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-body text-sm font-bold uppercase tracking-[0.08em] hover:brightness-110 active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;