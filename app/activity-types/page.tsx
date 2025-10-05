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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivityTypeForm from '@/components/ActivityTypeForm';

interface ActivityType {
  _id: string;
  name: string;
  createdAt: string;
}

export default function ActivityTypesPage() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      const response = await fetch('/api/activity-types');
      if (!response.ok) {
        throw new Error('Erro ao carregar tipos de atividade');
      }
      const data = await response.json();
      setActivityTypes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activityType: ActivityType) => {
    setSelectedActivityType(activityType);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedActivityType(null);
    onOpen();
  };

  const handleDelete = async (activityTypeId: string) => {
    if (!confirm('Tem certeza que deseja deletar este tipo de atividade?')) {
      return;
    }

    try {
      const response = await fetch(`/api/activity-types/${activityTypeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar tipo de atividade');
      }

      toast({
        title: 'Tipo de atividade deletado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchActivityTypes();
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
    fetchActivityTypes();
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
            <Heading>Tipos de Atividade</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="brand"
              onClick={handleCreate}
            >
              Novo Tipo
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
                {activityTypes.length === 0 ? (
                  <Text textAlign="center" py={8} color="gray.500">
                    Nenhum tipo de atividade encontrado
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nome</Th>
                        <Th>Data de Criação</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {activityTypes.map((activityType) => (
                        <Tr key={activityType._id}>
                          <Td>
                            <Text fontWeight="bold">{activityType.name}</Text>
                          </Td>
                          <Td>
                            {new Date(activityType.createdAt).toLocaleDateString('pt-BR')}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Editar tipo de atividade"
                              icon={<EditIcon />}
                              size="sm"
                              mr={2}
                              onClick={() => handleEdit(activityType)}
                            />
                            <IconButton
                              aria-label="Deletar tipo de atividade"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(activityType._id)}
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

          <ActivityTypeForm
            isOpen={isOpen}
            onClose={onClose}
            activityType={selectedActivityType}
            onSuccess={handleSuccess}
          />
        </Box>
      </ProtectedRoute>
    </Layout>
  );
}
