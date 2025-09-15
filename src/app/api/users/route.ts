import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/aws-services';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const users = await UserService.getUsers();
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role = 'reporter', status = 'active', avatar } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const newUser = await UserService.createUser({
      name,
      email,
      role: role as 'admin' | 'editor' | 'reporter',
      status: status as 'active' | 'inactive',
      avatar
    });
    
    return NextResponse.json({
      success: true,
      user: newUser
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
