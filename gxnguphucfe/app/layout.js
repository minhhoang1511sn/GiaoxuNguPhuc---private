import './globals.css';
import ClientLayout from '../app/components/layouts/ClientLayout';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: 'Giáo xứ Ngũ Phúc',
  description: 'Website Giáo xứ Ngũ Phúc',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}