const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Initialize the Gemini API client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to analyze Excel data and generate insights
async function analyzeData(data, columns, questionPrompt = null) {
  // Add this at the beginning of your analyzeData function
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    throw new Error('Missing or invalid Gemini API key');
  }

  // Log the API key length for debugging (don't log the actual key)
  console.log(`Using Gemini API key (length: ${process.env.GEMINI_API_KEY.length})`);

  try {
    // First, handle basic validation for the user's question
    if (questionPrompt) {
      const tooShortOrGeneric = questionPrompt.trim().length < 5 || 
                              ["hello", "hi", "test", "hey"].includes(questionPrompt.toLowerCase().trim());
      
      // Check if question appears to be random letters
      const seemsRandom = /^[a-z]{1,5}$/i.test(questionPrompt.trim());
      
      if (tooShortOrGeneric || seemsRandom) {
        return {
          insights: `# I Need More Information

It looks like your query "${questionPrompt}" is too brief or general for me to provide meaningful insights about your data.

## How to Get Better Insights:

1. **Ask specific questions** about your data, such as:
   - "What's the relationship between age and purchase amount?"
   - "Which products have the highest profit margin?"
   - "Show me trends in customer behavior over time"

2. **Mention specific columns** in your question to get more relevant analysis.

3. **Try these example questions**:
   - "What are the key patterns in my ${columns[0]} data?"
   - "Compare the differences between ${columns.slice(0,2).join(' and ')}"
   - "Find any outliers or anomalies in the dataset"

Or simply click "Analyze with AI" for a comprehensive analysis of your entire dataset.`,
          isGenericResponse: true
        };
      }
      
      // Check if this is a simple computational request
      const isSimpleComputation = /\b(sum|average|mean|median|calculate|count|total)\b/i.test(questionPrompt);
      
      // For simple computational requests, set a flag to keep answers concise
      if (isSimpleComputation) {
        simpleComputationMode = true;
      }
    }
    
    // Continue with your data processing
    const sampleSize = Math.min(data.length, 50); 
    const dataSample = data.slice(0, sampleSize);
    const columnStats = {};
    columns.forEach(column => {
      const values = data.map(row => row[column]);
      const numericValues = values
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
      
      columnStats[column] = {
        type: numericValues.length / values.length > 0.5 ? 'numeric' : 'categorical',
        uniqueValues: [...new Set(values)].length,
        hasMissingValues: values.some(v => v === null || v === undefined || v === ''),
        sampleValues: [...new Set(values)].slice(0, 5)
      };
      
      if (numericValues.length > 0) {
        columnStats[column].min = Math.min(...numericValues);
        columnStats[column].max = Math.max(...numericValues);
        columnStats[column].avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        // Add quartile information
        numericValues.sort((a, b) => a - b);
        columnStats[column].median = numericValues[Math.floor(numericValues.length / 2)];
        columnStats[column].q1 = numericValues[Math.floor(numericValues.length / 4)];
        columnStats[column].q3 = numericValues[Math.floor(3 * numericValues.length / 4)];
      }
    });
    
    // Enhanced prompt with more detailed instructions and response formatting guidance
    let prompt = `You are an expert data analyst. Analyze this dataset thoroughly:

Dataset Summary:
- Total records: ${data.length}
- Columns: ${columns.join(', ')}
- Sample: ${JSON.stringify(dataSample.slice(0, 15), null, 0)}

Column Statistics:
${JSON.stringify(columnStats, null, 2)}`;

    if (questionPrompt) {
      // Add the user's specific question
      prompt += `\n\nUser Question: "${questionPrompt}"

Provide a focused answer to this specific question. Keep your response proportionate to the complexity of the question:
1. For simple computational questions (sums, averages, etc.), give a direct answer with minimal explanation.
2. For more complex analytical questions, provide appropriate detail and context.`;
    } else {
      // If no question, user wants a general analysis
      prompt += `\n\nProvide a general analysis of this dataset.`;
    }
    
    // Add instructions for response format
    prompt += `\n\nFormat guidelines:
- Use markdown formatting for readability
- Be concise but thorough
- Match the depth of your analysis to the complexity of the question
- For simple questions, give simple answers
- For complex questions, show your work and reasoning
- Avoid unnecessary verbosity
- Include only relevant details for the specific question asked

Use this consistent formatting for your response:
1. Use "# Data Analysis Insights: [Topic]" as the main title
2. Use "## [Section Name]" for main sections
3. Use "### [Subsection]" for subsections
4. Use bold text for key terms and findings
5. Use consistent green color headings throughout
6. Maintain the same heading size and style throughout the entire response`;

    // Update to use the latest Gemini model version
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Updated to the latest model as of July 2025
      generationConfig: {
        temperature: 0.1,   
        topP: 0.9,         
        topK: 40,
        maxOutputTokens: 2048 
      }
    });

    // Add retry logic with improved fallback options
    let retries = 0;
    const maxRetries = 3;
    let lastError = null;
    
    // Create an array of models to try in order of preference
    const modelOptions = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.0-pro"  // Very old fallback, likely won't be needed
    ];
    
    let currentModelIndex = 0;
    
    while (retries <= maxRetries && currentModelIndex < modelOptions.length) {
      try {
        const currentModel = genAI.getGenerativeModel({
          model: modelOptions[currentModelIndex],
          generationConfig: {
            temperature: 0.1,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048
          }
        });
        
        console.log(`Trying model: ${modelOptions[currentModelIndex]}`);
        const result = await currentModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Validate the response quality
        if (text.length < 100) {
          throw new Error("Response too short, retrying...");
        }
        
        return {
          insights: text,
          columnStats,
          modelUsed: modelOptions[currentModelIndex]  // Include which model was used
        };
      } catch (error) {
        lastError = error;
        console.error(`API error with model ${modelOptions[currentModelIndex]}:`, error.message);
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`Rate limit hit. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else if (error.message.includes('404') || error.message.includes('not found') || 
                  error.message.includes('503') || error.message.includes('Service Unavailable')) {
          // Try the next model in our list
          currentModelIndex++;
          console.log(`Switching to next model option: ${modelOptions[currentModelIndex]}`);
        } else {
          // For other errors, try next model
          currentModelIndex++;
        }
        
        // If we've tried all models, increment retry counter
        if (currentModelIndex >= modelOptions.length) {
          currentModelIndex = 0; // Start over with first model
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          console.log(`All models attempted. Waiting ${delay}ms before retry cycle...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Create a graceful fallback response when AI analysis fails
    const fallbackResponse = {
      insights: `# Data Analysis Summary
  
## Unable to Generate AI Analysis

I apologize, but I couldn't generate an AI analysis of your data at this time.

### Basic Statistics Instead:

${Object.entries(columnStats).map(([column, stats]) => `
- **${column}**: ${stats.type === 'numeric' ? 
  `Range: ${stats.min} to ${stats.max}, Average: ${stats.avg.toFixed(2)}` : 
  `${stats.uniqueValues} unique values`}
`).join('')}

### Try Again Later

The AI service is currently experiencing high demand. Please try your analysis again in a few minutes.`,
      columnStats,
      isError: true
    };

    return fallbackResponse;
  } catch (error) {
    console.error('Gemini AI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeData
};