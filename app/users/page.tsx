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
  Badge,
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
  Stack,
  HStack,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserForm from '@/components/UserForm';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário');
      }

      toast({
        title: 'Usuário deletado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchUsers();
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
    fetchUsers();
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
            <Heading size={{ base: 'lg', md: 'xl' }}>Usuários</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
              width={{ base: 'full', sm: 'auto' }}
            >
              {isMobile ? 'Novo' : 'Novo Usuário'}
            </Button>
          </Stack>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {users.length === 0 ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Text textAlign="center" py={8} color="gray.500">
                      Nenhum usuário encontrado
                    </Text>
                  </CardBody>
                </Card>
              ) : isMobile ? (
                // Mobile: Cards
                <VStack spacing={4}>
                  {users.map((user) => (
                    <Card key={user._id} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justifyContent="space-between">
                            <Text fontWeight="bold" fontSize="lg">{user.name}</Text>
                            <Badge
                              colorScheme={user.role === 'admin' ? 'red' : 'blue'}
                            >
                              {user.role === 'admin' ? 'Admin' : 'Viewer'}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize="sm" color="gray.600">{user.email}</Text>
                          
                          <Text fontSize="sm" color="gray.500">
                            Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </Text>
                          
                          <HStack spacing={2} pt={2}>
                            <Button
                              leftIcon={<EditIcon />}
                              size="sm"
                              flex={1}
                              onClick={() => handleEdit(user)}
                            >
                              Editar
                            </Button>
                            <Button
                              leftIcon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => handleDelete(user._id)}
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
                          <Th>Email</Th>
                          <Th>Função</Th>
                          <Th>Data de Criação</Th>
                          <Th>Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {users.map((user) => (
                          <Tr key={user._id}>
                            <Td>{user.name}</Td>
                            <Td>{user.email}</Td>
                            <Td>
                              <Badge
                                colorScheme={user.role === 'admin' ? 'red' : 'blue'}
                              >
                                {user.role === 'admin' ? 'Administrador' : 'Visualizador'}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="Editar usuário"
                                icon={<EditIcon />}
                                size="sm"
                                mr={2}
                                onClick={() => handleEdit(user)}
                              />
                              <IconButton
                                aria-label="Deletar usuário"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(user._id)}
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

          <UserForm
            isOpen={isOpen}
            onClose={onClose}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
