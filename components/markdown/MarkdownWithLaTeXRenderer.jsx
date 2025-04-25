import React from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import remarkGfm from 'remark-gfm';

// Create a wrapper component for LaTeX content that ensures string input
const LaTeXWrapper = ({ children }) => {
    // Convert children to string if needed
    const content = React.Children.map(children, child => {
        if (typeof child === 'string') {
            // Handle both inline and block math expressions
            return child
                .replace(/`\$\$(.*?)\$\$`/g, '$$$$1$$') // Remove backticks from block math
                .replace(/`\$(.*?)\$`/g, '$$1')         // Remove backticks from inline math
                .replace(/`(.*?)`/g, (_, p1) => {       // Handle code blocks with math
                    return p1.match(/[\\\[\]{}()+\-*/=<>~_%^&]|\\[a-zA-Z]+/) 
                        ? `$${p1}$` 
                        : `\`${p1}\``
                });
        }
        if (React.isValidElement(child)) {
            return child.props.children;
        }
        return '';
    }).join('');

    return content ? <Latex>{content}</Latex> : null;
};

const renderers = {
    h1: ({ children}) => (
        <h1 className="font-bold">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="font-bold">
            {children}
        </h2>
    ),
    h3: ({ children}) => (
        <h3 className="font-bold">
            {children}
        </h3>
    ),
    h4: ({ children}) => (
        <h4 className="font-bold">
            {children}
        </h4>
    ),
    h5: ({ children}) => (
        <h5 className="font-bold">
            {children}
        </h5>
    ),
    h6: ({ children}) => (
        <h6 className="font-bold">
            {children}
        </h6>
    ),
    p: ({ children }) => {
        const hasLatex = React.Children.toArray(children).some(child => {
            if (typeof child !== 'string') return false;
            return child.match(/(\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\]|`.*?`)/);
        });
        return hasLatex ? <LaTeXWrapper>{children}</LaTeXWrapper> : <p>{children}</p>;
    },
    strong: ({ children }) => (
        <strong className="">{children}</strong>
    ),
    em: ({ children }) => (
        <em>{children}</em>
    ),
    pre: ({ children }) => {
        return (
            <div className="">
                <pre className="">{children}</pre>
            </div>
        );
    },
    ul: ({ children }) => (
        <ul>{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="">{children}</li>
    ),
    table: ({ children }) => (
        <div className="">
            <table className="">{children}</table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="">{children}</thead>
    ),
    th: ({ children }) => (
        <th className="">{children}</th>
    ),
    td: ({ children }) => (
        <td className="">{children}</td>
    ),
    blockquote: ({ children }) => (
        <blockquote className="">{children}</blockquote>
    ),
    code: ({ children }) => {
        if (typeof children === 'string') {
            // Check if the code block contains math
            const hasMath = children.match(/[\\\[\]{}()+\-*/=<>~_%^&]|\\[a-zA-Z]+/);
            if (hasMath) {
                return <LaTeXWrapper>{`$${children}$`}</LaTeXWrapper>;
            }
        }
        return <code>{children}</code>;
    },
    inlineCode: ({ children }) => {
        if (typeof children === 'string') {
            // Check for LaTeX math expressions
            if (children.match(/(\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/)) {
                return <LaTeXWrapper>{children.replace(/`/g, '')}</LaTeXWrapper>;
            }
            // Check if the content looks like math
            if (children.match(/[\\\[\]{}()+\-*/=<>~_%^&]|\\[a-zA-Z]+/)) {
                return <LaTeXWrapper>{`$${children}$`}</LaTeXWrapper>;
            }
        }
        return <code>{children}</code>;
    }
};

const preprocessContent = (content) => {
    if (!content) return '';
    
    return content
        // Handle code blocks with math expressions
        .replace(/`(\$\$.*?\$\$)`/g, '$1')
        .replace(/`(\$.*?\$)`/g, '$1')
        // Convert square bracket math to LaTeX delimiters
        .replace(/\[([\s\S]*?)\]/g, (match, p1) => {
            // Skip if it looks like a markdown link or image
            if (p1.includes('](')) return match;
            
            const cleanedContent = p1.trim();
            // Detect if content looks like math
            const mathSymbols = /[\\\[\]{}()+\-*/=<>~_%^&]|\\[a-zA-Z]+/;
            if (!mathSymbols.test(cleanedContent)) return match;
            
            // Convert to LaTeX format for display math
            return cleanedContent.includes('\n') 
                ? `$$${cleanedContent}$$`
                : `$${cleanedContent}$`;
        })
        // Handle other LaTeX tags
        .replace(/\[latex\]([\s\S]*?)\[\/latex\]/g, (_, p1) => `$$${p1.trim()}$$`)
        .replace(/\[math\]([\s\S]*?)\[\/math\]/g, (_, p1) => `$$${p1.trim()}$$`)
        .replace(/\[inline\]([\s\S]*?)\[\/inline\]/g, (_, p1) => `$${p1.trim()}$`)
        .replace(/\[equation\]([\s\S]*?)\[\/equation\]/g, (_, p1) => `$$${p1.trim()}$$`);
};

const MarkdownWithLaTeXRenderer = ({ content }) => {
    const processedContent = preprocessContent(content);
    
    return (
        <ReactMarkdown
            components={renderers}
            remarkPlugins={[remarkGfm]}
        >
            {processedContent}
        </ReactMarkdown>
    );
};

export default MarkdownWithLaTeXRenderer;