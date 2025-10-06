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

interface ActivityType {
  _id?: string;
  name: string;
}

interface ActivityTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  activityType?: ActivityType | null;
  onSuccess: () => void;
}

export default function ActivityTypeForm({ isOpen, onClose, activityType, onSuccess }: ActivityTypeFormProps) {
  const [formData, setFormData] = useState({
    name: activityType?.name || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (activityType) {
      setFormData({
        name: activityType.name,
      });
    } else {
      setFormData({ name: '' });
    }
  }, [activityType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = activityType ? `/api/activity-types/${activityType._id}` : '/api/activity-types';
      const method = activityType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar tipo de atividade');
      }

      toast({
        title: activityType ? 'Tipo de atividade atualizado!' : 'Tipo de atividade criado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
      setFormData({ name: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={{ base: 'full', md: 'md' }}>
      <ModalOverlay />
      <ModalContent m={{ base: 0, md: 4 }}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {activityType ? 'Editar Tipo de Atividade' : 'Novo Tipo de Atividade'}
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
                <FormLabel>Nome do Tipo de Atividade</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Desenvolvimento, Consultoria, Suporte"
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
              {activityType ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
