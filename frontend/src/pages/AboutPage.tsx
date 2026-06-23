import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Sparkles, Leaf, Heart, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
	return (
		<div className="container-custom py-12">
			{/* Hero Section */}
			<section className="rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-elevated)] mb-16">
				<div className="bg-gradient-to-br from-[var(--color-bg-inverse)] via-[#1a1816] to-[#0f0e0c] text-[var(--color-text-inverse)] px-8 py-24 relative overflow-hidden">
					<div className="absolute inset-0 opacity-30">
						<div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 20% 50%, var(--color-gold-400) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, var(--color-gold-600) 0%, transparent 50%)'}} />
					</div>
					<div className="relative z-10 max-w-4xl">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 font-ui text-xs uppercase tracking-[0.14em] text-[var(--color-gold-400)] font-semibold mb-6">
							<Sparkles className="w-3.5 h-3.5" />
							Our Story
						</span>
						<h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
							About NovaCart
						</h1>
						<p className="text-lg md:text-xl text-[rgba(240,235,224,0.7)] leading-relaxed max-w-2xl">
							NovaCart is built to make online shopping simple, beautiful and fast. We curate quality products from trusted brands and combine them with thoughtful design and reliable delivery.
						</p>
						<div className="mt-10">
							<Link
								to={ROUTES.PRODUCTS}
								className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-400)] text-white font-ui text-sm font-bold uppercase tracking-[0.08em] rounded-[var(--radius-lg)] shadow-[var(--shadow-gold)] hover:shadow-xl transition-all active:scale-[0.97]"
							>
								Browse products
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				{/* Values Section */}
				<div className="bg-[var(--color-bg-surface)] p-8 md:p-12">
					<div className="grid gap-8 lg:grid-cols-3">
						<div className="bg-[var(--color-bg-raised)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all">
							<div className="w-12 h-12 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center mb-4">
								<Heart className="w-6 h-6 text-[var(--color-gold-500)]" />
							</div>
							<h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">Our mission</h3>
							<p className="font-ui text-sm text-[var(--color-text-secondary)] leading-relaxed">We aim to deliver a seamless shopping experience that delights customers and supports small brands around the world.</p>
						</div>
						<div className="bg-[var(--color-bg-raised)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all">
							<div className="w-12 h-12 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center mb-4">
								<Sparkles className="w-6 h-6 text-[var(--color-gold-500)]" />
							</div>
							<h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">Our values</h3>
							<ul className="font-ui text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
								<li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-400)]" />Customer-first design</li>
								<li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-400)]" />Transparency and trust</li>
								<li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold-400)]" />Quality over quantity</li>
							</ul>
						</div>
						<div className="bg-[var(--color-bg-raised)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all">
							<div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mb-4">
								<Leaf className="w-6 h-6 text-[var(--color-success-text)]" />
							</div>
							<h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-3">Sustainability</h3>
							<p className="font-ui text-sm text-[var(--color-text-secondary)] leading-relaxed">We partner with brands that minimize waste and prioritize responsible sourcing for a better future.</p>
						</div>
					</div>

					{/* Team Section */}
					<div className="mt-12 rounded-[var(--radius-2xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-muted)]/50 p-8 md:p-10">
						<h4 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2">Meet the team</h4>
						<p className="font-ui text-sm text-[var(--color-text-secondary)] mb-8 max-w-xl">A small, passionate team of designers, engineers, and merchandisers dedicated to building the best shopping experience.</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{['Alex', 'Maya', 'Jordan', 'Liam'].map((name, idx) => (
								<div key={name} className="flex flex-col items-center bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all">
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold-100)] to-[var(--color-gold-200)] flex items-center justify-center mb-3 shadow-sm">
										<span className="text-lg font-display font-bold text-[var(--color-gold-700)]">{name[0]}</span>
									</div>
									<div className="font-ui text-sm font-semibold text-[var(--color-text-primary)]">{name}</div>
									<div className="flex items-center gap-1 mt-1">
										<Users className="w-3 h-3 text-[var(--color-text-tertiary)]" />
										<span className="text-[11px] font-ui text-[var(--color-text-tertiary)]">Team</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
