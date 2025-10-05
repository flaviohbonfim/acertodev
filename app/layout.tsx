import { Providers } from './providers';

export const metadata = {
  title: 'Acerto Dev - Controle de Horas',
  description: 'Sistema de controle de horas e faturamento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
