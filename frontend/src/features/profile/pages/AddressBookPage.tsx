import React from 'react';
import { AddressForm } from '../../../components/forms/AddressForm';

export const AddressBookPage: React.FC = () => {
  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">Address Book</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
          <AddressForm />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Saved Addresses</h2>
          <p className="text-gray-500">No saved addresses yet. Add your first address above.</p>
        </div>
      </div>
    </div>
  );
};