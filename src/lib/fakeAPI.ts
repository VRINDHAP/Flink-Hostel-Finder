// src/lib/fakeAPI.ts
import { Hostel } from '../types';
import { hostels as initialHostels } from '../data/hostels';

const STORAGE_KEY = 'hostel_finder_data';
const SIMULATED_DELAY = 500; // ms

// Load initial data (safe for SSR)
const loadData = (): Hostel[] => {
  if (typeof window === 'undefined') return initialHostels;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialHostels;
};


let hostelsDataSource = loadData();


const saveData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hostelsDataSource));
  }
};

// Basic CRUD API (simulated delay)
export const getHostels = async (): Promise<Hostel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...hostelsDataSource]); 
    }, SIMULATED_DELAY);
  });
};
export const getHostelById = async (id: string): Promise<Hostel | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hostel = hostelsDataSource.find((h) => h.id === id);
      resolve(hostel ? { ...hostel } : undefined);
    }, SIMULATED_DELAY);
  });
};

export const updateHostel = async (id: string, updatedData: Partial<Hostel>): Promise<Hostel | null> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const index = hostelsDataSource.findIndex((h) => h.id === id);
      if (index === -1) return resolve(null);
      hostelsDataSource[index] = { ...hostelsDataSource[index], ...updatedData };
      saveData();
      console.log(`Updated hostel ${id}:`, hostelsDataSource[index]);
      resolve(hostelsDataSource[index]);
    }, SIMULATED_DELAY);
});

export const addHostel = async (newHostel: Hostel): Promise<Hostel> =>
  new Promise((resolve) => {
    setTimeout(() => {
      hostelsDataSource.push(newHostel);
      saveData();
      console.log('Added new hostel:', newHostel);
      resolve(newHostel);
    }, SIMULATED_DELAY);
});

export const deleteHostel = async (id: string): Promise<boolean> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = hostelsDataSource.length;
      hostelsDataSource = hostelsDataSource.filter((h) => h.id !== id);
      saveData();
      const success = hostelsDataSource.length < initialLength;
      console.log(`Deleted hostel ${id}:`, success);
      resolve(success);
    }, SIMULATED_DELAY);
});

// Visitor counter stored in localStorage (safe for SSR)
export const getVisitorCount = async (): Promise<number> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(12450);
    const count = localStorage.getItem('visitor_count');
    const current = count ? parseInt(count, 10) : 12450;
    const newCount = current + 1;
    localStorage.setItem('visitor_count', newCount.toString());
    resolve(newCount);
});
