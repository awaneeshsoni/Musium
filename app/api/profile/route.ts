// app/api/profile.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

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

    const user = await User.findById(decodedToken.userId).select('-password'); // Exclude password from the response

    if (!user) {
      return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch profile', success: false }, { status: 500 });
  }
}

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

    const userId = decodedToken.userId;

    const { name, username, email, password, newPassword } = await req.json();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found', success: false }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid current password', success: false }, { status: 401 });
    }

    // Update fields
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;

    // Update password if newPassword is provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return NextResponse.json({ message: 'Profile updated successfully', success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: error.message || 'Failed to update profile', success: false }, { status: 500 });
  }
}