'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalHours: number;
    totalValue: number;
    clientCount: number;
  };
  clients: Array<{
    client: {
      id: string;
      name: string;
      hourlyRate: number;
      cnpj?: string;
    };
    totalHours: number;
    totalValue: number;
    entries: Array<{
      id: string;
      date: string;
      hours: number;
      description: string;
      activityType: string;
    }>;
  }>;
}

export default function ReportsPage() {
  const { data: _session } = useSession();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Definir datas padrão (mês atual)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Erro',
        description: 'Selecione as datas inicial e final',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Gere um relatório antes de exportar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const headers = [
      'Cliente', 'CNPJ', 'Data', 'Horas', 'Descrição', 
      'Tipo de Atividade', 'Valor por Hora (R$)', 'Valor do Lançamento (R$)'
    ];

    const rows = reportData.clients.flatMap(clientData => 
      clientData.entries.map(entry => [
        `"${clientData.client.name}"`,
        `"${clientData.client.cnpj || ''}"`,
        new Date(entry.date).toLocaleDateString('pt-BR'),
        entry.hours.toFixed(2).replace('.', ','),
        `"${entry.description.replace(/"/g, '""')}"`,
        `"${entry.activityType}"`,
        clientData.client.hourlyRate.toFixed(2).replace('.', ','),
        (entry.hours * clientData.client.hourlyRate).toFixed(2).replace('.', ',')
      ].join(';'))
    );

    const csvContent = [
      headers.join(';'),
      ...rows
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `relatorio_${reportData.period.startDate}_a_${reportData.period.endDate}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <ProtectedRoute>
        <Box>
          <Heading mb={6}>Relatórios</Heading>

          <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
            <CardBody>
              <VStack spacing={4}>
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Data Inicial</FormLabel>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Data Final</FormLabel>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FormControl>
                </HStack>
                <Button
                  colorScheme="brand"
                  onClick={generateReport}
                  isLoading={loading}
                  loadingText="Gerando relatório..."
                  w="full"
                >
                  Gerar Relatório
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          )}

          {reportData && (
            <VStack spacing={6} align="stretch">
              {/* Resumo */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md">Resumo do Período</Heading>
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="green"
                      variant="outline"
                      onClick={exportToCSV}
                      size="sm"
                    >Exportar CSV</Button>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Stat>
                      <StatLabel>Total de Horas</StatLabel>
                      <StatNumber>{reportData.summary.totalHours.toFixed(1)}h</StatNumber>
                      <StatHelpText>
                        {reportData.period.startDate} a {reportData.period.endDate}
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Valor Total</StatLabel>
                      <StatNumber>
                        R$ {reportData.summary.totalValue.toLocaleString('pt-BR', { 
                          minimumFractionDigits: 2 
                        })}
                      </StatNumber>
                      <StatHelpText>
                        {reportData.summary.clientCount} cliente(s)
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Valor Médio por Hora</StatLabel>
                      <StatNumber>
                        R$ {reportData.summary.totalHours > 0 
                          ? (reportData.summary.totalValue / reportData.summary.totalHours).toFixed(2)
                          : '0,00'
                        }
                      </StatNumber>
                      <StatHelpText>Média ponderada</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Detalhamento por Cliente */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Heading size="md" mb={4}>Detalhamento por Cliente</Heading>
                  {reportData.clients.length === 0 ? (
                    <Text textAlign="center" py={8} color="gray.500">
                      Nenhum lançamento encontrado no período
                    </Text>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Cliente</Th>
                          <Th>Valor/Hora</Th>
                          <Th>Total Horas</Th>
                          <Th>Valor Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {reportData.clients.map((client) => (
                          <Tr key={client.client.id}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontWeight="bold">{client.client.name}</Text>
                                  {client.client.cnpj && (
                                    <Badge variant="outline">{client.client.cnpj}</Badge>
                                  )}
                                </HStack>
                                <Badge colorScheme="blue" size="sm">
                                  {client.entries.length} lançamento(s)
                                </Badge>
                              </VStack>
                            </Td>
                            <Td>
                              R$ {client.client.hourlyRate.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}
                            </Td>
                            <Td>{client.totalHours.toFixed(1)}h</Td>
                            <Td>
                              <Text fontWeight="bold" color="green.500">
                                R$ {client.totalValue.toLocaleString('pt-BR', { 
                                  minimumFractionDigits: 2 
                                })}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </VStack>
          )}
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
