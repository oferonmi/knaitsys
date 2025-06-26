import { FileSystemProvider } from "@/lib/fileSystem";
import "@/app/globals.css";
import { ThemeScript } from '@/components/ThemeScript';

export const metadata = {
    title: "Knaitsys - Code Editor",
    description: "Code Editor AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="bg-white dark:bg-gray-900 bg-cover bg-center">
        <ThemeScript />
        <FileSystemProvider>{children}</FileSystemProvider>
      </body>
    </html>
  );
}
