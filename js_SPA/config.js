// config.js
const CONFIG = {
    // In production, we use the Nginx paths we just defined
    API_BASE_URL: "http://46.224.227.5",
    
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
