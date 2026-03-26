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
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';
import { format, startOfMonth, endOfMonth, isWeekend, addDays } from 'date-fns';

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
  isCopy?: boolean;
}

export default function TimeEntryForm({ isOpen, onClose, timeEntry, onSuccess, isCopy = false }: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    date: timeEntry?.date || new Date().toISOString().split('T')[0],
    hours: timeEntry?.hours || 0,
    description: timeEntry?.description || '',
    activityTypeId: timeEntry?.activityTypeId || '',
    targetType: timeEntry?.target.type || 'client',
    targetId: timeEntry?.target.id || '',
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (timeEntry) {
        // Garante que o formulário seja preenchido ao editar ou copiar
        setFormData({
          date: new Date(timeEntry.date).toISOString().split('T')[0],
          hours: timeEntry.hours,
          description: timeEntry.description,
          activityTypeId: timeEntry.activityTypeId,
          targetType: timeEntry.target.type,
          targetId: timeEntry.target.id,
        });
        
        if (isCopy) {
          setSelectedDates([new Date(timeEntry.date).toISOString().split('T')[0]]);
        }
      } else {
        // Reseta para o estado inicial ao criar um novo
        resetFormState();
      }
    }
  }, [isOpen, timeEntry, isCopy]);

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
      const url = timeEntry && !isCopy ? `/api/time-entries/${timeEntry._id}` : '/api/time-entries';
      const method = timeEntry && !isCopy ? 'PUT' : 'POST';

      const body: any = {
        hours: formData.hours,
        description: formData.description,
        activityTypeId: formData.activityTypeId,
        target: {
          type: formData.targetType,
          id: formData.targetId,
        },
      };

      if (isCopy) {
        if (selectedDates.length === 0) {
          throw new Error('Selecione pelo menos uma data para copiar');
        }
        body.dates = selectedDates;
      } else {
        body.date = formData.date;
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
        throw new Error(errorData.error || 'Erro ao salvar lançamento');
      }

      toast({
        title: isCopy ? 'Lançamentos copiados!' : (timeEntry ? 'Lançamento atualizado!' : 'Lançamento criado!'),
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
      setSelectedDates([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormState = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: '',
      activityTypeId: '',
      targetType: 'client',
      targetId: '',
    });
    setSelectedDates([]);
  }

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr].sort());
    }
  };

  const selectBusinessDaysOfMonth = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const businessDays: string[] = [];
    
    let current = start;
    while (current <= end) {
      if (!isWeekend(current)) {
        businessDays.push(format(current, 'yyyy-MM-dd'));
      }
      current = addDays(current, 1);
    }
    
    setSelectedDates(businessDays);
  };

  const handleClose = () => {
    resetFormState();
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={{ base: 'full', md: 'lg' }}>
      <ModalOverlay />
      <ModalContent m={{ base: 0, md: 4 }}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isCopy ? 'Copiar Lançamento' : (timeEntry ? 'Editar Lançamento' : 'Novo Lançamento')}
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

              {!isCopy ? (
                <FormControl isRequired>
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormControl>
              ) : (
                <FormControl isRequired>
                  <FormLabel>Datas para Cópia</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Input
                        type="date"
                        isRequired={false}
                        onChange={(e) => {
                          if (e.target.value) {
                            toggleDate(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Tooltip label="Selecionar dias úteis do mês atual">
                        <Button
                          leftIcon={<CalendarIcon />}
                          onClick={selectBusinessDaysOfMonth}
                          size="md"
                          colorScheme="blue"
                          variant="outline"
                          px={6}
                        >
                          Dias Úteis
                        </Button>
                      </Tooltip>
                    </HStack>
                    
                    <Wrap spacing={2}>
                      {selectedDates.map((date) => (
                        <WrapItem key={date}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="brand"
                          >
                            <TagLabel>{format(new Date(`${date}T12:00:00`), 'dd/MM/yyyy')}</TagLabel>
                            <TagCloseButton onClick={() => toggleDate(date)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    
                    {selectedDates.length > 0 && (
                      <Button size="xs" variant="ghost" onClick={() => setSelectedDates([])} colorScheme="red" alignSelf="flex-start">
                        Limpar todas as datas
                      </Button>
                    )}
                  </VStack>
                </FormControl>
              )}

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
              {isCopy ? 'Copiar para todas as datas' : (timeEntry ? 'Atualizar' : 'Criar')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
