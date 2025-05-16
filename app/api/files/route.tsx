import { NextResponse } from "next/server";

type FileNode = {
	id: string;
	name: string;
	isDirectory: boolean;
	content?: string;
	children?: FileNode[];
	parentId?: string;
};

// In-memory file storage (replace with persistent storage later)
let files: FileNode[] = [
	{
		id: "1",
		name: "index.js",
		isDirectory: false,
		content: '// Start coding here\nconsole.log("Hello, World!");\n',
	},
	{ id: "2", name: "src", isDirectory: true, children: [] },
];

export async function GET() {
  	return NextResponse.json(files);
}

export async function POST(request: Request) {
	const { id, name, content, isDirectory, parentId } = await request.json();
	const newFile: FileNode = {
		id: id || "uuid-placeholder",
		name,
		isDirectory,
		content,
		children: isDirectory ? [] : undefined,
		parentId,
	};
	if (parentId) {
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
		files = addToNode(files);
	} else {
		files.push(newFile);
	}
	return NextResponse.json({ message: "File created" });
}

export async function DELETE(request: Request) {
	const { id } = await request.json();
	const deleteFromNode = (nodes: FileNode[]): FileNode[] => {
		return nodes
		.filter((node) => node.id !== id)
		.map((node) => ({
			...node,
			children: node.children ? deleteFromNode(node.children) : node.children,
		}));
	};
	files = deleteFromNode(files);
	return NextResponse.json({ message: "File deleted" });
}

export async function PATCH(request: Request) {
	const { id, name } = await request.json();
	const renameInNode = (nodes: FileNode[]): FileNode[] => {
		return nodes.map((node) => {
			if (node.id === id) {
				return { ...node, name };
			}
			if (node.children) {
				return { ...node, children: renameInNode(node.children) };
			}
			return node;
		});
	};
	files = renameInNode(files);
	return NextResponse.json({ message: "File renamed" });
}
