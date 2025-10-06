import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VaultItem from '@/models/VaultItem';
import { extractUserIdFromToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const userId = extractUserIdFromToken(authHeader);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's vault items
    const userItems = await VaultItem.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
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
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const userId = extractUserIdFromToken(authHeader);
    
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
    const newItem = await VaultItem.create({
      title,
      username,
      password, // Already encrypted by client
      url: url || '',
      notes: notes || '',
      userId,
    });

    return NextResponse.json(newItem);

  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}