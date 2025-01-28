import { getDatabase, ref, update } from "firebase/database";
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