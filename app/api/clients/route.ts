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
    const clients = await Client.find({ ownerId: session.user.id });
    
    return NextResponse.json(clients);
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

    const { name, cnpj, email, hourlyRate } = await request.json();

    if (!name || !hourlyRate) {
      return NextResponse.json({ error: 'Nome e valor por hora são obrigatórios' }, { status: 400 });
    }

    await connectDB();

    const client = await Client.create({
      name,
      cnpj,
      email,
      hourlyRate,
      ownerId: session.user.id,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
