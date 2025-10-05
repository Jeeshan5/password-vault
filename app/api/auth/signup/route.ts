import { NextRequest, NextResponse } from 'next/server';

// Mock user database for demo purposes
// In production, replace with actual database
const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'demo123', // In production, this would be hashed
    createdAt: new Date().toISOString()
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user (in production, hash password and save to database)
    const newUser = {
      id: String(mockUsers.length + 1),
      email: email.toLowerCase(),
      password: password, // In production, hash with bcrypt
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Generate simple token (in production, use JWT)
    const token = `demo-token-${newUser.id}-${Date.now()}`;

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}