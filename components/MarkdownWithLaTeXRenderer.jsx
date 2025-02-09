// Note: Markdown renderer with LaTeX support
import React from 'react';
// import Markdown from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Heading1 } from 'lucide-react';
import rehypeParse from 'rehype-parse'
import rehypeMathjax from 'rehype-mathjax'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import remarkFrontmatter from 'remark-frontmatter'
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
    h1: ({ children, id }) => (
        <h1 className="..." id={id}>
            {children}
        </h1>
    ),
    h2: ({ children, id }) => (
        <h2 className="..." id={id}>
        {children}
        </h2>
    ),
    h3: ({ children, id }) => (
        <h3 className="..." id={id}>
            {children}
        </h3>
    ),
    h4: ({ children, id }) => (
        <h4 className="..." id={id}>
            {children}
        </h4>
    ),
    h5: ({ children, id }) => (
        <h5 className="..." id={id}>
            {children}
        </h5>
    ),
    h6: ({ children, id }) => (
        <h6 className="..." id={id}>
            {children}
        </h6>
    ),
    p: ({ children }) => {
        return <p className="...">{children}</p>;
    },
    strong: ({ children }) => (
        <strong className="...">{children}</strong>
    ),
    em: ({ children }) => (
        <em>{children}</em>
    ),
    inlineMath: ({ value }) => <InlineMath math={value} />,
    math: ({ value }) => <BlockMath math={value} />,
    // think: ({ children }) => (
    //     <blockquote className="font-mono">{children}</blockquote>
    // ),
    think: ({node, ...props}) => {
        return <i style={{color: 'teal'}} children={String(node.children)} {...props} />
    },
    // code: ({node, inline, className, children, ...props}) => {
    //     const match = /language-(\w+)/.exec(className || '')
    //     return !inline && match ? (
    //         <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
    //     ) : (
    //         <code className={className} {...props} />
    //     )
    // }
};

const preprocessContent = (content) => {
    // Example preprocessing to wrap LaTeX expressions in $...$ or $$...$$
    return content
        .replace(/^\[\n\s*([\s\S]*?)\s*\n\]$/, '$$\n$1\n$$') // for block math
        .replace(/^\s*\[\s*([\s\S]*?)\s*\]\s*$/gm, '$$\n$1\n$$') // for block math
        .replace(/<code>\s*\[\s*([\s\S]*?)\s*\]\s*<\/code>/g, '<code>\($1\)</code>') // for inline math
        .replace(/<pre>\s*\[\s*([\s\S]*?)\s*\]\s*<\/pre>/g, '<pre>$$\n$1\n$$</pre>') // for block math
        // .replace(/\[\s*([\s\S]*?)\s*\]/g, '\($1\)') // for inline math
        .replace(/```math\s*\[\s*([\s\S]*?)\s*\]\s*```/g, '```math\n$$\n$1\n$$\n```') // for block math
        // .replace(/\[(?:[^][]|\[[^][]*\])*\]/g, '\($1\)'); // for inline math
        .replace(/\$\$(.*?)\$\$/g, '$$\n$1\n$$') // for block math
        .replace(/\$(.*?)\$/g, '$$1$'); // for inline math
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
            remarkPlugins={[remarkParse, remarkFrontmatter, remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeStringify]}
            //  [[rehypeParse, { fragment: true }], rehypeParse, rehypeKatex, rehypeHighlight,{style: dark, detect: true}], rehypeRaw, rehypeKatex]
        />
    //     <Markdown components={renderers}>
    //         {processedContent}
    //     </Markdown>
    );
};

export default MarkdownWithLaTeXRenderer;