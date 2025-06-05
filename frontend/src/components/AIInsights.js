import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaSpinner, 
  FaExclamationTriangle, 
  FaRobot, 
  FaSyncAlt, 
  FaLightbulb,
  FaCommentDots, 
  FaClock, 
  FaHistory,
} from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import '../css/AIInsights.css';

const AIInsights = ({ selectedFile, user }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const insightsSectionRef = useRef(null);  
 const fetchAiInsights = async (question = null) => {
    if (!selectedFile) return;
    
    try {
      setAiLoading(true);
      setAiError(null);
      
      const token = user?.token || user?.accessToken || (user?.data?.token);
      
      if (!token) {
        setAiError('Authentication token not found. Please log in again.');
        setAiLoading(false);
        return;
      }
      
      const response = await axios.post(
        `http://localhost:5000/api/excel/insights/${selectedFile._id}`, 
        { questionPrompt: question },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setAiInsights(response.data);
      
      if (question) {
        setPreviousQuestions(prev => [question, ...prev.slice(0, 4)]);
        setAiQuestion('');
      }
      
      if (insightsSectionRef.current) {
        insightsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiError(error.response?.data?.message || 'Failed to get AI insights. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  useEffect(() => {
    if (selectedFile) {
      setAiInsights(null);
      setAiError(null);
      setPreviousQuestions([]);
      setAiQuestion('');
    }
  }, [selectedFile]);
  
  const handleAiQuestionSubmit = (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) {
      return;
    }
    
    fetchAiInsights(aiQuestion.trim());
  };

  const processInsights = (insights) => {
    // If it's a simple question but got a long response, summarize it
    if (aiQuestion && 
        /\b(sum|average|mean|median|calculate|count|total)\b/i.test(aiQuestion) && 
        insights.length > 1000) {
      
      // Find the first paragraph that likely contains the direct answer
      const firstParagraph = insights.split('\n\n')[0];
      
      return `${firstParagraph}\n\n*[Full analysis available but summarized for brevity. Click "Show Full Analysis" to see more details.]*`;
    }
    
    return insights;
  };

  const renderInsightsContent = () => {
    if (!aiInsights) return null;
    
    // Check if this is a generic response for a vague query
    if (aiInsights.isGenericResponse) {
      return (
        <div className="ai-insights-content ai-guidance">
          <div 
            className="markdown-content guidance-content"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(marked.parse(aiInsights.insights)) 
            }}
          />
        </div>
      );
    }
    
    // Normal insights rendering
    return (
      <div className="ai-insights-content">
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(marked.parse(showFullAnalysis ? aiInsights.insights : processInsights(aiInsights.insights))) 
          }}
        />
        
        {aiQuestion && 
          /\b(sum|average|mean|median|calculate|count|total)\b/i.test(aiQuestion) && 
          aiInsights.insights.length > 1000 && (
          <button 
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="toggle-analysis-button"
          >
            {showFullAnalysis ? "Show Summary" : "Show Full Analysis"}
          </button>
        )}
      </div>
    );
  };

  if (aiLoading) {
    return (
      <div className="ai-loading">
        <FaSpinner className="ai-spinner" />
        <p>Our AI is analyzing your data and generating insights...</p>
      </div>
    );
  }
  
  if (aiError) {
    return (
      <div className="ai-error">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <div className="error-message">
          <h4>Error getting AI insights</h4>
          <p>{aiError}</p>
        </div>
        <button className="retry-button" onClick={() => fetchAiInsights()}>
          <FaSyncAlt /> Try Again
        </button>
      </div>
    );
  }
    if (!aiInsights) {
    return (
      <div className="ai-empty-state">
        <div className="empty-state-icon">
          <FaRobot />
        </div>
        <h3>Get AI-Powered Insights for Your Data</h3>
        <p>Our AI can analyze your data and find patterns, correlations, and anomalies automatically.</p>
        
        <div className="ai-question-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (aiQuestion.trim()) {
              fetchAiInsights(aiQuestion.trim());
            } else {
              // Don't submit if empty
              return;
            }
          }}>
            <div className="question-input-wrapper">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask a specific question about your data..."
                className="ai-question-input exclude-global-styles"
              />
              <button 
                type="submit" 
                className="ask-button exclude-global-styles"
                disabled={!aiQuestion.trim() || aiLoading}
              >
                {aiLoading ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
                    <path d="M3.4 20.4L20.85 12.92c1.1-.48 1.1-2.06 0-2.54L3.4 2.81c-.5-.22-1.01-.14-1.37.22-.37.36-.46.89-.25 1.37l2.78 6.12c.15.33.15.71 0 1.04L1.78 17.7c-.21.47-.12 1.01.25 1.37.36.36.87.44 1.37.22z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
          <div className="ai-actions-container">
          <button 
            className="analyze-ai-button"
            onClick={() => {
              // Only proceed if there's a question or we're doing a general analysis
              if (aiQuestion.trim()) {
                fetchAiInsights(aiQuestion.trim());
              } else {
                fetchAiInsights();
              }
            }}
            disabled={aiLoading}
          >
            <FaLightbulb /> Analyze with AI
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ai-insights-results" ref={insightsSectionRef}>
      <div className="ai-insights-header">
        <h3><FaLightbulb /> AI Insights for {selectedFile.filename}</h3>
        <div className="analysis-timestamp">
          <FaClock /> Analyzed on {new Date(aiInsights.analysisDate).toLocaleString()}
        </div>
      </div>
      
      <div className="ai-question-form">
        <form onSubmit={handleAiQuestionSubmit}>
          <div className="question-input-wrapper">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask a specific question about your data..."
              className="ai-question-input exclude-global-styles"
            />
            <button 
              type="submit" 
              className="ask-button exclude-global-styles"
              disabled={!aiQuestion.trim() || aiLoading}
              title="Ask AI"
            >
              {aiLoading ? (
                <FaSpinner className="spinner" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
                  <path d="M3.4 20.4L20.85 12.92c1.1-.48 1.1-2.06 0-2.54L3.4 2.81c-.5-.22-1.01-.14-1.37.22-.37.36-.46.89-.25 1.37l2.78 6.12c.15.33.15.71 0 1.04L1.78 17.7c-.21.47-.12 1.01.25 1.37.36.36.87.44 1.37.22z" />
                </svg>
              )}
            </button>
          </div>
        </form>
        
        {previousQuestions.length > 0 && (
          <div className="previous-questions">
            <h4><FaHistory /> Previous Questions</h4>
            <ul>
              {previousQuestions.map((q, idx) => (
                <li key={idx} onClick={() => setAiQuestion(q)}>
                  <FaCommentDots /> {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="ai-insights-content">
        {renderInsightsContent()}
      </div>
      
      {/* Right-aligned button */}
      <div className="ai-insights-actions">
        <button 
          className="regenerate-button"
          onClick={() => fetchAiInsights()}
          disabled={aiLoading}
        >
          <FaSyncAlt /> Regenerate Insights
        </button>
      </div>
    </div>
  );
};

export default AIInsights;