import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ClientGroup from '@/models/ClientGroup';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    await connectDB();
    // Admins podem ver todos os grupos.
    const filter = session.user.role === 'admin' ? {} : { ownerId: session.user.id };

    const groups = await ClientGroup.find(filter).populate('clientIds');
    
    return NextResponse.json(groups);
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

    const { name, clientIds } = await request.json();

    if (!name || !clientIds || clientIds.length === 0) {
      return NextResponse.json({ error: 'Nome e pelo menos um cliente são obrigatórios' }, { status: 400 });
    }

    await connectDB();

    const group = await ClientGroup.create({
      name,
      clientIds,
      ownerId: session.user.id,
    });

    const populatedGroup = await ClientGroup.findById(group._id).populate('clientIds');

    return NextResponse.json(populatedGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
