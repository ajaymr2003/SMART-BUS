// Import the latest Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc,
    query,
    orderBy,
    limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7AAT6A6FggiKYVkD7D-r3C4dkOSONNvw",
    authDomain: "smartbus-eff5b.firebaseapp.com", 
    projectId: "smartbus-eff5b",
    storageBucket: "smartbus-eff5b.appspot.com", // Fix storage bucket URL
    messagingSenderId: "893667460966",
    appId: "1:893667460966:web:3acfe1e753621d591f6aa7"
};

class FirebaseService {
    constructor() {
        try {
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            throw error;
        }
    }

    async addBooking(bookingData) {
        try {
            const docRef = await addDoc(collection(this.db, "bookings"), {
                ...bookingData,
                timestamp: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding booking:", error);
            throw error;
        }
    }

    async getBookings(limitCount = 100) {
        try {
            const q = query(
                collection(this.db, "bookings"),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            throw error;
        }
    }
}

export const firebaseService = new FirebaseService();