// src/context/HostelContext.tsx
"use client"; // This tells Next.js this file runs in the browser, not the server.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hostel } from '../types';
// import * as fakeAPI from '../lib/fakeAPI';
import * as firebaseAPI from '../lib/firebaseAPI';
import { applyFilters, FilterCriteria } from '../lib/filters';

// 1. Define the shape of our "Bridge"
// This tells the UI members: "Here are the variables and functions you can use."
interface HostelContextType {
  hostels: Hostel[];            // The full list of hostels (useful for Admin)
  filteredHostels: Hostel[];    // The filtered list (useful for Students)
  loading: boolean;             // True if we are still fetching data
  triggerUpdate: (id: string, data: Partial<Hostel>) => Promise<void>; // Function to update data
  filterData: (criteria: FilterCriteria) => void; // Function to filter data
  // --- NEW CAPABILITIES ---
  addHostel: (hostel: Hostel) => Promise<void>;
  deleteHostel: (id: string) => Promise<void>;
}

// Create the context (initially undefined)
const HostelContext = createContext<HostelContextType | undefined>(undefined);

// 2. The Provider Component
// This wraps the whole app and provides the data to every page.
export const HostelProvider = ({ children }: { children: ReactNode }) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  // On Load: Fetch data from our Fake API
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // const data = await fakeAPI.getHostels();
      const data = await firebaseAPI.getHostels();
      setHostels(data);
      setFilteredHostels(data); // Initially, show all hostels
      setLoading(false);
    };
    load();
  }, []);

  // Logic: Handle Filtering (For Member 1 - Student UI)
  const filterData = (criteria: FilterCriteria) => {
    const result = applyFilters(hostels, criteria);
    setFilteredHostels(result);
  };

  // Logic: Handle Updates (For Member 3 - Admin Dashboard)
  const triggerUpdate = async (id: string, data: Partial<Hostel>) => {
    // 1. Update the "database"
    // const updatedHostel = await fakeAPI.updateHostel(id, data);
    const updatedHostel = await firebaseAPI.updateHostel(id, data);

    if (updatedHostel) {
      // 2. Update the local state immediately so the user sees the change
      setHostels((prev) =>
        prev.map((h) => (h.id === id ? updatedHostel : h))
      );
      // Update filtered list too, just in case the updated hostel is currently shown
      setFilteredHostels((prev) =>
        prev.map((h) => (h.id === id ? updatedHostel : h))
      );
    }
  };

  // Logic: Handle Adding (For Member 3 - Admin Dashboard)
  const addHostelData = async (newHostel: Hostel) => {
    // 1. Send to "Database"
    // await fakeAPI.addHostel(newHostel);
    const savedHostel = await firebaseAPI.addHostel(newHostel);

    // 2. Update local state immediately so it appears in the table (Optimistic UI)
    // For Firebase, we use the returned object which has the REAL ID from the database
    setHostels((prev) => [...prev, savedHostel]);
    setFilteredHostels((prev) => [...prev, savedHostel]);
  };

  // Logic: Handle Deleting (For Member 3 - Admin Dashboard)
  const deleteHostelData = async (id: string) => {
    // 1. Tell "Database" to delete
    // await fakeAPI.deleteHostel(id);
    await firebaseAPI.deleteHostel(id);

    // 2. Remove from local state
    setHostels((prev) => prev.filter((h) => h.id !== id));
    setFilteredHostels((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <HostelContext.Provider value={{
      hostels,
      filteredHostels,
      loading,
      triggerUpdate,
      filterData,
      addHostel: addHostelData,       // Exposed to the app
      deleteHostel: deleteHostelData  // Exposed to the app
    }}>
      {children}
    </HostelContext.Provider>
  );
};

// 3. Custom Hook
// This is a shortcut. Your team members will just write: const { filteredHostels } = useHostels();
export const useHostels = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostels must be used within a HostelProvider');
  }
  return context;
};