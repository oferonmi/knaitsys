import React from 'react';
import { MathJaxContext, MathJax } from 'react-mathjax';

const LatexMathToHtmlRenderer = ({ latex }) => {
  return (
    <MathJaxContext>
      <div>
        <MathJax>{`\\(${latex}\\)`}</MathJax>
      </div>
    </MathJaxContext>
  );
};

export default LatexMathToHtmlRenderer;