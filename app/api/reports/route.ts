import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
import Client from '@/models/Client';
import ClientGroup from '@/models/ClientGroup';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Data inicial e final são obrigatórias' }, { status: 400 });
    }

    await connectDB();

    // Buscar todos os lançamentos no período
    const timeEntries = await TimeEntry.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('activityTypeId');

    // Buscar todos os clientes (sem filtro de ownerId)
    const clients = await Client.find({});
    const clientMap = new Map(clients.map(client => [client._id.toString(), client]));

    // Buscar todos os grupos (sem filtro de ownerId)
    const groups = await ClientGroup.find({}).populate('clientIds');
    const groupMap = new Map(groups.map(group => [group._id.toString(), group]));

    // Calcular relatório por cliente
    const reportByClient = new Map();

    for (const entry of timeEntries) {
      if (entry.target.type === 'client') {
        const clientId = entry.target.id.toString();
        const client = clientMap.get(clientId);
        
        if (client) {
          if (!reportByClient.has(clientId)) {
            reportByClient.set(clientId, {
              client: {
                id: client._id,
                name: client.name,
                hourlyRate: client.hourlyRate
              },
              totalHours: 0,
              totalValue: 0,
              entries: []
            });
          }

          const clientReport = reportByClient.get(clientId);
          clientReport.totalHours += entry.hours;
          clientReport.totalValue += entry.hours * client.hourlyRate;
          clientReport.entries.push({
            id: entry._id,
            date: entry.date,
            hours: entry.hours,
            description: entry.description,
            activityType: entry.activityTypeId.name
          });
        }
      } else if (entry.target.type === 'group') {
        const groupId = entry.target.id.toString();
        const group = groupMap.get(groupId);
        
        if (group && group.clientIds.length > 0) {
          // Rateio igual entre os clientes do grupo
          const hoursPerClient = entry.hours / group.clientIds.length;
          
          for (const client of group.clientIds) {
            const clientId = client._id.toString();
            
            if (!reportByClient.has(clientId)) {
              reportByClient.set(clientId, {
                client: {
                  id: client._id,
                  name: client.name,
                  hourlyRate: client.hourlyRate
                },
                totalHours: 0,
                totalValue: 0,
                entries: []
              });
            }

            const clientReport = reportByClient.get(clientId);
            clientReport.totalHours += hoursPerClient;
            clientReport.totalValue += hoursPerClient * client.hourlyRate;
            clientReport.entries.push({
              id: entry._id,
              date: entry.date,
              hours: hoursPerClient,
              description: `${entry.description} (Rateio do grupo: ${group.name})`,
              activityType: entry.activityTypeId.name
            });
          }
        }
      }
    }

    // Converter para array e ordenar por valor total
    const report = Array.from(reportByClient.values()).sort((a, b) => b.totalValue - a.totalValue);

    // Calcular totais gerais
    const totalHours = report.reduce((sum, client) => sum + client.totalHours, 0);
    const totalValue = report.reduce((sum, client) => sum + client.totalValue, 0);

    return NextResponse.json({
      period: {
        startDate,
        endDate
      },
      summary: {
        totalHours,
        totalValue,
        clientCount: report.length
      },
      clients: report
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
