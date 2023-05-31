// Webhook response received from The Next Leg
// {
//   "createdAt": {
//       "_nanoseconds": 215000000,
//       "_seconds": 1678840347
//   },
//   "buttons": [
//       "U1",
//       "U2",
//       "U3",
//       "U4",
//       "🔄",
//       "V1",
//       "V2",
//       "V3",
//       "V4"
//   ],
//   "imageUrl": "your-image-url",
//   "buttonMessageId": "OtfxNzfMIKBPVE1aP4u4",
//   "originatingMessageId": "your-message-id",
//   "content": "your-original-prompt"
// }
import { firestore } from '../../db';
import { auth } from '../../db';
import { addDoc, collection, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

export default async function handler(req: any, res: any) {
  const { imageUrl, originatingMessageId } = req.body as any;
  console.log(req.body);

  if (originatingMessageId == null || imageUrl == null) {
    res.status(200).json({ result: false });
    return
  }

  // Store image url in the original request
  const docRef = doc(firestore, "requestIds", originatingMessageId);
  await updateDoc(docRef, {
    imageUrl: imageUrl,
    createdAt: new Date(),
  });

  // Update for user
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log(docSnap.data());
    const { uid } = docSnap.data();

    // Save to user's requestIds
    await setDoc(doc(firestore, `/users/${uid}/requestIds`, originatingMessageId), {
      imageUrl: imageUrl,
      createdAt: new Date(),
    }, { merge: true });

    // Create a new image to user's images collection
    await addDoc(collection(firestore, `/users/${uid}/images`), {
      imageUrl: imageUrl,
      createdAt: new Date(),
    });

    res.status(200).json({ result: true });
  } else {
    res.status(200).json({ result: false });
  }
}
