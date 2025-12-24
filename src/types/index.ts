export interface Location {
    address: string;
    latitude: number;
    longitude: number;
}

export interface Hostel {
    id: string;
    name: string;
    type: 'men' | 'Women';
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    seatsReserved?: number; // <--- NEW: Tracks pending seats
    amenities: string[];
    images: string[];
    location: string;
    verified: boolean;
    contactNumber: string;
    description: string;
}

export interface Booking {
  id: string;
  studentName: string;
  studentPhone: string;
  hostelId: string;
  hostelName: string;
  joiningDate: string; 
  status: 'pending' | 'confirmed' | 'rejected';
  timestamp: string;
}