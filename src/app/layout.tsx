import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Chatbot With Custom Data',
  description: 'AI Chatbot With Custom Data',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-auto h-screen   flex flex-col space-y-4">
          <header className="container sticky top-0 z-40 bg-white">
            <div className="h-16 border-b border-b-slate-200 py-4">
              <nav className="ml-4 pl-6 flex justify-around">
                <Link href="/" className="hover:text-slate-600 cursor-pointer">
                  Home
                </Link>
                <Link href="/data">AI Data</Link>
              </nav>
            </div>
          </header>
          <main className="flex w-full items-center justify-center flex-1 flex-col ">{children}</main>
        </div>
      </body>
    </html>
  );
}
