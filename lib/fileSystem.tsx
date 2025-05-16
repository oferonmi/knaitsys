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
    isCollapsed?: boolean;
};

type FileSystemContextType = {
    files: FileNode[];
    currentFile: FileNode | null;
    setCurrentFile: (file: FileNode | null) => void;
    addFile: (file: FileNode, parentId?: string) => void;
    deleteFile: (id: string) => void;
    renameFile: (id: string, newName: string) => void;
    toggleCollapse: (id: string) => void;
    moveFile: (id: string, targetId: string | null) => void;
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
        {
            id: uuidv4(),
            name: "src",
            isDirectory: true,
            children: [],
            isCollapsed: false,
        },
    ]);
    const [currentFile, setCurrentFile] = useState<FileNode | null>(null);

    const addFile = (file: FileNode, parentId?: string) => {
        const newFile = { ...file, id: uuidv4(), parentId, isCollapsed: false };
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

    const toggleCollapse = (id: string) => {
        setFiles((prev) => {
        const toggleInNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((node) => {
                if (node.id === id && node.isDirectory) {
                    return { ...node, isCollapsed: !node.isCollapsed };
                }
                if (node.children) {
                    return { ...node, children: toggleInNode(node.children) };
                }
                return node;
            });
        };
        return toggleInNode(prev);
        });
    };

    const moveFile = (id: string, targetId: string | null) => {
        setFiles((prev) => {
            let draggedNode: FileNode | null = null;
            // Remove the dragged node
            const removeNode = (nodes: FileNode[]): FileNode[] => {
                return nodes
                .filter((node) => {
                    if (node.id === id) {
                    draggedNode = node;
                    return false;
                    }
                    return true;
                })
                .map((node) => ({
                    ...node,
                    children: node.children ? removeNode(node.children) : node.children,
                }));
            };
            let newFiles = removeNode(prev);
            if (!draggedNode) return newFiles;

            // Add the dragged node to the target
            const addNode = (nodes: FileNode[], nodeToAdd: FileNode): FileNode[] => {
                if (!targetId) {
                    return [...nodes, { ...nodeToAdd, parentId: undefined }];
                }
                return nodes.map((node) => {
                    if (node.id === targetId && node.isDirectory) {
                        return {
                            ...node,
                            children: [
                                ...(node.children || []),
                                { ...nodeToAdd, parentId: targetId },
                            ],
                        };
                    }
                    if (node.children) {
                        return { ...node, children: addNode(node.children, nodeToAdd) };
                    }
                    return node;
                });
            };
            return addNode(newFiles, draggedNode);
        });
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
            toggleCollapse,
            moveFile,
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
