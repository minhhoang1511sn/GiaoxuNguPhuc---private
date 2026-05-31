'use client';

import { usePathname } from 'next/navigation';
import Header from './Header/Header';
import Footer from './Footer/Footer';

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