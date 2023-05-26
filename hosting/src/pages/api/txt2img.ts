// Set up A POST txt2img API
// https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: any, res: any) {
    // Access the 'text' and 'uid' parameters from the request query
    const { text, uid } = req.query;

    // Your API logic goes here

    // Send the response
    res.status(200).json({ text, uid });
}