import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Writing from '@/models/Writing';

export async function GET(req) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing writing ID', success: false }, { status: 400 });
    }

    const writing = await Writing.findById(id);
    console.log(writing);

    if (!writing) {
      return NextResponse.json({ message: 'Writing not found', success: false }, { status: 404 });
    }

    if (!writing.is_published) {
      return NextResponse.json({ message: 'Writing is not public', success: false }, { status: 403 });
    }

    return NextResponse.json({
      ...writing.toObject(),
      isPublished: writing.is_published,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching writing:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch writing', success: false }, { status: 500 });
  }
}
