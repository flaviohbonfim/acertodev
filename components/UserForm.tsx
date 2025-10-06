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
  Select,
  VStack,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';

interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function UserForm({ isOpen, onClose, user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'viewer' as 'admin' | 'viewer',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'viewer' });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = user ? `/api/users/${user._id}` : '/api/users';
      const method = user ? 'PUT' : 'POST';

      const body: any = { ...formData };
      if (user && !body.password) {
        delete body.password; // Não enviar senha vazia na edição
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar usuário');
      }

      toast({
        title: user ? 'Usuário atualizado!' : 'Usuário criado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '', role: 'viewer' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', role: 'viewer' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
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
                <FormLabel>Nome</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </FormControl>

              <FormControl isRequired={!user}>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={user ? 'Deixe em branco para manter a senha atual' : 'Senha'}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Função</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'viewer' })}
                >
                  <option value="viewer">Visualizador</option>
                  <option value="admin">Administrador</option>
                </Select>
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
              {user ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
