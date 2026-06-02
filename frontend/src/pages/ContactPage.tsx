import React, { useState } from 'react';

export const ContactPage: React.FC = () => {
	const [form, setForm] = useState({ name: '', email: '', message: '' });

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert('Thanks! We received your message.');
		setForm({ name: '', email: '', message: '' });
	};

	return (
		<div className="container-custom py-12">
			<div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
				<div className="grid gap-8 lg:grid-cols-2">
					<div>
						<h1 className="text-3xl font-bold">Get in touch</h1>
						<p className="mt-3 text-gray-600">Have questions, feedback or partnership inquiries? We’d love to hear from you.</p>

						<div className="mt-8 space-y-4">
							<div>
								<h4 className="text-sm font-semibold text-gray-700">Email</h4>
								<p className="text-gray-600">support@novacart.example</p>
							</div>
							<div>
								<h4 className="text-sm font-semibold text-gray-700">Phone</h4>
								<p className="text-gray-600">+1 (555) 123-4567</p>
							</div>
							<div>
								<h4 className="text-sm font-semibold text-gray-700">Address</h4>
								<p className="text-gray-600">123 Market Street, Cityville</p>
							</div>
						</div>
					</div>

					<div>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Name</label>
								<input name="name" value={form.name} onChange={handleChange} className="input-field mt-1 w-full" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Email</label>
								<input name="email" value={form.email} onChange={handleChange} className="input-field mt-1 w-full" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Message</label>
								<textarea name="message" value={form.message} onChange={handleChange} rows={6} className="textarea-field mt-1 w-full" />
							</div>
							<div>
								<button type="submit" className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700">Send message</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
