import { getDatabase, ref, remove, update } from "firebase/database";
import { app } from "./firebase";

export const updateData = async (dbRefPath, updatedValues) => {
  try {
    const db = getDatabase(app);
    const dbRef = ref(db, dbRefPath);

    // Update the specific record
    await update(dbRef, updatedValues);
    console.log("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};


export const deleteCoverLetter = async (uid, recordID) => {
  try {
    const db = getDatabase(app);
    const dbRef = ref(db, `users/${uid}/CoverLetters/${recordID}`);

    await remove(dbRef)
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error('Failed to delete cover letter');
  }
};