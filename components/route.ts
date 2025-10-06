import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ActivityType from '@/models/ActivityType';
import mongoose from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await connectDB();

    const activityType = await ActivityType.findById(params.id);

    if (!activityType) {
      return NextResponse.json({ error: 'Tipo de atividade não encontrado' }, { status: 404 });
    }

    return NextResponse.json(activityType);
  } catch (error) {
    console.error('Erro ao buscar tipo de atividade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
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

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'O nome é obrigatório' }, { status: 400 });
    }

    await connectDB();

    const updatedActivityType = await ActivityType.findByIdAndUpdate(params.id, { name }, { new: true });

    if (!updatedActivityType) {
      return NextResponse.json({ error: 'Tipo de atividade não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updatedActivityType);
  } catch (error) {
    console.error('Erro ao atualizar tipo de atividade:', error);
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
    await ActivityType.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Tipo de atividade deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tipo de atividade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
