// config.js
const CONFIG = {
    // This automatically detects if the user is on www. or non-www
    // It creates "https://mwmfintech.com" or "https://www.mwmfintech.com" dynamically
    API_BASE_URL: `${window.location.protocol}//${window.location.hostname}`,
    
    ENDPOINTS: {
        IAM: "/api/iam",
        EXTRACTOR: "/api/financial_extractor"
    },

    // Helper function to get full URLs
    getApiUrl(service) {
        return `${this.API_BASE_URL}${this.ENDPOINTS[service]}`;
    }
};

// Export for use in other files
export default CONFIG;
