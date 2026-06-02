import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export const AboutPage: React.FC = () => {
	return (
		<div className="container-custom py-12">
			<section className="rounded-3xl overflow-hidden shadow-lg">
				<div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white px-8 py-20">
					<div className="max-w-4xl">
						<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">About NovaCart</h1>
						<p className="mt-4 text-lg text-white/90 leading-relaxed">
							NovaCart is built to make online shopping simple, beautiful and fast. We curate quality products from trusted
							brands and combine them with thoughtful design and reliable delivery.
						</p>
						<div className="mt-8">
							<Link to={ROUTES.PRODUCTS} className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow">
								Browse products
							</Link>
						</div>
					</div>
				</div>

				<div className="bg-white p-8">
					<div className="grid gap-8 lg:grid-cols-3">
						<div>
							<h3 className="text-xl font-semibold">Our mission</h3>
							<p className="mt-3 text-gray-600">We aim to deliver a seamless shopping experience that delights customers and supports small brands.</p>
						</div>
						<div>
							<h3 className="text-xl font-semibold">Our values</h3>
							<ul className="mt-3 space-y-2 text-gray-600">
								<li>Customer-first design</li>
								<li>Transparency and trust</li>
								<li>Quality over quantity</li>
							</ul>
						</div>
						<div>
							<h3 className="text-xl font-semibold">Sustainability</h3>
							<p className="mt-3 text-gray-600">We partner with brands that minimize waste and prioritize responsible sourcing.</p>
						</div>
					</div>

					<div className="mt-10 rounded-2xl border border-gray-100 bg-slate-50 p-6">
						<h4 className="text-lg font-semibold">Meet the team</h4>
						<p className="mt-3 text-gray-600">A small, passionate team of designers, engineers, and merchandisers dedicated to building NovaCart.</p>
						<div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
							{['Alex', 'Maya', 'Jordan', 'Liam'].map((name) => (
								<div key={name} className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm">
									<div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">{name[0]}</div>
									<div className="mt-2 text-sm font-medium">{name}</div>
									<div className="text-xs text-gray-400">Team</div>
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
