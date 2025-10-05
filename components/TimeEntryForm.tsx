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
  Select,
  Textarea,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Box,
} from '@chakra-ui/react';

interface Client {
  _id: string;
  name: string;
  hourlyRate: number;
}

interface ClientGroup {
  _id: string;
  name: string;
  clientIds: Client[];
}

interface ActivityType {
  _id: string;
  name: string;
}

interface TimeEntry {
  _id?: string;
  date: string;
  hours: number;
  description: string;
  activityTypeId: string;
  target: {
    type: 'client' | 'group';
    id: string;
  };
}

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry?: TimeEntry | null;
  onSuccess: () => void;
}

export default function TimeEntryForm({ isOpen, onClose, timeEntry, onSuccess }: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    date: timeEntry?.date || new Date().toISOString().split('T')[0],
    hours: timeEntry?.hours || 0,
    description: timeEntry?.description || '',
    activityTypeId: timeEntry?.activityTypeId || '',
    targetType: timeEntry?.target.type || 'client',
    targetId: timeEntry?.target.id || '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [clientsRes, groupsRes, activityTypesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/client-groups'),
        fetch('/api/activity-types'),
      ]);

      const [clientsData, groupsData, activityTypesData] = await Promise.all([
        clientsRes.json(),
        groupsRes.json(),
        activityTypesRes.json(),
      ]);

      setClients(clientsData);
      setGroups(groupsData);
      setActivityTypes(activityTypesData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = timeEntry ? `/api/time-entries/${timeEntry._id}` : '/api/time-entries';
      const method = timeEntry ? 'PUT' : 'POST';

      const body = {
        date: formData.date,
        hours: formData.hours,
        description: formData.description,
        activityTypeId: formData.activityTypeId,
        target: {
          type: formData.targetType,
          id: formData.targetId,
        },
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar lançamento');
      }

      toast({
        title: timeEntry ? 'Lançamento atualizado!' : 'Lançamento criado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: '',
        activityTypeId: '',
        targetType: 'client',
        targetId: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: '',
      activityTypeId: '',
      targetType: 'client',
      targetId: '',
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {timeEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
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
                <FormLabel>Data</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Horas</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                  placeholder="1.5"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a atividade realizada..."
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo de Atividade</FormLabel>
                <Select
                  value={formData.activityTypeId}
                  onChange={(e) => setFormData({ ...formData, activityTypeId: e.target.value })}
                  placeholder="Selecione o tipo de atividade"
                >
                  {activityTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Destino</FormLabel>
                <RadioGroup
                  value={formData.targetType}
                  onChange={(value) => setFormData({ ...formData, targetType: value as 'client' | 'group', targetId: '' })}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="client">Cliente</Radio>
                    <Radio value="group">Grupo</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  {formData.targetType === 'client' ? 'Cliente' : 'Grupo'}
                </FormLabel>
                <Select
                  value={formData.targetId}
                  onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                  placeholder={`Selecione o ${formData.targetType === 'client' ? 'cliente' : 'grupo'}`}
                >
                  {formData.targetType === 'client'
                    ? clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name} - R$ {client.hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h
                        </option>
                      ))
                    : groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name} ({group.clientIds.length} cliente(s))
                        </option>
                      ))}
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
              {timeEntry ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
