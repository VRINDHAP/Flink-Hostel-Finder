'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Important for redirecting
import { useHostels } from '@/context/HostelContext';
import { Hostel } from '@/types';
import { auth } from '@/lib/firebase'; // Ensure this matches your firebase.ts path
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Edit2, Trash2, Search, Building2, MapPin, Phone, IndianRupee, BedDouble, X } from 'lucide-react';

export default function AdminDashboard() {
  // 1. Get Global Data & Functions from Context
  const { hostels, addHostel, deleteHostel, triggerUpdate } = useHostels();
  const router = useRouter();

  // 2. Local State
  const [loadingAuth, setLoadingAuth] = useState(true); // To show a spinner while checking login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Form State
  const [formData, setFormData] = useState<Partial<Hostel>>({
    name: '',
    location: '',
    price: 0,
    contactNumber: '',
    seatsAvailable: 0,
    type: 'men'
  });

  // --- SECURITY GUARD: CHECK LOGIN STATUS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, allow access
        setLoadingAuth(false);
      } else {
        // User is NOT logged in, kick them out
        router.push('/admin');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ name: '', location: '', price: 0, contactNumber: '', seatsAvailable: 0, type: 'men' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hostel: Hostel) => {
    setIsEditMode(true);
    setFormData(hostel);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && formData.id) {
      // SCENARIO A: Updating
      await triggerUpdate(formData.id, formData);
      alert("Hostel Updated Successfully!");
    } else {
      // SCENARIO B: Creating
      const newHostel: Hostel = {
        ...formData as Hostel,
        id: Date.now().toString(),
        verified: true,
        amenities: ['WiFi', 'Mess'],
        totalSeats: formData.seatsAvailable || 10,
        images: ['/images/hostel1.jpg'],
        description: 'New hostel added via Admin Dashboard'
      };
      await addHostel(newHostel);
      alert("New Hostel Created!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this hostel? This cannot be undone.")) {
      await deleteHostel(id);
    }
  };

  const filteredHostels = hostels.filter(hostel =>
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOADING VIEW (While checking if user is logged in) ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* HEADER SECTION */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
               {/* LOGOUT BUTTON */}
               <button 
                  onClick={() => auth.signOut()}
                  className="text-sm text-gray-500 hover:text-red-600 font-medium"
               >
                  Logout
               </button>

               <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95"
               >
                  <Plus className="w-4 h-4" />
                  Add Hostel
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Hostel Database</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your properties and listings</p>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search hostels..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Mo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHostels.length > 0 ? (
                  filteredHostels.map((hostel) => (
                    <tr key={hostel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hostel.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {hostel.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {hostel.contactNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {hostel.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${hostel.type.toLowerCase() === 'men' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                          {hostel.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${hostel.seatsAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          <BedDouble className="w-3.5 h-3.5" />
                          {hostel.seatsAvailable > 0 ? `${hostel.seatsAvailable} Beds` : 'Full'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(hostel)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(hostel.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-base font-medium text-gray-900">No hostels found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm ? `No results for "${searchTerm}"` : "Get started by adding a new hostel."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredHostels.length}</span> results
            </span>
          </div>
        </div>
      </main>

      {/* POPUP FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Hostel Details' : 'Add New Hostel'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                  <input
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                    placeholder="e.g. Sunrise Stay"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                      placeholder="e.g. North Campus"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seats Available</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                      value={formData.seatsAvailable || ''}
                      onChange={e => setFormData({ ...formData, seatsAvailable: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 transition-shadow h-[42px]"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as 'men' | 'Women' })}
                    >
                      <option value="men">Men's Hostel</option>
                      <option value="Women">Women's Hostel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-900"
                        placeholder="98765..."
                        value={formData.contactNumber}
                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {isEditMode ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}