import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ClientGroup from '@/models/ClientGroup';
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

    const { name, clientIds } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await connectDB();

    const group = await ClientGroup.findOne({ _id: params.id, ownerId: session.user.id });
    if (!group) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }

    const updatedGroup = await ClientGroup.findByIdAndUpdate(
      params.id,
      { name, clientIds },
      { new: true }
    ).populate('clientIds');

    return NextResponse.json(updatedGroup);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const group = await ClientGroup.findOne({ _id: params.id, ownerId: session.user.id });
    if (!group) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }

    await ClientGroup.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
