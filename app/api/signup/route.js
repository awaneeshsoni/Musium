import { NextResponse } from 'next/server';
import bcrypt from "bcrypt";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

function generateUsername(name) {
    let username = name.toLowerCase().replace(/\s+/g, '');
    const randomNumber = Math.floor(Math.random() * 1000);
    username += randomNumber;
    return username;
}

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

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

    let username = generateUsername(name);
    let usernameExists = await User.findOne({ username });
    if (usernameExists) {
        username = `${username}${Date.now()}`; 
        username = `${username.slice(0, -String(Math.floor(Math.random() * 1000)).length)}-${Date.now()}`;
    }
    
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

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage || 'An error occurred' }, { status: 500 });
  }
}