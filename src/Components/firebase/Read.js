import { getDatabase, ref, get } from "firebase/database";
import { app } from "./firebase";

export const fetchData = async (dbRefPath) => {
  try {
    const db = getDatabase(app);
    const dbRef = ref(db, dbRefPath);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      // const data = Object.values(snapshot.val());
      
      // return data;

      const data = snapshot.val();
      // Include Firebase ID as part of the returned object
      const result = Object.entries(data).map(([id, value]) => ({
        id, // Firebase unique ID
        ...value,
      }));
      
      return result;
    } else {
      throw new Error("No data available");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Example of calling fetchData in another JS file
// import { fetchData } from './path-to-this-file';
//
// const fetchFruitData = async () => {
//   try {
//     const fruits = await fetchData("SmartAss");
//     console.log(fruits);
//   } catch (error) {
//     console.error("Failed to fetch fruits:", error);
//   }
// };
