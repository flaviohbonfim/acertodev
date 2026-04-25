import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    await connectDB();
    // Admins podem ver todos os lançamentos.
    const filter = session.user.role === 'admin' ? {} : { ownerId: session.user.id };

    const [timeEntries, total] = await Promise.all([
      TimeEntry.find(filter)
        .populate('activityTypeId')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      TimeEntry.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: timeEntries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    const { date, dates, hours, description, activityTypeId, target } = await request.json();

    if ((!date && !dates) || !hours || !description || !activityTypeId || !target) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    await connectDB();

    if (dates && Array.isArray(dates)) {
      const entries = dates.map((d: string) => ({
        date: new Date(`${d}T00:00:00`),
        hours,
        description,
        activityTypeId,
        target,
        ownerId: session.user.id,
      }));

      const timeEntries = await TimeEntry.insertMany(entries);
      
      // Note: insertMany doesn't automatically populate. If needed, we'd need to fetch and populate.
      // But for a batch creation, returning the raw objects or a success message is usually enough for the UI to refresh.
      return NextResponse.json(timeEntries, { status: 201 });
    }

    const timeEntry = await TimeEntry.create({
      date: new Date(`${date}T00:00:00`), // Trata a data como local, não UTC
      hours,
      description,
      activityTypeId,
      target,
      ownerId: session.user.id,
    });

    const populatedTimeEntry = await TimeEntry.findById(timeEntry._id).populate('activityTypeId');

    return NextResponse.json(populatedTimeEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
