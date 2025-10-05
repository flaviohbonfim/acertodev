'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
  Container,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="md">
        <Box
          bg={bg}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            <Heading size="lg" color="brand.500">
              Acerto Dev
            </Heading>
            <Text color="gray.600">
              Faça login para acessar o sistema
            </Text>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Senha</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Entrando..."
                >
                  Entrar
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
