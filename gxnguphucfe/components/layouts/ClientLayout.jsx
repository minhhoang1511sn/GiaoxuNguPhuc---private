'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layouts/Header/Header';
import Footer from '@/components/layouts/Footer/Footer';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isHidden = pathname.startsWith('/admin') || pathname.startsWith('/auth');

  return (
    <>
      {!isHidden && <Header />}
      {children}
      {!isHidden && <Footer />}
    </>
  );
}