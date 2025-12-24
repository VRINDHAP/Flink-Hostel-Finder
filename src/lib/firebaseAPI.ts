import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, increment, writeBatch } from "firebase/firestore"; 
import { db } from "./firebase"; 
import { Hostel, Booking } from "../types";

const COLLECTION_NAME = "hostels";
const BOOKING_COLLECTION = "bookings";

// --- FETCH HOSTELS ---
export const getHostels = async (): Promise<Hostel[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Hostel[];
    } catch (error) {
        console.error("Error fetching hostels:", error);
        return [];
    }
};

// --- ADD HOSTEL ---
export const addHostel = async (newHostel: Hostel): Promise<Hostel> => {
    try {
        const newCityRef = doc(collection(db, COLLECTION_NAME));
        const hostelData = { ...newHostel, id: newCityRef.id };
        await setDoc(newCityRef, hostelData);
        return hostelData;
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

// --- UPDATE HOSTEL ---
export const updateHostel = async (id: string, updatedData: Partial<Hostel>): Promise<Hostel | null> => {
    try {
        const hostelRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(hostelRef, updatedData);
        return { id, ...updatedData } as Hostel;
    } catch (error) {
        console.error("Error updating document: ", error);
        return null;
    }
};

// --- DELETE HOSTEL ---
export const deleteHostel = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return true;
    } catch (error) {
        console.error("Error deleting document: ", error);
        return false;
    }
};

// --- FETCH BOOKINGS ---
export const getBookings = async (): Promise<Booking[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, BOOKING_COLLECTION));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Booking[];
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
};

// --- NEW: ADD BOOKING (With Reserved Logic) ---
export const addBooking = async (bookingData: any) => {
    try {
        const batch = writeBatch(db);

        // 1. Create the Booking Document
        const newBookingRef = doc(collection(db, BOOKING_COLLECTION));
        const finalBookingData = { ...bookingData, id: newBookingRef.id };
        batch.set(newBookingRef, finalBookingData);

        // 2. Update the Hostel Document IMMEDIATELY
        //    - Decrease 'seatsAvailable' by 1
        //    - Increase 'seatsReserved' by 1
        const hostelRef = doc(db, COLLECTION_NAME, bookingData.hostelId);
        batch.update(hostelRef, {
            seatsAvailable: increment(-1),
            seatsReserved: increment(1)
        });

        // 3. Commit both changes together
        await batch.commit();
        
        console.log("Booking saved & Seats updated reserved.");
        return true;
    } catch (error) {
        console.error("Error saving booking: ", error);
        return false;
    }
};

// --- UPDATE BOOKING STATUS ---
export const updateBookingStatus = async (id: string, hostelId: string, status: 'confirmed' | 'rejected') => {
    try {
        const bookingRef = doc(db, BOOKING_COLLECTION, id);
        const batch = writeBatch(db);

        // 1. Update Booking Status
        batch.update(bookingRef, { status });

        // 2. Handle Seat Logic on Approval/Rejection
        const hostelRef = doc(db, COLLECTION_NAME, hostelId);
        
        if (status === 'confirmed') {
             // If confirmed, simply remove the 'reserved' tag (count stays down)
             batch.update(hostelRef, {
                 seatsReserved: increment(-1)
             });
        } else if (status === 'rejected') {
             // If rejected, give the seat back!
             batch.update(hostelRef, {
                 seatsAvailable: increment(1),
                 seatsReserved: increment(-1)
             });
        }

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error updating booking: ", error);
        return false;
    }
};