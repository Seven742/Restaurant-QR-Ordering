import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await requireRole(['admin']);
    
    // Cloudinary config is automatically picked up if CLOUDINARY_URL is in .env
    // We can also configure it manually if needed, but CLOUDINARY_URL is standard.
    if (!process.env.CLOUDINARY_URL) {
      return NextResponse.json({ error: 'Cloudinary is not configured. Please add CLOUDINARY_URL to .env.local' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'restaurant_qr' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: error.status || 500 });
  }
}
