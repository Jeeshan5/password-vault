import { NextRequest, NextResponse } from 'next/server';

// Mock vault database for demo purposes
// In production, replace with actual database
const mockVaultItems = [
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    if (!title || !username || !password) {
      return NextResponse.json(
        { error: 'Title, username and password are required' },
        { status: 400 }
      );
    }

    // Find and update item
    const itemIndex = mockVaultItems.findIndex(item => 
      item._id === itemId && item.userId === userId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    mockVaultItems[itemIndex] = {
      ...mockVaultItems[itemIndex],
      title,
      username,
      password, // Already encrypted by client
      url: url || '',
      notes: notes || '',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockVaultItems[itemIndex]);

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
    const authHeader = request.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    // Find and remove item
    const itemIndex = mockVaultItems.findIndex(item => 
      item._id === itemId && item.userId === userId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    mockVaultItems.splice(itemIndex, 1);

    return NextResponse.json({ message: 'Vault item deleted successfully' });

  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}