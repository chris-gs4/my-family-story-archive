// Service Configuration
// Controls whether to use mock services or real APIs

interface ServiceConfig {
  useMockS3: boolean;
  useMockOpenAI: boolean;
  useMockEmail: boolean;
}

// Read from environment variables
const config: ServiceConfig = {
  // Use mocks in development by default, unless API keys are provided
  useMockS3: !process.env.AWS_ACCESS_KEY_ID || process.env.USE_MOCK_S3 === 'true',
  useMockOpenAI: !process.env.OPENAI_API_KEY || process.env.USE_MOCK_OPENAI === 'true',
  useMockEmail: !process.env.RESEND_API_KEY || process.env.USE_MOCK_EMAIL === 'true',
};

export default config;

// Log configuration on startup
if (process.env.NODE_ENV === 'development') {
  console.log('[Service Config] Using mock services:', config);
}
