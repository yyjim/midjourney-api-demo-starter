// Webhook response received from yy-api
// {
//    id: 'xxxx'
//    images: [
//        .....
//    ]  
// }
import { firestore } from '../../../db';
import { auth } from '../../../db';
import { addDoc, collection, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

export default async function handler(req: any, res: any) {
    console.log(req.body);
    const { uid } = req.query;
    const { images } = req.body as any;
    const imageUrl = images[0];

    const docRef = await addDoc(collection(firestore, `/users/${uid}/images`), {
        imageUrl: imageUrl,
        createdAt: new Date(),
    });

    res.status(200).json({ result: true });
}
