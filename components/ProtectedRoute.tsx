'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'viewer';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, requiredRole, redirectTo, router]);

  if (status === 'loading') {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Verificando permissões...</Text>
        </VStack>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">
            Acesso Negado
          </Text>
          <Text>
            Você não tem permissão para acessar esta página.
          </Text>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
}
