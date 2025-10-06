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
} from '@chakra-ui/react';

interface Client {
  _id?: string;
  name: string;
  cnpj?: string;
  email?: string;
  hourlyRate: number;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

export default function ClientForm({ isOpen, onClose, client, onSuccess }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    cnpj: client?.cnpj || '',
    email: client?.email || '',
    hourlyRate: client?.hourlyRate || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        cnpj: client.cnpj || '',
        email: client.email || '',
        hourlyRate: client.hourlyRate || 0,
      });
    } else {
      setFormData({ name: '', cnpj: '', email: '', hourlyRate: 0 });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = client ? `/api/clients/${client._id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar cliente');
      }

      toast({
        title: client ? 'Cliente atualizado!' : 'Cliente criado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
      setFormData({ name: '', cnpj: '', email: '', hourlyRate: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', cnpj: '', email: '', hourlyRate: 0 });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={{ base: 'full', md: 'md' }}>
      <ModalOverlay />
      <ModalContent m={{ base: 0, md: 4 }}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
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
                <FormLabel>Nome do Cliente</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </FormControl>

              <FormControl>
                <FormLabel>CNPJ</FormLabel>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Valor por Hora (R$)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                />
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
            >
              {client ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
