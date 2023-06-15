import { firestore } from '../../db';
import { auth } from '../../db';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';
import axios from 'axios';

import { NextApiRequest, NextApiResponse } from 'next';

const AUTH_TOKEN = 'f3784831-4389-4905-82ff-3ff7c45d8c23';
const endpoint = 'https://api.thenextleg.io/v2';

interface ImagineResponse {
    messageId: string;
    createdAt: Date;
}

export async function sendImagineAPIAndSave(prompt: string, uid: string): Promise<any> {
    const { messageId, createdAt } = await sendImagineAPI(prompt, uid);
    return await saveToFirestore(messageId, createdAt, uid);
}

async function sendImagineAPI(prompt: string, uid: string): Promise<ImagineResponse> {
    try {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
        };

        const requestData = {
            cmd: 'imagine',
            msg: prompt,
        };

        const response = await axios.post(endpoint, requestData, { headers });
        console.log(response.data);
        const messageId = response.data.messageId;
        const createdAt = new Date(response.data.createdAt);
        return { messageId, createdAt };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function saveToFirestore(requestId: string, createdAt: Date, uid: string): Promise<any> {
    const data = {
        uid: uid,
        createdAt: createdAt
    }

    await setDoc(doc(firestore, `/users/${uid}/images`, requestId), {
        createdAt: new Date(),
    }, { merge: true });
    return await setDoc(doc(firestore, `requestIds`, requestId), data, { merge: true });
}

export default async function handler(req: any, res: any) {
    // Access the 'text' and 'uid' parameters from the request query
    const { prompt, uid } = req.query;

    try {
        const { messageId, createdAt } = await sendImagineAPI(prompt, uid);
        await saveToFirestore(messageId, createdAt, uid);

        res.status(200).json({ messageId, createdAt });
    } catch (error: any) {
        res.status(200).json({ error: error.message });
    }
}