import { NextRequest, NextResponse } from 'next/server';

// Mock vault database for demo purposes
// In production, replace with actual database
let mockVaultItems = [
  {
    _id: '1',
    title: 'Gmail',
    username: 'john@gmail.com',
    password: 'VGVzdFBhc3N3b3JkMTIz', // Base64 encoded demo data
    url: 'https://gmail.com',
    notes: 'TXkgcGVyc29uYWwgZW1haWw=', // Base64 encoded demo data
    userId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Facebook',
    username: 'john.doe',
    password: 'U29jaWFsUGFzczQ1Ng==', // Base64 encoded demo data
    url: 'https://facebook.com',
    notes: '',
    userId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to extract user ID from token (simplified for demo)
function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // In production, decode JWT and extract userId
  // For demo, extract from simple token format
  const parts = token.split('-');
  return parts.length >= 3 ? parts[2] : null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's vault items
    const userItems = mockVaultItems.filter(item => item.userId === userId);
    
    return NextResponse.json(userItems);

  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, username, password, url, notes } = await request.json();

    if (!title || !username || !password) {
      return NextResponse.json(
        { error: 'Title, username and password are required' },
        { status: 400 }
      );
    }

    // Create new vault item
    const newItem = {
      _id: String(mockVaultItems.length + 1),
      title,
      username,
      password, // Already encrypted by client
      url: url || '',
      notes: notes || '',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockVaultItems.push(newItem);

    return NextResponse.json(newItem);

  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}