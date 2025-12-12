// src/lib/firebaseAPI.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import the initialized Firestore instance
import { Hostel } from "../types";

const COLLECTION_NAME = "hostels";

// --- FETCH ALL HOSTELS ---
export const getHostels = async (): Promise<Hostel[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        // Provide types for the data we return
        return querySnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore creates the ID, we use it
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
        // 1. Create a reference with a new auto-generated ID
        const newCityRef = doc(collection(db, COLLECTION_NAME));

        // 2. Prepare the data WITH the ID included
        const hostelData = { ...newHostel, id: newCityRef.id };

        // 3. Write to Firestore
        await setDoc(newCityRef, hostelData);

        console.log("Document written with ID: ", newCityRef.id);
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
        console.log("Document updated");

        // We can't easily return the Full updated object from updateDoc, so we construct it effectively
        // In a real app you might want to fetch it again to be 100% sure, but for now this is fine.
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
        console.log("Document deleted");
        return true;
    } catch (error) {
        console.error("Error deleting document: ", error);
        return false;
    }
};
