'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  Text,
  Badge,
  VStack,
  Stack,
  HStack,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import TimeEntryForm from '@/components/TimeEntryForm';

interface ActivityType {
  _id: string;
  name: string;
}

interface TimeEntry {
  _id: string;
  date: string;
  hours: number;
  description: string;
  activityTypeId: ActivityType;
  target: {
    type: 'client' | 'group';
    id: string;
  };
  createdAt: string;
}

interface TimeEntryForForm {
  _id?: string;
  date: string;
  hours: number;
  description: string;
  activityTypeId: string;
  target: {
    type: 'client' | 'group';
    id: string;
  };
}

export default function TimeEntriesPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntryForForm | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries');
      if (!response.ok) {
        throw new Error('Erro ao carregar lançamentos');
      }
      const data = await response.json();
      setTimeEntries(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (timeEntry: TimeEntry) => {
    // Transform for the form component which expects activityTypeId as string
    setSelectedTimeEntry({
      _id: timeEntry._id,
      date: timeEntry.date,
      hours: timeEntry.hours,
      description: timeEntry.description,
      activityTypeId: timeEntry.activityTypeId._id, // Convert ActivityType object to string
      target: timeEntry.target,
    });
    onOpen();
  };

  const handleCreate = () => {
    setSelectedTimeEntry(null);
    onOpen();
  };

  const handleDelete = async (timeEntryId: string) => {
    if (!confirm('Tem certeza que deseja deletar este lançamento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/time-entries/${timeEntryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar lançamento');
      }

      toast({
        title: 'Lançamento deletado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchTimeEntries();
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSuccess = () => {
    fetchTimeEntries();
  };

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="admin">
          <Box display="flex" justifyContent="center" py={8}>
            <Spinner size="xl" color="brand.500" />
          </Box>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute requiredRole="admin">
        <Box>
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'stretch', sm: 'center' }}
            mb={6}
            spacing={4}
          >
            <Heading size={{ base: 'lg', md: 'xl' }}>Lançamentos de Horas</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
              width={{ base: 'full', sm: 'auto' }}
            >
              {isMobile ? 'Novo' : 'Novo Lançamento'}
            </Button>
          </Stack>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {timeEntries.length === 0 ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Text textAlign="center" py={8} color="gray.500">
                      Nenhum lançamento encontrado
                    </Text>
                  </CardBody>
                </Card>
              ) : isMobile ? (
                // Mobile: Cards
                <VStack spacing={4}>
                  {timeEntries.map((entry) => (
                    <Card key={entry._id} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justifyContent="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.500">Data</Text>
                              <Text fontWeight="semibold">
                                {new Date(entry.date).toLocaleDateString('pt-BR')}
                              </Text>
                            </VStack>
                            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                              {entry.hours}h
                            </Badge>
                          </HStack>
                          
                          <Divider />
                          
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>Descrição</Text>
                            <Text fontSize="sm">{entry.description}</Text>
                          </Box>
                          
                          <HStack justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">Tipo de Atividade</Text>
                              <Badge colorScheme="purple" variant="outline">
                                {entry.activityTypeId.name}
                              </Badge>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="xs" color="gray.500">Destino</Text>
                              <Badge colorScheme={entry.target.type === 'client' ? 'green' : 'orange'}>
                                {entry.target.type === 'client' ? 'Cliente' : 'Grupo'}
                              </Badge>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={2} pt={2}>
                            <Button
                              leftIcon={<EditIcon />}
                              size="sm"
                              flex={1}
                              onClick={() => handleEdit(entry)}
                            >
                              Editar
                            </Button>
                            <Button
                              leftIcon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => handleDelete(entry._id)}
                            >
                              Deletar
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                // Desktop: Table
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Data</Th>
                          <Th>Horas</Th>
                          <Th>Descrição</Th>
                          <Th>Tipo de Atividade</Th>
                          <Th>Destino</Th>
                          <Th>Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {timeEntries.map((entry) => (
                          <Tr key={entry._id}>
                            <Td>
                              {new Date(entry.date).toLocaleDateString('pt-BR')}
                            </Td>
                            <Td>
                              <Text fontWeight="bold" color="blue.500">
                                {entry.hours}h
                              </Text>
                            </Td>
                            <Td>
                              <Text maxW="200px" isTruncated>
                                {entry.description}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" variant="outline">
                                {entry.activityTypeId.name}
                              </Badge>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Badge colorScheme={entry.target.type === 'client' ? 'green' : 'orange'}>
                                  {entry.target.type === 'client' ? 'Cliente' : 'Grupo'}
                                </Badge>
                                <Text fontSize="sm" color="gray.500">
                                  ID: {entry.target.id}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="Editar lançamento"
                                icon={<EditIcon />}
                                size="sm"
                                mr={2}
                                onClick={() => handleEdit(entry)}
                              />
                              <IconButton
                                aria-label="Deletar lançamento"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(entry._id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          <TimeEntryForm
            isOpen={isOpen}
            onClose={onClose}
            timeEntry={selectedTimeEntry}
            onSuccess={handleSuccess}
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
