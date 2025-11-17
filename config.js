// config.js - API Configuration and Utility Functions

const API_BASE_URL = 'https://voting-system-backend-t0ma.onrender.com';

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Ensure method is set, default to GET
    const method = options.method || 'GET';
    
    // Build the config
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };
    
    // Only add body if it exists and method is not GET
    if (options.body && method !== 'GET') {
        config.body = options.body;
    }

    try {
        console.log('🔄 Making API call to:', url);
        console.log('📦 Request config:', {
            method: config.method,
            headers: config.headers,
            body: config.body ? JSON.parse(config.body) : 'No body'
        });
        
        const response = await fetch(url, config);
        
        // Get the error message from the response
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            data = { detail: 'Could not parse response as JSON' };
        }
        
        console.log('📡 Response status:', response.status);
        console.log('📄 Response data:', data);
        
        if (!response.ok) {
            // Better error handling for validation errors
            let errorMessage = 'API Error: ' + response.status;
            
            if (data.detail) {
                if (Array.isArray(data.detail)) {
                    // FastAPI validation errors
                    console.error('Validation errors:', data.detail);
                    errorMessage = data.detail.map(err => {
                        const location = err.loc ? err.loc.join('.') : 'unknown';
                        const message = err.msg || 'validation error';
                        const type = err.type || '';
                        return `${location}: ${message} (${type})`;
                    }).join('\n');
                } else if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else {
                    errorMessage = JSON.stringify(data.detail);
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return data;
    } catch (error) {
        console.error('❌ API Call Failed:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Cannot connect to the server. Please check your internet connection and try again.');
        } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
            throw new Error('Server unavailable: Cannot reach the voting system server. Please try again later.');
        }
        
        throw error;
    }
}

// Auth utility functions
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
}

function isAuthenticated() {
    return !!getAuthToken();
}

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
window.apiCall = apiCall;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.removeAuthToken = removeAuthToken;
window.isAuthenticated = isAuthenticated;