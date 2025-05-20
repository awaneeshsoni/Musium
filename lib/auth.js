import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in .env.local. Using default secret for development only.');
}

export const signToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '12h',
    }
  );
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

export const getUserFromToken = (token) => {
  const user = verifyToken(token);
  if (!user) return null;
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
  };
};
