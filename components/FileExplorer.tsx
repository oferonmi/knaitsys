"use client";

import { useState } from "react";
import { useFileSystem } from "@/lib/fileSystem";

type FileNode = {
    id: string;
    name: string;
    isDirectory: boolean;
    children?: FileNode[];
    content?: string;
};

export default function FileExplorer() {
    const { files, setCurrentFile, addFile, deleteFile, renameFile } = useFileSystem();
    const [newFileName, setNewFileName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const handleFileClick = (file: FileNode) => {
        if (!file.isDirectory) {
        setCurrentFile(file);
        }
    };

    const handleAddFile = (parentId?: string) => {
        if (newFileName) {
            addFile(
                { id: crypto.randomUUID(), name: newFileName, isDirectory: false, content: "// New file\n" },
                parentId
            );
            setNewFileName("");
        }
    };

    const handleAddFolder = (parentId?: string) => {
        if (newFolderName) {
            addFile(
                { id: crypto.randomUUID(), name: newFolderName, isDirectory: true, children: [] },
                parentId
            );
            setNewFolderName("");
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this?")) {
            deleteFile(id);
        }
    };

    const startRename = (id: string, currentName: string) => {
        setRenameId(id);
        setRenameValue(currentName);
    };

    const handleRename = () => {
        if (renameId && renameValue) {
            renameFile(renameId, renameValue);
            setRenameId(null);
            setRenameValue("");
        }
    };

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map((node) => (
            <div
                key={node.id}
                style={{ paddingLeft: `${depth * 20}px` }}
                className="my-1"
            >
                <div className="flex items-center">
                    {renameId === node.id ? (
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleRename}
                            onKeyPress={(e) => e.key === "Enter" && handleRename()}
                            className="p-1 bg-gray-700 text-white rounded mr-2"
                            autoFocus
                        />
                    ) : (
                        <div
                            className="flex-1 cursor-pointer hover:bg-gray-700 p-1 rounded"
                            onClick={() => handleFileClick(node)}
                        >
                            {node.isDirectory ? "📁" : "📄"} {node.name}
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => startRename(node.id, node.name)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Rename"
                        >
                        ✏️
                        </button>
                        <button
                            onClick={() => handleDelete(node.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                        >
                        🗑️
                        </button>
                        {node.isDirectory && (
                            <>
                                <button
                                    onClick={() => handleAddFile(node.id)}
                                    className="text-green-400 hover:text-green-300"
                                    title="Add File"
                                >
                                📄+
                                </button>
                                <button
                                    onClick={() => handleAddFolder(node.id)}
                                    className="text-green-400 hover:text-green-300"
                                    title="Add Folder"
                                >
                                📁+
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {node.children && renderTree(node.children, depth + 1)}
            </div>
        ));
    };

    return (
        <div>
            <h2 className="text-lg font-bold mb-2">Files</h2>
            <div className="mb-4 space-y-2">
                <div className="flex">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="New file name"
                        className="p-2 bg-gray-700 text-white rounded mr-2 flex-1"
                    />
                    <button
                        onClick={() => handleAddFile()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded"
                    >
                        Add File
                    </button>
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="New folder name"
                        className="p-2 bg-gray-700 text-white rounded mr-2 flex-1"
                    />
                    <button
                        onClick={() => handleAddFolder()}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded"
                    >
                        Add Folder
                    </button>
                </div>
            </div>
            {renderTree(files)}
        </div>
    );
}
