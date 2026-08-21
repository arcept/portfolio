import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Manik Madaan — Product Design Leader',
  description: "Manik Madaan — Product Design Leader. Design systems, 0-to-1 product, and teams that ship with confidence. Case studies and background.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
