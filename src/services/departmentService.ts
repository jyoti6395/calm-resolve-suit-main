import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Department } from "../types/store";

/**
 * Fetches all departments from the Firestore 'departments' collection.
 * Gracefully normalizes potential variations in schema (e.g. name vs title, description vs desc).
 */
export async function getDepartments(): Promise<Department[]> {
  const querySnapshot = await getDocs(collection(db, "departments"));
  const list: Department[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    list.push({
      id: doc.id,
      name: data.name || data.title || doc.id,
      description: data.description || data.desc || "",
      ...data,
    } as Department);
  });
  return list;
}
