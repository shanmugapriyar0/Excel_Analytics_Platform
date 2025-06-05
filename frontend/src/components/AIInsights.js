import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaSyncAlt,
  FaLightbulb,
  FaCommentDots,
  FaClock,
  FaHistory,
  FaTrash,
  FaCopy, // Add this new import
} from "react-icons/fa";
import "../css/AIInsights.css";
import TypedResponse from './TypedResponse';

const AIInsights = ({ selectedFile, user }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false); 
  const [typingComplete, setTypingComplete] = useState(false); 
  const insightsSectionRef = useRef(null);
  // Add a new ref to track the answer content area
  const responseContentRef = useRef(null);

  const fetchAiInsights = async (question = null) => {
    if (!selectedFile) return;

    try {
      setAiLoading(true);
      setAiError(null);
      setTypingComplete(false);
      
      // Store the active question being processed
      if (question) {
        setActiveQuestion(question);
      } else {
        setActiveQuestion(null);
      }

      const token = user?.token || user?.accessToken || user?.data?.token;

      if (!token) {
        setAiError("Authentication token not found. Please log in again.");
        setAiLoading(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/excel/insights/${selectedFile._id}`,
        { questionPrompt: question },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiInsights(response.data);

      // Add to chat history with timestamp
      if (question) {
        const newHistoryItem = {
          id: Date.now(),
          question,
          response: response.data.insights,
          timestamp: new Date().toLocaleString(),
        };

        // Add to chat history and maintain most recent 10 items
        setChatHistory((prevHistory) =>
          [newHistoryItem, ...prevHistory.filter(item => item.question !== question)].slice(0, 10)
        );

        // Also update local storage for persistence
        const updatedHistory = [
          newHistoryItem, 
          ...chatHistory.filter(item => item.question !== question)
        ].slice(0, 10);
        
        localStorage.setItem(
          `chatHistory_${selectedFile._id}`,
          JSON.stringify(updatedHistory)
        );

        setPreviousQuestions((prev) => [question, ...prev.filter(q => q !== question).slice(0, 4)]);
        setAiQuestion("");
      }

      // Scroll to the answer content after a small delay to ensure DOM is updated
      setTimeout(() => {
        if (responseContentRef.current) {
          responseContentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setAiError(
        error.response?.data?.message ||
          "Failed to get AI insights. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };
  useEffect(() => {
    if (selectedFile) {
      setAiInsights(null);
      setAiError(null);
      setPreviousQuestions([]);
      setAiQuestion("");

      // Load chat history from localStorage
      const storedHistory = localStorage.getItem(
        `chatHistory_${selectedFile._id}`
      );
      if (storedHistory) {
        try {
          setChatHistory(JSON.parse(storedHistory));
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    }
  }, [selectedFile]);

  // Updated handleAiQuestionSubmit function
  const handleAiQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!aiQuestion.trim() || aiLoading) return;
    
    // Set the active question to the current question
    setActiveQuestion(aiQuestion);
    
    // Call fetchAiInsights with the question
    await fetchAiInsights(aiQuestion);
  };

  const processInsights = (insights) => {
    // If it's a simple question but got a long response, summarize it
    if (
      aiQuestion &&
      /\b(sum|average|mean|median|calculate|count|total)\b/i.test(aiQuestion) &&
      insights.length > 1000
    ) {
      // Find the first paragraph that likely contains the direct answer
      const firstParagraph = insights.split("\n\n")[0];

      return `${firstParagraph}\n\n*[Full analysis available but summarized for brevity. Click "Show Full Analysis" to see more details.]*`;
    }

    return insights;
  };

  const renderInsightsContent = () => {
    if (!aiInsights) return null;

    // Check if this is a generic response for a vague query
    if (aiInsights.isGenericResponse) {
      return (
        <div className="ai-insights-content ai-guidance" ref={responseContentRef}>
          <TypedResponse 
            content={aiInsights.insights}
            speed={20}
            onComplete={() => setTypingComplete(true)}
          />
        </div>
      );
    }

    // Normal insights rendering with TypedResponse
    return (
      <div className="ai-insights-content" ref={responseContentRef}>
        <TypedResponse 
          content={showFullAnalysis ? aiInsights.insights : processInsights(aiInsights.insights)}
          speed={15}
          onComplete={() => setTypingComplete(true)}
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
          {/* Robot icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="80"
            height="80"
            fill="#2e7d32"
          >
            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
          </svg>
        </div>
        <h3>Get AI-Powered Insights for Your Data</h3>
        <p>
          Our AI can analyze your data and find patterns, correlations, and
          anomalies automatically.
        </p>

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
              >
                {aiLoading ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="send-icon"
                  >
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
            onClick={() => fetchAiInsights()}
            disabled={aiLoading}
          >
            <FaLightbulb /> Analyze with AI
          </button>
        </div>
      </div>
    );
  }

  // Improved delete handler that fixes notification bugs
  const handleDeleteChat = (itemToDelete, e) => {
    // Stop event propagation to prevent triggering the parent click
    e.stopPropagation();

    // Remove the deleted chat from history
    const updatedHistory = chatHistory.filter((chat) => chat.id !== itemToDelete.id);
    setChatHistory(updatedHistory);

    // Update localStorage
    localStorage.setItem(
      `chatHistory_${selectedFile._id}`,
      JSON.stringify(updatedHistory)
    );

    // Check if the deleted chat was currently displayed
    const wasCurrentlyDisplayed =
      aiQuestion === itemToDelete.question ||
      (aiInsights && aiInsights.insights === itemToDelete.response);

    // If we deleted the currently displayed chat
    if (wasCurrentlyDisplayed) {
      // If there are remaining chats, show the most recent one
      if (updatedHistory.length > 0) {
        // Find the chat that was just above the deleted one (or the first one if we deleted the first)
        const indexOfDeleted = chatHistory.findIndex(
          (item) => item.id === itemToDelete.id
        );
        const previousChatIndex = indexOfDeleted > 0 ? indexOfDeleted - 1 : 0;
        const chatToShow = updatedHistory[previousChatIndex];

        // Display that chat
        setAiQuestion(chatToShow.question);
        setAiInsights({ insights: chatToShow.response });

        // Scroll to insights content area if needed
        if (insightsSectionRef.current) {
          insightsSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // If no chats remain, clear everything to show the empty state
        setAiQuestion("");
        setAiInsights(null);
      }
    }
  };

  const copyResponseToClipboard = () => {
    // Get the text without any markdown formatting
    const contentToCopy = aiInsights.insights;
    
    // Copy to clipboard
    navigator.clipboard.writeText(contentToCopy)
      .then(() => {
        // Show success message
        setCopySuccess(true);
        
        // Reset success message after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="ai-insights-results" ref={insightsSectionRef}>
      <div className="ai-insights-header-container">
        <div className="ai-insights-title">
          <FaLightbulb className="insights-icon" />
          <h3>
            <span className="header-label">AI Insights for:</span>{" "}
            <span className="file-name">{selectedFile ? (selectedFile.filename) : ""}</span>
          </h3>
        </div>
        <div className="analysis-timestamp-container">
          <FaClock className="timestamp-icon" />
          <span>Analyzed on {new Date().toLocaleString()}</span>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="send-icon"
                >
                  <path d="M3.4 20.4L20.85 12.92c1.1-.48 1.1-2.06 0-2.54L3.4 2.81c-.5-.22-1.01-.14-1.37.22-.37.36-.46.89-.25 1.37l2.78 6.12c.15.33.15.71 0 1.04L1.78 17.7c-.21.47-.12 1.01.25 1.37.36.36.87.44 1.37.22z" />
                </svg>
              )}
            </button>
          </div>
        </form>
        {chatHistory.length > 0 && (
          <div className="previous-questions">
            <div className="previous-questions-header">
              <h4>
                <FaHistory /> Previous Questions
              </h4>
              <button
                className="clear-history-btn"
                onClick={() => {
                  setChatHistory([]);
                  localStorage.removeItem(`chatHistory_${selectedFile._id}`);
                  setAiQuestion("");
                  setAiInsights(null);
                }}
              >
                Clear History
              </button>
            </div>
            <div className="questions-history-list">
              {chatHistory.map((item) => (
                <div key={item.id} className="question-history-item">
                  <div
                    className="question-item"
                    onClick={() => {
                      // When question is clicked, set the question and display its answer
                      setAiQuestion(item.question);
                      setActiveQuestion(item.question); // Also update the active question
                      setAiInsights({ insights: item.response });

                      // Scroll to the insights content area
                      if (insightsSectionRef.current) {
                        insightsSectionRef.current.scrollIntoView({
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    <div className="question-icon">
                      <FaCommentDots />
                    </div>
                    <div className="question-content">
                      <div className="question-text">{item.question}</div>
                      <div className="question-timestamp">{item.timestamp}</div>
                    </div>

                    <button
                      className="delete-question-btn"
                      onClick={(e) => handleDeleteChat(item, e)}
                      title="Delete this question"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ai-insights-content">{renderInsightsContent()}</div>

      {/* Right-aligned button */}
      <div className="ai-insights-actions">
        <button
          className="regenerate-button"
          onClick={() => fetchAiInsights(activeQuestion || aiQuestion)}
          disabled={aiLoading}
          title={activeQuestion ? `Regenerate response for: ${activeQuestion}` : "Regenerate general insights"}
        >
          <FaSyncAlt /> Regenerate Insights
        </button>
        
        <button
          className={`copy-button ${copySuccess ? 'success' : ''}`}
          onClick={copyResponseToClipboard}
          disabled={aiLoading || !typingComplete}
          title={!typingComplete ? "Wait for response to complete" : "Copy response to clipboard"}
        >
          <FaCopy /> {copySuccess ? "Copied!" : "Copy Response"}
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
