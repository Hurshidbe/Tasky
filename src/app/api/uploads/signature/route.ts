import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Optional folder for upload (e.g., 'avatars' or 'backgrounds')
  const { folder } = await req.json();
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Missing Cloudinary configuration' }, { status: 500 });
  }
  const params = `timestamp=${timestamp}&folder=${folder || 'tasky'}`;
  const signature = crypto.createHmac('sha1', apiSecret).update(params).digest('hex');
  return NextResponse.json({ timestamp, signature, apiKey, cloudName });
}
