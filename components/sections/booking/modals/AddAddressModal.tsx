"use client";

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface AddAddressModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddAddress: (address: { label: string; addressLine: string; city: string; pincode: string }) => void;
}

export function AddAddressModal({ isOpen, setIsOpen, onAddAddress }: AddAddressModalProps) {
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Madurai');
  const [newAddrPincode, setNewAddrPincode] = useState('625001');

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine.trim()) return;
    
    onAddAddress({
      label: newAddrLabel,
      addressLine: newAddrLine,
      city: newAddrCity,
      pincode: newAddrPincode,
    });
    
    setIsOpen(false);
    setNewAddrLine(''); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className="max-w-sm sm:max-w-sm p-0 overflow-hidden">
        <form onSubmit={handleAddNewAddress} className="flex flex-col max-h-[90vh]">
          <Dialog.Header className="p-6 pb-2">
            <Dialog.Title className="text-base">Add New Pickup Address</Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body className="p-6 py-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Address Label</label>
              <Select 
                className="text-xs py-2 h-auto font-normal"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Parents House">Parents House</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Street Address *</label>
              <Input 
                type="text" 
                className="text-xs py-2 h-auto font-normal" 
                placeholder="Door No., Street Name"
                value={newAddrLine} 
                onChange={(e) => setNewAddrLine(e.target.value)} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">City</label>
                <Input 
                  type="text" 
                  className="text-xs py-2 h-auto font-normal" 
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">PIN Code</label>
                <Input 
                  type="text" 
                  className="text-xs py-2 h-auto font-normal" 
                  value={newAddrPincode}
                  onChange={(e) => setNewAddrPincode(e.target.value)}
                />
              </div>
            </div>
          </Dialog.Body>

          <Dialog.Footer className="p-6 pt-4 border-t block sm:flex-none">
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="flex-1 text-xs font-bold">
                Save Address
              </Button>
            </div>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
