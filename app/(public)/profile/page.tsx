"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { Container, Card, Button } from '@/components/ui';
import { PatientProfileItem } from '@/domains/auth/model';

export default function ProfilePage() {
  const { user, updateProfile, addPatient, editPatient, removePatient } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', email: '', dobOrAge: '', gender: '' });
  
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [familyData, setFamilyData] = useState({ name: '', relation: '', age: '', gender: 'Male' });

  if (!user) return null;

  const handleEditInit = () => {
    setEditData({
      fullName: user.fullName || '',
      email: user.email || '',
      dobOrAge: user.dobOrAge || '',
      gender: user.gender || 'Male'
    });
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    await updateProfile({
      ...editData,
      gender: editData.gender as 'Male' | 'Female' | 'Other'
    });
    setIsEditing(false);
  };

  const handleAddFamily = async () => {
    if (familyData.name && familyData.relation && familyData.age) {
      if (editingFamilyId) {
        await editPatient(editingFamilyId, familyData);
      } else {
        await addPatient(familyData);
      }
      setShowAddFamily(false);
      setEditingFamilyId(null);
      setFamilyData({ name: '', relation: '', age: '', gender: 'Male' });
    }
  };

  const initEditFamily = (patient: PatientProfileItem) => {
    setFamilyData({
      name: patient.name,
      relation: patient.relation,
      age: patient.age,
      gender: patient.gender
    });
    setEditingFamilyId(patient.id);
    setShowAddFamily(true);
  };

  const handleCancelFamily = () => {
    setShowAddFamily(false);
    setEditingFamilyId(null);
    setFamilyData({ name: '', relation: '', age: '', gender: 'Male' });
  };

  return (
    <AuthGuard>
      <div className="bg-bg-alt py-12 min-h-screen">
        <Container className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account and family members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <Card.Content className="pt-6 text-center">
                  <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                    {user.fullName ? user.fullName.charAt(0) : 'P'}
                  </div>
                  <h2 className="text-xl font-bold">{user.fullName || 'Patient'}</h2>
                  <p className="text-sm text-muted-foreground mt-1">+91 {user.mobile}</p>
                </Card.Content>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <Card.Header className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                  <Card.Title>Personal Information</Card.Title>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={handleEditInit}>
                      Edit Profile
                    </Button>
                  )}
                </Card.Header>
                <Card.Content className="pt-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                          <input 
                            type="text" 
                            className="input w-full"
                            value={editData.fullName}
                            onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                          <input 
                            type="email" 
                            className="input w-full"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Age / DOB</label>
                          <input 
                            type="text" 
                            className="input w-full"
                            value={editData.dobOrAge}
                            onChange={(e) => setEditData({...editData, dobOrAge: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                          <select 
                            className="input w-full"
                            value={editData.gender}
                            onChange={(e) => setEditData({...editData, gender: e.target.value as any})}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleProfileSave}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                        <p className="font-semibold">{user.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Age / DOB</p>
                        <p className="font-semibold">{user.dobOrAge || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                        <p className="font-semibold">{user.gender || 'Not provided'}</p>
                      </div>
                    </div>
                  )}
                </Card.Content>
              </Card>

              <Card>
                <Card.Header className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                  <div>
                    <Card.Title>Family Members</Card.Title>
                    <p className="text-sm text-muted-foreground mt-1">Manage profiles for your family</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddFamily(!showAddFamily)}>
                    + Add Member
                  </Button>
                </Card.Header>
                <Card.Content className="pt-6">
                  {showAddFamily && (
                    <div className="bg-bg-alt p-4 rounded-xl mb-6 border border-border">
                      <h4 className="font-semibold mb-3 text-sm">Add New Member</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <input placeholder="Name" className="input w-full text-sm py-2" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} />
                        <select className="input w-full text-sm py-2" value={familyData.relation} onChange={e => setFamilyData({...familyData, relation: e.target.value})}>
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Other">Other</option>
                        </select>
                        <input placeholder="Age" className="input w-full text-sm py-2" value={familyData.age} onChange={e => setFamilyData({...familyData, age: e.target.value})} />
                        <select className="input w-full text-sm py-2" value={familyData.gender} onChange={e => setFamilyData({...familyData, gender: e.target.value})}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={handleCancelFamily}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleAddFamily}>{editingFamilyId ? 'Update Member' : 'Save Member'}</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {user.savedPatients.map(patient => (
                      <div key={patient.id} className="flex justify-between items-center p-4 border border-border rounded-xl">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{patient.name}</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">{patient.relation}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{patient.gender} • {patient.age} yrs</span>
                        </div>
                        {patient.relation !== 'Myself' && (
                          <div className="flex gap-3 items-center">
                            <button onClick={() => initEditFamily(patient)} className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
                            <button onClick={() => removePatient(patient.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>

            </div>
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}
