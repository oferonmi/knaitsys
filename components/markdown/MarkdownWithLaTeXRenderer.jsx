// Note: Markdown renderer with LaTeX support
import React from 'react';
// import Markdown from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
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
import {LatexMathToHtmlRenderer} from '@/components/maths/LatexMathToHtmlRenderer'

// const processor = unified()
//   .use(remarkParse)
//   .use(remarkGfm)
//   .use(remarkMath)
//   .use(remarkRehype, {allowDangerousHtml: true})
//   .use(rehypeSanitize)
//   .use(rehypeStringify)


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
        return <p className="">{children}</p>;
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
    inlineMath: ({ value }) => { return <InlineMath math={value} />},
    math: ({ value }) => { return <BlockMath math={value} />},
    think: ({children, ...props}) => {
        return <i className='italic' children={String(children)} {...props} />
    },
    // code: ({node, inline, className, children, ...props}) => {
    //     const match = /language-(\w+)/.exec(className || 'text-wrap')
    //     return !inline && match ? (
    //         <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
    //     ) : (
    //         <code className={className} {...props} />
    //     )
    // }
};

const preprocessContent = (content) => {
    // Example preprocessing to wrap LaTeX expressions in $...$ or $$...$$
    // return content
        // .replace(/^\[\n\s*([\s\S]*?)\s*\n\]$/, '$$ \n $1 \n $$') // for block math
        // .replace(/^\s*\[\s*([\s\S]*?)\s*\]\s*$/gm, '$$ \n $1 \n $$') // for block math $$\n$1\n$$
        // .replace(/\[\s*([\s\S]*?)\s*\]/g, '\( $1 \)'); // for inline math
    //     .replace(/<code>\s*\[\s*([\s\S]*?)\s*\]\s*<\/code>/g, '<code>\($1\)</code>') // for inline math
    //     .replace(/<pre>\s*\[\s*([\s\S]*?)\s*\]\s*<\/pre>/g, '<pre>$$\n$1\n$$</pre>') // for block math
    //     .replace(/\[\s*([\s\S]*?)\s*\]/g, '```math <InlineMath>$\($1\)$<\/InlineMath>```') // for inline math
    //     .replace(/```math\s*\[\s*([\s\S]*?)\s*\]\s*```/g, '```math\n$$\n$1\n$$\n```') // for block math
    //     .replace(/\[(?:[^][]|\[[^][]*\])*\]/g, '```math\n<InlineMath>\n$$1$<\/InlineMath>\n```') // for inline math
    //     .replace(/\$\$(.*?)\$\$/g, '$$\n$1\n$$') // for block math
    //     .replace(/\$(.*?)\$/g, '$$1$'); // for inline math
    return content;
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
            remarkPlugins={[remarkParse, [remarkRehype, remarkGfm, remarkMath, { allowDangerousHtml: true }], remarkMath]}
            rehypePlugins={[rehypeSanitize, rehypeStringify]}
            //  remarkFrontmatter, remarkGfm, remarkMath, rehypeHighlight,{style: dark, detect: true}], rehypeRaw, rehypeMathjax,]
        />
    //     <Markdown components={renderers}>
    //         {processedContent}
    //     </Markdown>
    );
};

export default MarkdownWithLaTeXRenderer;