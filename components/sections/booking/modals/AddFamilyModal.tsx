"use client";

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface AddFamilyModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddPatient: (patient: { name: string; relation: string; age: string; gender: string }) => void;
}

export function AddFamilyModal({ isOpen, setIsOpen, onAddPatient }: AddFamilyModalProps) {
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyAge, setNewFamilyAge] = useState('');
  const [newFamilyGender, setNewFamilyGender] = useState('Female');

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    
    onAddPatient({
      name: newFamilyName,
      relation: newFamilyRelation,
      age: newFamilyAge || '30',
      gender: newFamilyGender,
    });
    
    setIsOpen(false);
    setNewFamilyName(''); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className="max-w-sm sm:max-w-sm p-0 overflow-hidden">
        <form onSubmit={handleAddFamilyMember} className="flex flex-col max-h-[90vh]">
          <Dialog.Header className="p-6 pb-2">
            <Dialog.Title className="text-base">Add Family Patient Profile</Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body className="p-6 py-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <Input 
                type="text" 
                className="text-xs py-2 h-auto font-normal" 
                value={newFamilyName} 
                onChange={(e) => setNewFamilyName(e.target.value)} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Relationship</label>
                <Select 
                  className="text-xs py-2 h-auto font-normal"
                  value={newFamilyRelation}
                  onChange={(e) => setNewFamilyRelation(e.target.value)}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Child">Child</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Age</label>
                <Input 
                  type="text" 
                  className="text-xs py-2 h-auto font-normal" 
                  placeholder="e.g. 54"
                  value={newFamilyAge}
                  onChange={(e) => setNewFamilyAge(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Gender</label>
              <Select 
                className="text-xs py-2 h-auto font-normal"
                value={newFamilyGender}
                onChange={(e) => setNewFamilyGender(e.target.value)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </Select>
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
                Save Patient
              </Button>
            </div>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
