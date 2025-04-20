import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { signToken } from '@/lib/auth';
import generateUsername from '@/utils/generateUsername';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    // Basic input validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Please provide name, email, and password' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ message: 'Email is already in use' }, { status: 400 });
    }

    let username = generateUsername(name); // Generate initial username
    let usernameExists = await User.findOne({ username });

    // If the generated username already exists, append a timestamp to make it unique
    if (usernameExists) {
        username = `${username}-${Date.now()}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Sign JWT token
    const token = signToken({ id: savedUser._id.toString(), username: savedUser.username, email: savedUser.email });

    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        name: savedUser.name
      },
      token: token,
    }, { status: 201 });

    // Set the JWT token in a cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: error.message || 'An error occurred' }, { status: 500 });
  }
}
