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
  Stack,
  HStack,
  VStack,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientForm from '@/components/ClientForm';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
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
    } finally {
      setClientToDelete(null);
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
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'stretch', sm: 'center' }}
            mb={6}
            spacing={4}
          >
            <Heading size={{ base: 'lg', md: 'xl' }}>Clientes</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
              width={{ base: 'full', sm: 'auto' }}
            >
              {isMobile ? 'Novo' : 'Novo Cliente'}
            </Button>
          </Stack>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {clients.length === 0 ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Text textAlign="center" py={8} color="gray.500">
                      Nenhum cliente encontrado
                    </Text>
                  </CardBody>
                </Card>
              ) : isMobile ? (
                // Mobile: Cards
                <VStack spacing={4}>
                  {clients.map((client) => (
                    <Card key={client._id} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <Text fontWeight="bold" fontSize="lg">{client.name}</Text>
                          
                          {client.cnpj && (
                            <HStack>
                              <Text fontSize="sm" color="gray.500">CNPJ:</Text>
                              <Badge colorScheme="green" variant="outline">
                                {client.cnpj}
                              </Badge>
                            </HStack>
                          )}
                          
                          {client.email && (
                            <HStack>
                              <Text fontSize="sm" color="gray.500">Email:</Text>
                              <Text fontSize="sm">{client.email}</Text>
                            </HStack>
                          )}
                          
                          <Divider />
                          
                          <HStack justifyContent="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.500">Valor/Hora</Text>
                              <Text fontWeight="bold" color="green.500" fontSize="lg">
                                R$ {client.hourlyRate.toLocaleString('pt-BR', { 
                                  minimumFractionDigits: 2 
                                })}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="sm" color="gray.500">Criado em</Text>
                              <Text fontSize="sm">
                                {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={2} pt={2}>
                            <Button
                              leftIcon={<EditIcon />}
                              size="sm"
                              flex={1}
                              onClick={() => handleEdit(client)}
                            >
                              Editar
                            </Button>
                            <Button
                              leftIcon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => handleDeleteClick(client._id)}
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
                                onClick={() => handleDeleteClick(client._id)}
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

          <ClientForm
            isOpen={isOpen}
            onClose={onClose}
            client={selectedClient}
            onSuccess={handleSuccess}
          />

          <ConfirmDialog
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDeleteConfirm}
            title="Confirmar Exclusão"
            message="Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita."
            confirmText="Deletar"
            cancelText="Cancelar"
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
