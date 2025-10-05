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
  HStack,
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

export default function TimeEntriesPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
    setSelectedTimeEntry(timeEntry);
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
            <Heading>Lançamentos de Horas</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
            >
              Novo Lançamento
            </Button>
          </Box>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                {timeEntries.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    Nenhum lançamento encontrado
                  </Text>
                ) : (
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
                )}
              </CardBody>
            </Card>
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
