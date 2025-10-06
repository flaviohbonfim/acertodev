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
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientGroupForm from '@/components/ClientGroupForm';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const handleDeleteClick = (groupId: string) => {
    setGroupToDelete(groupId);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(`/api/client-groups/${groupToDelete}`, {
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
    } finally {
      setGroupToDelete(null);
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
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'stretch', sm: 'center' }}
            mb={6}
            spacing={4}
          >
            <Heading size={{ base: 'lg', md: 'xl' }}>Grupos de Clientes</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
              width={{ base: 'full', sm: 'auto' }}
            >
              {isMobile ? 'Novo' : 'Novo Grupo'}
            </Button>
          </Stack>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {groups.length === 0 ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Text textAlign="center" py={8} color="gray.500">
                      Nenhum grupo encontrado
                    </Text>
                  </CardBody>
                </Card>
              ) : isMobile ? (
                // Mobile: Cards
                <VStack spacing={4}>
                  {groups.map((group) => (
                    <Card key={group._id} bg={cardBg} border="1px" borderColor={borderColor} w="full">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justifyContent="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" fontSize="lg">{group.name}</Text>
                              <Badge colorScheme="blue" size="sm">
                                {group.clientIds.length} cliente(s)
                              </Badge>
                            </VStack>
                          </HStack>
                          
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={2}>Clientes:</Text>
                            <Wrap spacing={2}>
                              {group.clientIds.map(client => (
                                <WrapItem key={client._id}>
                                  <Badge colorScheme="purple" variant="outline">
                                    {client.name}
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                          
                          <Text fontSize="sm" color="gray.500">
                            Criado em: {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                          </Text>
                          
                          <HStack spacing={2} pt={2}>
                            <Button
                              leftIcon={<EditIcon />}
                              size="sm"
                              flex={1}
                              onClick={() => handleEdit(group)}
                            >
                              Editar
                            </Button>
                            <Button
                              leftIcon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => handleDeleteClick(group._id)}
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
                              onClick={() => handleDeleteClick(group._id)}
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

          <ClientGroupForm
            isOpen={isOpen}
            onClose={onClose}
            group={selectedGroup}
            onSuccess={handleSuccess}
          />

          <ConfirmDialog
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDeleteConfirm}
            title="Confirmar Exclusão"
            message="Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita."
            confirmText="Deletar"
            cancelText="Cancelar"
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
