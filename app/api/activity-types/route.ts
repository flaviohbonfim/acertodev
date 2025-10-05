import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ActivityType from '@/models/ActivityType';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    await connectDB();
    const activityTypes = await ActivityType.find({ ownerId: session.user.id });
    
    return NextResponse.json(activityTypes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    await connectDB();

    const activityType = await ActivityType.create({
      name,
      ownerId: session.user.id,
    });

    return NextResponse.json(activityType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
