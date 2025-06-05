import React, { useState, useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Update the TypedResponse component to accept an onComplete callback
const TypedResponse = ({ content, speed = 20, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(content);
  const charsPerFrameRef = useRef(5);
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Configure marked for proper header parsing
    marked.setOptions({
      headerIds: false,
      mangle: false,
      breaks: true,
      gfm: true
    });
    
    // Reset when content changes
    contentRef.current = content;
    indexRef.current = 0;
    setDisplayedContent('');
    setIsComplete(false);
    
    // Process text by complete lines rather than character by character
    const processNextChunk = () => {
      if (indexRef.current >= contentRef.current.length) {
        clearInterval(timerRef.current);
        setIsComplete(true);
        return;
      }
      
      let endIndex = indexRef.current;
      let currentChar = contentRef.current.charAt(indexRef.current);
      
      // Handle markdown headings - process the entire heading at once
      if (currentChar === '#') {
        // Check if this is actually a heading (at start of line or after newline)
        const isHeading = indexRef.current === 0 || 
                         contentRef.current.charAt(indexRef.current - 1) === '\n';
        
        if (isHeading) {
          // Find the end of this heading line
          endIndex = contentRef.current.indexOf('\n', indexRef.current);
          if (endIndex === -1) endIndex = contentRef.current.length;
          // Include the newline character if present
          if (endIndex < contentRef.current.length) {
            endIndex++;
          }
        } else {
          // It's a # character not at the start of a line
          endIndex = indexRef.current + 1;
        }
      } else {
        // For regular text, process word by word for smoother animation
        let charsProcessed = 0;
        
        while (charsProcessed < charsPerFrameRef.current && endIndex < contentRef.current.length) {
          // Stop at next heading
          if (contentRef.current.charAt(endIndex) === '\n' && 
              endIndex + 1 < contentRef.current.length && 
              contentRef.current.charAt(endIndex + 1) === '#') {
            endIndex++;  // Include the newline
            break;
          }
          
          // Process to the end of the current word
          endIndex++;
          charsProcessed++;
          
          // Break at word boundaries for smoother text flow
          const nextChar = contentRef.current.charAt(endIndex);
          if (nextChar === ' ' || nextChar === '\n' || nextChar === '.' || 
              nextChar === ',' || nextChar === ':' || nextChar === ';') {
            // Include the punctuation/space
            endIndex++;
            break;
          }
        }
      }
      
      // Safety check for boundaries
      if (endIndex === -1 || endIndex > contentRef.current.length) {
        endIndex = contentRef.current.length;
      }
      
      // Update displayed content
      const newText = contentRef.current.substring(0, endIndex);
      setDisplayedContent(newText);
      indexRef.current = endIndex;
    };
    
    // Start typing effect
    timerRef.current = setInterval(processNextChunk, speed);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [content, speed]);
  
  // Create a properly sanitized and parsed version of the markdown
  const renderedContent = useMemo(() => {
    if (!displayedContent) return '';
    try {
      return DOMPurify.sanitize(marked.parse(displayedContent));
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return displayedContent;
    }
  }, [displayedContent]);
  
  // Add effect to call the onComplete callback when animation finishes
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="typed-response-container">
      <div 
        className={`markdown-content ${!isComplete ? 'typing-animation' : ''}`} 
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
    </div>
  );
};

export default TypedResponse;