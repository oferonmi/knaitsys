// Note: Markdown renderer with LaTeX support
import React from 'react';
// import Markdown from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Heading1 } from 'lucide-react';
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {unified} from 'unified'

// const processor = unified()
//   .use(remarkParse)
//   .use(remarkGfm)
//   .use(remarkMath)
//   .use(remarkRehype, {allowDangerousHtml: true})
//   .use(rehypeSanitize)
//   .use(rehypeStringify)


const renderers = {
    inlineMath: ({ value }) => <InlineMath math={value} />,
    math: ({ value }) => <BlockMath math={value} />,
    think: ({ children }) => (
        <blockquote className="font-mono">{children}</blockquote>
    ),
    code: ({node, inline, className, children, ...props}) => {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
            <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
        ) : (
            <code className={className} {...props} />
        )
    }
};

const preprocessContent = (content) => {
    // Example preprocessing to wrap LaTeX expressions in $...$ or $$...$$
    return content.replace(/\$\$(.*?)\$\$/g, '$$ $1 $$').replace(/\$(.*?)\$/g, '$ $1 $').replace(/\[(.*?)\]/g, '$ $1 $');
    // return content;
    // const file = await processor.process(content);
    // return String(file.value);
}

const MarkdownWithLaTeXRenderer = ({ content }) => {
    const processedContent = preprocessContent(content);
    return (
        // <main>{processedContent}</main>
        <ReactMarkdown
            components={renderers}
            children={processedContent}
            remarkPlugins={[remarkGfm, remarkMath, remarkParse, remarkRehype]}
            rehypePlugins={[rehypeSanitize, rehypeStringify, rehypeRaw, rehypeKatex]}
        />
    //     <Markdown components={renderers}>
    //         {processedContent}
    //     </Markdown>
    );
};

export default MarkdownWithLaTeXRenderer;