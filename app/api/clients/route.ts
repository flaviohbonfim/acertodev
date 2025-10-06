import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    await connectDB();
    // Admins podem ver todos os clientes.
    const filter = session.user.role === 'admin' ? {} : { ownerId: session.user.id };

    const clients = await Client.find(filter).sort({ name: 1 });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name || !body.hourlyRate) {
      return NextResponse.json({ error: 'Nome e valor por hora são obrigatórios' }, { status: 400 });
    }

    await connectDB();

    const newClient = await Client.create({
      ...body,
      ownerId: session.user.id, // Adiciona o ID do usuário logado
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}