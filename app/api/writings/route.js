import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Writing from '@/models/Writing';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token', success: false }, { status: 401 });
    }

    const writingId = req.nextUrl.searchParams.get('id');

    if (writingId) {
      const writing = await Writing.findById(writingId);

      if (!writing) {
        return NextResponse.json({ message: 'Writing not found', success: false }, { status: 404 });
      }

      if (writing.user_id.toString() !== decodedToken.userId) {
        return NextResponse.json({ message: 'Unauthorized to access this writing', success: false }, { status: 403 });
      }

      return NextResponse.json({
        ...writing.toObject(),
        isPublished: writing.is_published,
      }, { status: 200 });
    } else {
      const writings = await Writing.find({ user_id: decodedToken.userId }).sort({ updated_at: 'desc' });
      return NextResponse.json(writings, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching writings:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch writings', success: false }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token', success: false }, { status: 401 });
    }

    const body = await req.json();
    const { title = 'New Writing', content = {}, is_published = false } = body || {};

    const newWriting = new Writing({
      user_id: decodedToken.userId,
      title,
      content,
      is_published,
    });

    const savedWriting = await newWriting.save();

    return NextResponse.json({
      id: savedWriting._id,
      message: 'Writing created successfully',
      success: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating writing:', error);
    return NextResponse.json({ message: error.message || 'Failed to create writing', success: false }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token', success: false }, { status: 401 });
    }

    const { id, title, content, is_published } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Writing ID is required for updates', success: false }, { status: 400 });
    }

    const writing = await Writing.findById(id);
    if (!writing) {
      return NextResponse.json({ message: 'Writing not found', success: false }, { status: 404 });
    }

    if (writing.user_id.toString() !== decodedToken.userId) {
      return NextResponse.json({ message: 'Unauthorized to update this writing', success: false }, { status: 403 });
    }

    if (title !== undefined) writing.title = title;
    if (content !== undefined) writing.content = content;
    if (is_published !== undefined) writing.is_published = is_published;

    writing.updated_at = new Date();
    await writing.save();

    return NextResponse.json({ message: 'Writing updated successfully', success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating writing:', error);
    return NextResponse.json({ message: error.message || 'Failed to update writing', success: false }, { status: 500 });
  }
}
