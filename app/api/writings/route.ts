// app/api/writings.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Writing from '@/models/writing';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET all writings for a user, or a specific writing by ID
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token', success: false }, { status: 401 });
    }

    const writingId = req.nextUrl.searchParams.get('id');

    if (writingId) {
      // Fetch a specific writing by ID
      const writing = await Writing.findById(writingId);

      if (!writing) {
        return NextResponse.json({ message: 'Writing not found', success: false }, { status: 404 });
      }

      // Ensure the user owns the writing
      if (writing.user_id.toString() !== decodedToken.userId) {
        return NextResponse.json({ message: 'Unauthorized to access this writing', success: false }, { status: 403 });
      }

      return NextResponse.json(writing, { status: 200 });
    } else {
      // Fetch all writings for the user
      const writings = await Writing.find({ user_id: decodedToken.userId }).sort({ updated_at: 'desc' });
      return NextResponse.json(writings, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching writings:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch writings', success: false }, { status: 500 });
  }
}

// POST a new writing
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token', success: false }, { status: 401 });
    }

    const { title, content } = await req.json() || { title: 'New Writing', content: {} }; // Extract title and content from request body

    const newWriting = new Writing({
      user_id: decodedToken.userId,
      title: title, // Use the provided title or default
      content: content, // Use the provided content or default
    });

    const savedWriting = await newWriting.save();

    return NextResponse.json({
      id: savedWriting._id,
      message: 'Writing created successfully',
      success: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating writing:', error);
    return NextResponse.json({ message: error.message || 'Failed to create writing', success: false }, { status: 500 });
  }
}

// PUT (Update) an existing writing
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const token = (await cookies()).get('token')?.value;
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

    // Update fields that are present in the request
    if (title) writing.title = title;
    if (content) writing.content = content;
    if (typeof is_published === 'boolean') writing.is_published = is_published;
    writing.updated_at = new Date(); // Update the updated_at timestamp

    await writing.save();

    return NextResponse.json({ message: 'Writing updated successfully', success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating writing:', error);
    return NextResponse.json({ message: error.message || 'Failed to update writing', success: false }, { status: 500 });
  }
}