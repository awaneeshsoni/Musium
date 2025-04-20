
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please enter a username'],
    unique: true,
    trim: true,
    minLength: [3, 'Username must be at least 3 characters long'],
    maxLength: [20, 'Username must be at most 20 characters long'],
  },
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters long'],
    maxLength: [50, 'Name must be at most 50 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minLength: [8, 'Password must be at least 8 characters long'],
  },
  avatar_url: {
    type: String,
    default: null, // Or a default avatar URL
  },
  streak_day: {
    type: Number,
    default: 0,
  },
});

const User = models.User || model('User', UserSchema);

export default User;