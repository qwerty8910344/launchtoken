import firebaseAdmin from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
export async function GET() {
  const db = getFirestore(firebaseAdmin);
  const snapshot = await db.collection("test").get();
  const data = snapshot.docs.map(doc => doc.data());
  return Response.json(data);
}
