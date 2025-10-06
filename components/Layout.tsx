'use client';

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  useColorMode,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  MoonIcon, 
  SunIcon,
  HamburgerIcon,
  SettingsIcon,
  TimeIcon,
  ViewIcon,
  EditIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';

interface LayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: LayoutProps) => {
  const { data: session } = useSession();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const isAdmin = session?.user.role === 'admin';

  const navigationItems = [
    ...(isAdmin ? [
      { label: 'Dashboard', href: '/dashboard', icon: TimeIcon },
      { label: 'Clientes', href: '/clients', icon: EditIcon },
      { label: 'Grupos', href: '/groups', icon: SettingsIcon },
      { label: 'Tipos de Atividade', href: '/activity-types', icon: SettingsIcon },
      { label: 'Usuários', href: '/users', icon: EditIcon },
      { label: 'Lançamentos', href: '/time-entries', icon: TimeIcon },
    ] : []),
    { label: 'Relatórios', href: '/reports', icon: ViewIcon },
  ];

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box bg={bg} borderBottom="1px" borderColor={borderColor} px={4} py={3} position="sticky" top={0} zIndex={1000}>
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <IconButton aria-label="Menu" icon={<HamburgerIcon />} variant="ghost" display={{ base: 'flex', md: 'none' }} onClick={onOpen} />
            <Text fontSize="xl" fontWeight="bold" color="brand.500">Acerto Dev</Text>
          </HStack>
          <HStack spacing={4}>
            <IconButton aria-label="Toggle color mode" icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode} variant="ghost" />
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">{session?.user.name}</MenuButton>
              <MenuList>
                <MenuItem><Text fontSize="sm" color="gray.500">{session?.user.email}</Text></MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleSignOut}>Sair</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>
      <Flex>
        <Box w={{ base: 0, md: 250 }} bg={bg} borderRight="1px" borderColor={borderColor} minH="calc(100vh - 70px)" display={{ base: 'none', md: 'block' }}>
          <VStack align="stretch" spacing={0} p={4}>
            {navigationItems.map((item) => (<ChakraLink key={item.href} as={Link} href={item.href} _hover={{ textDecoration: 'none' }}><Button variant="ghost" leftIcon={<item.icon />} justifyContent="flex-start" w="full" size="sm">{item.label}</Button></ChakraLink>))}
          </VStack>
        </Box>
        <Box flex="1" p={6}>{children}</Box>
      </Flex>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody><VStack align="stretch" spacing={2}>{navigationItems.map((item) => (<ChakraLink key={item.href} as={Link} href={item.href} onClick={onClose} _hover={{ textDecoration: 'none' }}><Button variant="ghost" leftIcon={<item.icon />} justifyContent="flex-start" w="full" size="sm">{item.label}</Button></ChakraLink>))}</VStack></DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Carregando...</Text>
      </Box>
    );
  }

  if (!session) {
    return <>{children}</>; // Para páginas públicas como a de login
  }

  // Se a sessão existe, renderiza o layout autenticado
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
