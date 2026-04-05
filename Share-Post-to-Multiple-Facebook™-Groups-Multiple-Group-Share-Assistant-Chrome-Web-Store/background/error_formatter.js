// Helper function to format API errors into user-friendly messages
export function formatApiError(error) {
    const errorString = error.message || error.toString();
    
    // Check for quota/rate limit errors (429)
    if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('RESOURCE_EXHAUSTED')) {
        return '⚠️ API Quota Exceeded: You\'ve reached your API usage limit. Please wait a few minutes or upgrade your API plan at <a href="https://aistudio.google.com/pricing" target="_blank" style="color: #007bff; text-decoration: underline;">https://aistudio.google.com/pricing</a>';
    }
    
    // Check for invalid API key errors (401, 403)
    if (errorString.includes('401') || errorString.includes('403') || errorString.includes('API key not valid')) {
        return '🔑 Invalid API Key: Your API key appears to be invalid. Please check your API key in Settings.';
    }
    
    // Check for network/connection errors
    if (errorString.includes('Failed to fetch') || errorString.includes('NetworkError') || errorString.includes('ENOTFOUND')) {
        return '🌐 Connection Error: Unable to reach the API. Please check your internet connection.';
    }
    
    // Check for timeout errors
    if (errorString.includes('timeout') || errorString.includes('ETIMEDOUT')) {
        return '⏱️ Request Timeout: The request took too long. Please try again.';
    }
    
    // Check for model not found errors
    if (errorString.includes('404') || errorString.includes('not found')) {
        return '❌ Model Not Found: The AI model is not available. Please try again later.';
    }
    
    // Check for content policy violations
    if (errorString.includes('content policy') || errorString.includes('safety')) {
        return '🚫 Content Policy: The request was blocked due to content policy. Please try different input.';
    }
    
    // Check for generic 500 errors
    if (errorString.includes('500') || errorString.includes('Internal Server Error')) {
        return '⚠️ Server Error: The API is experiencing issues. Please try again in a few moments.';
    }
    
    // For other errors, provide a generic friendly message
    return '❌ Something went wrong. Please try again or check your settings.';
}

// Helper function to extract retry delay from error message
export function extractRetryDelay(error) {
    const errorString = error.message || error.toString();
    const retryMatch = errorString.match(/retry in (\d+(?:\.\d+)?)/i);
    if (retryMatch && retryMatch[1]) {
        const seconds = Math.ceil(parseFloat(retryMatch[1]));
        if (seconds > 0) {
            return `\n\nPlease wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`;
        }
    }
    return '';
}
