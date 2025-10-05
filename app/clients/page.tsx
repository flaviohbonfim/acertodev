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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientForm from '@/components/ClientForm';

interface Client {
  _id: string;
  name: string;
  cnpj?: string;
  email?: string;
  hourlyRate: number;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }
      const data = await response.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedClient(null);
    onOpen();
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar cliente');
      }

      toast({
        title: 'Cliente deletado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchClients();
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
    fetchClients();
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
            <Heading>Clientes</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
            >
              Novo Cliente
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
                {clients.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    Nenhum cliente encontrado
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nome</Th>
                        <Th>CNPJ</Th>
                        <Th>Email</Th>
                        <Th>Valor/Hora</Th>
                        <Th>Data de Criação</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {clients.map((client) => (
                        <Tr key={client._id}>
                          <Td>
                            <Text fontWeight="bold">{client.name}</Text>
                          </Td>
                          <Td>
                            {client.cnpj ? (
                              <Badge colorScheme="green" variant="outline">
                                {client.cnpj}
                              </Badge>
                            ) : (
                              <Text color="gray.500">-</Text>
                            )}
                          </Td>
                          <Td>{client.email || '-'}</Td>
                          <Td>
                            <Text fontWeight="bold" color="green.500">
                              R$ {client.hourlyRate.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}
                            </Text>
                          </Td>
                          <Td>
                            {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Editar cliente"
                              icon={<EditIcon />}
                              size="sm"
                              mr={2}
                              onClick={() => handleEdit(client)}
                            />
                            <IconButton
                              aria-label="Deletar cliente"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(client._id)}
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

          <ClientForm
            isOpen={isOpen}
            onClose={onClose}
            client={selectedClient}
            onSuccess={handleSuccess}
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
