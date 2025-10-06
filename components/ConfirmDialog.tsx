'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  colorScheme?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  colorScheme = 'red',
  isLoading = false,
}: ConfirmDialogProps) {
  const iconColor = useColorModeValue('red.500', 'red.300');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'xs', md: 'md' }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent m={{ base: 4, md: 4 }}>
        <ModalHeader display="flex" alignItems="center" gap={3}>
          <WarningIcon color={iconColor} boxSize={6} />
          {title}
        </ModalHeader>
        <ModalBody>
          <Text>{message}</Text>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3} width="full" justify="flex-end">
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isLoading}
              flex={{ base: 1, md: 'initial' }}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={colorScheme}
              onClick={handleConfirm}
              isLoading={isLoading}
              flex={{ base: 1, md: 'initial' }}
            >
              {confirmText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
