import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
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

    const { date, hours, description, activityTypeId, target } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await connectDB();

    const timeEntry = await TimeEntry.findOne({ _id: params.id, ownerId: session.user.id });
    if (!timeEntry) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 });
    }

    const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
      params.id,
      { 
        date: new Date(date), 
        hours, 
        description, 
        activityTypeId, 
        target 
      },
      { new: true }
    ).populate('activityTypeId');

    return NextResponse.json(updatedTimeEntry);
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

    const timeEntry = await TimeEntry.findOne({ _id: params.id, ownerId: session.user.id });
    if (!timeEntry) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 });
    }

    await TimeEntry.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
