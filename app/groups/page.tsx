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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientGroupForm from '@/components/ClientGroupForm';

interface Client {
  _id: string;
  name: string;
  hourlyRate: number;
}

interface ClientGroup {
  _id: string;
  name: string;
  clientIds: Client[];
  createdAt: string;
  clients?: Client[]; // Add clients for the populated data
}

interface ClientGroupForForm {
  _id?: string;
  name: string;
  clientIds: string[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ClientGroupForForm | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/client-groups');
      if (!response.ok) {
        throw new Error('Erro ao carregar grupos');
      }
      const data = await response.json();
      setGroups(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: ClientGroup) => {
    // Transform for the form component which expects clientIds as string[]
    setSelectedGroup({
      ...group,
      clientIds: group.clientIds.map(client => client._id), // Convert Client[] to string[]
    } as any);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedGroup(null);
    onOpen();
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja deletar este grupo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client-groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar grupo');
      }

      toast({
        title: 'Grupo deletado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchGroups();
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
    fetchGroups();
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
            <Heading>Grupos de Clientes</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
            >
              Novo Grupo
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
                {groups.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    Nenhum grupo encontrado
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nome do Grupo</Th>
                        <Th>Clientes</Th>
                        <Th>Data de Criação</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {groups.map((group) => (
                        <Tr key={group._id}>
                          <Td>
                            <Text fontWeight="bold">{group.name}</Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Badge colorScheme="blue" size="sm">
                                {group.clientIds.length} cliente(s)
                              </Badge>
                              <Text fontSize="sm" color="gray.600">
                                {group.clientIds.map(client => client.name).join(', ')}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Editar grupo"
                              icon={<EditIcon />}
                              size="sm"
                              mr={2}
                              onClick={() => handleEdit(group)}
                            />
                            <IconButton
                              aria-label="Deletar grupo"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(group._id)}
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

          <ClientGroupForm
            isOpen={isOpen}
            onClose={onClose}
            group={selectedGroup}
            onSuccess={handleSuccess}
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
