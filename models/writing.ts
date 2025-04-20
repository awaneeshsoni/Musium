// models/writing.ts

import mongoose, { Schema, model, models } from 'mongoose';

const WritingSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please enter a title'],
    trim: true,
    maxLength: [100, 'Title must be at most 100 characters long'],
  },
  content: {
    type: Object, // Tiptap JSON content
    default: {},
  },
  is_published: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  ai_chat_history: [{
    role: { type: String },
    content: { type: String }
  }],
  streak_day: {
    type: Number,
    default: 0,
  },
});

const Writing = models.Writing || model('Writing', WritingSchema);

export default Writing;