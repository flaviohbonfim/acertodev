'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Alert,
  AlertIcon,
  useToast,
  Checkbox,
  Text,
  Box,
} from '@chakra-ui/react';

interface Client {
  _id: string;
  name: string;
  hourlyRate: number;
}

interface ClientGroup {
  _id?: string;
  name: string;
  clientIds: string[];
}

interface ClientGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  group?: ClientGroup | null;
  onSuccess: () => void;
}

export default function ClientGroupForm({ isOpen, onClose, group, onSuccess }: ClientGroupFormProps) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    clientIds: group?.clientIds || [],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }
      const data = await response.json();
      setClients(data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = group ? `/api/client-groups/${group._id}` : '/api/client-groups';
      const method = group ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar grupo');
      }

      toast({
        title: group ? 'Grupo atualizado!' : 'Grupo criado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
      setFormData({ name: '', clientIds: [] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', clientIds: [] });
    setError('');
    onClose();
  };

  const handleClientToggle = (clientId: string, isChecked: boolean) => {
    if (isChecked) {
      setFormData({
        ...formData,
        clientIds: [...formData.clientIds, clientId],
      });
    } else {
      setFormData({
        ...formData,
        clientIds: formData.clientIds.filter(id => id !== clientId),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {group ? 'Editar Grupo' : 'Novo Grupo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Nome do Grupo</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do grupo"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Clientes</FormLabel>
                <Box maxH="200px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={3}>
                  {clients.length === 0 ? (
                    <Text color="gray.500">Nenhum cliente disponível</Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {clients.map((client) => (
                        <Checkbox
                          key={client._id}
                          isChecked={formData.clientIds.includes(client._id)}
                          onChange={(e) => handleClientToggle(client._id, e.target.checked)}
                        >
                          <Box>
                            <Text fontWeight="medium">{client.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              R$ {client.hourlyRate.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2 
                              })}/hora
                            </Text>
                          </Box>
                        </Checkbox>
                      ))}
                    </VStack>
                  )}
                </Box>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {formData.clientIds.length} cliente(s) selecionado(s)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isLoading}
              loadingText="Salvando..."
              isDisabled={formData.clientIds.length === 0}
            >
              {group ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
