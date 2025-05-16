"use client";

import { useState, useRef } from "react";
import { useFileSystem } from "@/lib/fileSystem";

type FileNode = {
    id: string;
    name: string;
    isDirectory: boolean;
    children?: FileNode[];
    content?: string;
    isCollapsed?: boolean;
    parentId?: string;
};

export default function FileExplorer() {
    const {
        files,
        currentFile,
        setCurrentFile,
        addFile,
        deleteFile,
        renameFile,
        toggleCollapse,
        moveFile,
    } = useFileSystem();
    const [newFileName, setNewFileName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        node: FileNode | null;
    } | null>(null);
    const dragRef = useRef<string | null>(null);

    const handleFileClick = (file: FileNode) => {
        if (!file.isDirectory) {
            setCurrentFile(file);
        } else {
            toggleCollapse(file.id);
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

    const handleContextMenu = (e: React.MouseEvent, node: FileNode | null) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        dragRef.current = id;
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetId: string | null) => {
        e.preventDefault();
        if (dragRef.current && dragRef.current !== targetId) {
            moveFile(dragRef.current, targetId);
        }
        dragRef.current = null;
    };

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map((node) => (
            <div
                key={node.id}
                className="select-none"
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                onDragOver={handleDragOver}
                onDrop={(e) =>
                    handleDrop(e, node.isDirectory ? node.id : node.parentId || null)
                }
                onContextMenu={(e) => handleContextMenu(e, node)}
            >
                <div
                    className={`flex items-center py-0.5 px-2 hover:bg-[#2a2d2e] ${
                        currentFile?.id === node.id ? "bg-[#37373d]" : ""
                    }`}
                    style={{ paddingLeft: `${depth * 14 + 8}px` }}
                >
                    {node.isDirectory && (
                        <span
                            className="codicon codicon-chevron-right mr-1 text-[#858585]"
                            style={{
                                transform: node.isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                                transition: "transform 0.2s",
                            }}
                            onClick={() => toggleCollapse(node.id)}
                        />
                    )}
                    <span
                        className={`codicon mr-1 ${
                        node.isDirectory ? "codicon-folder" : "codicon-file"
                        } ${node.isDirectory ? "text-[#90a4ae]" : "text-[#cccccc]"}`}
                    />
                    {renameId === node.id ? (
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename();
                                if (e.key === "Escape") {
                                setRenameId(null);
                                setRenameValue("");
                                }
                            }}
                            className="p-0 bg-[#3c3c3c] text-[#cccccc] border border-[#6fc3df] rounded w-full text-sm"
                            autoFocus
                        />
                    ) : (
                        <span
                            className="flex-1 text-sm text-[#cccccc] cursor-pointer"
                            onClick={() => handleFileClick(node)}
                            onDoubleClick={() => startRename(node.id, node.name)}
                        >
                            {node.name}
                        </span>
                    )}
                </div>
                {node.isDirectory &&
                !node.isCollapsed &&
                node.children &&
                renderTree(node.children, depth + 1)}
            </div>
        ));
    };

    return (
        <div
            className="bg-[#252526] h-full overflow-auto font-sans text-[#cccccc]"
            onContextMenu={(e) => handleContextMenu(e, null)}
        >
            <div className="px-2 py-1 sticky top-0 bg-[#252526] z-10">
                <h2 className="text-xs font-bold uppercase text-[#858585] mb-2">
                    Explorer
                </h2>
                <div className="flex mb-2">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="New file name"
                        className="p-1 bg-[#3c3c3c] text-[#cccccc] rounded text-sm mr-1 flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddFile()}
                    />
                    <button
                        onClick={() => handleAddFile()}
                        className="codicon codicon-new-file text-[#cccccc] hover:text-[#ffffff] p-1"
                        title="New File"
                    />
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="New folder name"
                        className="p-1 bg-[#3c3c3c] text-[#cccccc] rounded text-sm mr-1 flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
                    />
                    <button
                        onClick={() => handleAddFolder()}
                        className="codicon codicon-new-folder text-[#cccccc] hover:text-[#ffffff] p-1"
                        title="New Folder"
                    />
                </div>
            </div>
            {renderTree(files)}
            {contextMenu && (
                <div
                    className="absolute bg-[#1e1e1e] border border-[#3c3c3c] shadow-lg text-sm text-[#cccccc] rounded"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseLeave={() => setContextMenu(null)}
                >
                    <div
                        className="px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer"
                        onClick={() => {
                            handleAddFile(
                                contextMenu.node?.isDirectory
                                ? contextMenu.node.id
                                : contextMenu.node?.parentId
                            );
                            setContextMenu(null);
                        }}
                    >
                        New File
                    </div>
                    <div
                        className="px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer"
                        onClick={() => {
                            handleAddFolder(
                                contextMenu.node?.isDirectory
                                ? contextMenu.node.id
                                : contextMenu.node?.parentId
                            );
                            setContextMenu(null);
                        }}
                    >
                        New Folder
                    </div>
                    {contextMenu.node && (
                        <>
                            <div
                                className="px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer"
                                onClick={() => {
                                startRename(contextMenu.node!.id, contextMenu.node!.name);
                                setContextMenu(null);
                                }}
                            >
                                Rename
                            </div>
                            <div
                                className="px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer"
                                onClick={() => {
                                handleDelete(contextMenu.node!.id);
                                setContextMenu(null);
                                }}
                            >
                                Delete
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
