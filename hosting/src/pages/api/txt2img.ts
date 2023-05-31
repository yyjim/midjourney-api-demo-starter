import { firestore } from '../../db';
import { auth } from '../../db';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';
import axios from 'axios';

import { NextApiRequest, NextApiResponse } from 'next';

const AUTH_TOKEN = '05ad590a-581b-464e-b355-8db62b8ef189';
const endpoint = 'https://api.thenextleg.io/v2';

interface ImagineResponse {
    messageId: string;
    createdAt: Date;
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