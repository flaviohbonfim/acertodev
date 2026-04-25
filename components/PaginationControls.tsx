'use client';

import { HStack, Button, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  if (totalPages <= 1) return null;

  return (
    <HStack justifyContent="center" spacing={4} pt={4}>
      <IconButton
        aria-label="Página anterior"
        icon={<ChevronLeftIcon />}
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage <= 1 || isLoading}
      />
      <Text fontSize="sm" color={textColor} whiteSpace="nowrap">
        Página {currentPage} de {totalPages}
      </Text>
      <IconButton
        aria-label="Próxima página"
        icon={<ChevronRightIcon />}
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage >= totalPages || isLoading}
      />
    </HStack>
  );
}
