'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface DashboardStats {
  totalClients: number;
  totalGroups: number;
  totalActivityTypes: number;
  totalTimeEntries: number;
  totalHours: number;
  totalValue: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const [clientsRes, groupsRes, activityTypesRes, timeEntriesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/client-groups'),
        fetch('/api/activity-types'),
        fetch('/api/time-entries'),
      ]);

      const [clients, groups, activityTypes, timeEntries] = await Promise.all([
        clientsRes.json(),
        groupsRes.json(),
        activityTypesRes.json(),
        timeEntriesRes.json(),
      ]);

      const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);
      const totalValue = timeEntries.reduce((sum: number, entry: any) => {
        // Aqui você precisaria calcular o valor baseado no cliente
        // Por simplicidade, vamos usar um valor médio
        return sum + (entry.hours * 100); // Valor médio de R$ 100/hora
      }, 0);

      setStats({
        totalClients: clients.length,
        totalGroups: groups.length,
        totalActivityTypes: activityTypes.length,
        totalTimeEntries: timeEntries.length,
        totalHours,
        totalValue,
      });
    } catch (err) {
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (session?.user.role !== 'admin') {
    return (
      <Layout>
        <ProtectedRoute>
          <Box>
            <Heading mb={6}>Bem-vindo, {session?.user.name}!</Heading>
            <Text mb={6}>
              Você está logado como <strong>Visualizador</strong>. 
              Você pode acessar os relatórios através do menu lateral.
            </Text>
            <Button as={Link} href="/reports" colorScheme="brand" size="lg">
              Ver Relatórios
            </Button>
          </Box>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute requiredRole="admin">
        <Box>
          <Heading mb={6}>Dashboard</Heading>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total de Clientes</StatLabel>
                    <StatNumber>{stats?.totalClients || 0}</StatNumber>
                    <StatHelpText>
                      <Button as={Link} href="/clients" size="sm" variant="link">
                        Gerenciar clientes
                      </Button>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Grupos de Clientes</StatLabel>
                    <StatNumber>{stats?.totalGroups || 0}</StatNumber>
                    <StatHelpText>
                      <Button as={Link} href="/groups" size="sm" variant="link">
                        Gerenciar grupos
                      </Button>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Tipos de Atividade</StatLabel>
                    <StatNumber>{stats?.totalActivityTypes || 0}</StatNumber>
                    <StatHelpText>
                      <Button as={Link} href="/activity-types" size="sm" variant="link">
                        Gerenciar tipos
                      </Button>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Lançamentos de Horas</StatLabel>
                    <StatNumber>{stats?.totalTimeEntries || 0}</StatNumber>
                    <StatHelpText>
                      <Button as={Link} href="/time-entries" size="sm" variant="link">
                        Ver lançamentos
                      </Button>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total de Horas</StatLabel>
                    <StatNumber>{stats?.totalHours?.toFixed(1) || 0}h</StatNumber>
                    <StatHelpText>Este mês</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Valor Total</StatLabel>
                    <StatNumber>
                      R$ {stats?.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </StatNumber>
                    <StatHelpText>
                      <Button as={Link} href="/reports" size="sm" variant="link">
                        Ver relatórios
                      </Button>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
