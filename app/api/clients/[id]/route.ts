import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { name, cnpj, email, hourlyRate } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOne({ _id: params.id, ownerId: session.user.id });
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      { name, cnpj, email, hourlyRate },
      { new: true }
    );

    return NextResponse.json(updatedClient);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOne({ _id: params.id, ownerId: session.user.id });
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    await Client.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
