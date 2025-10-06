import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VaultItem from '@/models/VaultItem';
import { extractUserIdFromToken } from '@/lib/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    if (!title || !username || !password) {
      return NextResponse.json(
        { error: 'Title, username and password are required' },
        { status: 400 }
      );
    }

    // Find and update item
    const updatedItem = await VaultItem.findOneAndUpdate(
      { _id: itemId, userId },
      {
        title,
        username,
        password, // Already encrypted by client
        url: url || '',
        notes: notes || '',
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);

  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    // Find and remove item
    const deletedItem = await VaultItem.findOneAndDelete({
      _id: itemId,
      userId,
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vault item deleted successfully' });

  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}