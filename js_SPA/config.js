// config.js
const CONFIG = {
    // In production, we use the Nginx paths we just defined
    API_BASE_URL: "https://mwmfintech.com",
    
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
