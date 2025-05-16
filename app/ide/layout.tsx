import { FileSystemProvider } from "@/lib/fileSystem";
import "@/app/globals.css";

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
      <body>
        <FileSystemProvider>{children}</FileSystemProvider>
      </body>
    </html>
  );
}
