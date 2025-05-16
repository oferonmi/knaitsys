"use client";

import { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type FileNode = {
    id: string;
    name: string;
    isDirectory: boolean;
    content?: string;
    children?: FileNode[];
    parentId?: string;
};

type FileSystemContextType = {
    files: FileNode[];
    currentFile: FileNode | null;
    setCurrentFile: (file: FileNode | null) => void;
    addFile: (file: FileNode, parentId?: string) => void;
    deleteFile: (id: string) => void;
    renameFile: (id: string, newName: string) => void;
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(
    undefined
);

export function FileSystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [files, setFiles] = useState<FileNode[]>([
        {
        id: uuidv4(),
        name: "index.js",
        isDirectory: false,
        content: '// Start coding here\nconsole.log("Hello, World!");\n',
        },
        { id: uuidv4(), name: "src", isDirectory: true, children: [] },
    ]);
    const [currentFile, setCurrentFile] = useState<FileNode | null>(null);

    const addFile = (file: FileNode, parentId?: string) => {
        const newFile = { ...file, id: uuidv4(), parentId };
        setFiles((prev) => {
            if (!parentId) {
                return [...prev, newFile];
            }
            const addToNode = (nodes: FileNode[]): FileNode[] => {
                return nodes.map((node) => {
                    if (node.id === parentId && node.isDirectory) {
                        return { ...node, children: [...(node.children || []), newFile] };
                    }
                    if (node.children) {
                        return { ...node, children: addToNode(node.children) };
                    }
                    return node;
                });
            };
            return addToNode(prev);
        });
    };

    const deleteFile = (id: string) => {
        setFiles((prev) => {
            const deleteFromNode = (nodes: FileNode[]): FileNode[] => {
                return nodes
                .filter((node) => node.id !== id)
                .map((node) => ({
                    ...node,
                    children: node.children
                    ? deleteFromNode(node.children)
                    : node.children,
                }));
            };
            return deleteFromNode(prev);
        });
        if (currentFile?.id === id) {
            setCurrentFile(null);
        }
    };

    const renameFile = (id: string, newName: string) => {
        setFiles((prev) => {
            const renameInNode = (nodes: FileNode[]): FileNode[] => {
                return nodes.map((node) => {
                    if (node.id === id) {
                        return { ...node, name: newName };
                    }
                    if (node.children) {
                        return { ...node, children: renameInNode(node.children) };
                    }
                    return node;
                });
            };
            return renameInNode(prev);
        });
        if (currentFile?.id === id) {
            setCurrentFile({ ...currentFile, name: newName });
        }
    };

    return (
        <FileSystemContext.Provider
            value={{
                files,
                currentFile,
                setCurrentFile,
                addFile,
                deleteFile,
                renameFile,
            }}
        >
            {children}
        </FileSystemContext.Provider>
    );
}

export function useFileSystem() {
    const context = useContext(FileSystemContext);
    if (!context) {
        throw new Error("useFileSystem must be used within a FileSystemProvider");
    }
    return context;
}
