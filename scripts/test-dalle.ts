// Test script to verify DALL-E 3 API access
// Run with: npx tsx scripts/test-dalle.ts

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDalleAccess() {
  console.log('🧪 Testing DALL-E 3 API Access...\n');

  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log(`   Key prefix: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
  console.log('');

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('🎨 Attempting to generate a test image with DALL-E 3...');
    console.log('   Prompt: "A simple minimalist black and white line drawing of a tree"');
    console.log('   Size: 1024x1024');
    console.log('   Quality: standard');
    console.log('');

    const startTime = Date.now();

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple minimalist black and white line drawing of a tree, hand-drawn style',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('✅ SUCCESS! DALL-E 3 is working!');
    console.log('');
    console.log('📊 Response Details:');
    console.log(`   Generation time: ${duration} seconds`);
    console.log(`   Image URL: ${response.data[0].url}`);
    console.log(`   Revised prompt: ${response.data[0].revised_prompt}`);
    console.log('');
    console.log('💰 Cost: ~$0.04 (DALL-E 3 standard 1024x1024)');
    console.log('');
    console.log('🎉 Your API key has full DALL-E 3 access!');
    console.log('   The image generation feature should work in your app.');

  } catch (error: any) {
    console.error('❌ DALL-E 3 Test FAILED\n');

    if (error.status === 401) {
      console.error('🔐 Authentication Error:');
      console.error('   Your API key is invalid or has been revoked.');
      console.error('   Solution: Generate a new API key at https://platform.openai.com/api-keys');
    } else if (error.status === 403) {
      console.error('🚫 Permission Error:');
      console.error('   Your API key does NOT have access to DALL-E 3.');
      console.error('   Solution: Check your OpenAI account billing and permissions.');
    } else if (error.status === 429) {
      console.error('⏱️  Rate Limit Error:');
      console.error('   You have exceeded your rate limit or quota.');
      console.error('   Solution: Wait a moment or check your usage limits.');
    } else if (error.status === 500) {
      console.error('⚠️  OpenAI Server Error:');
      console.error('   The OpenAI API is experiencing issues.');
      console.error('   Solution: Try again in a few moments.');
    } else {
      console.error('❓ Unknown Error:');
      console.error(`   Status: ${error.status || 'N/A'}`);
      console.error(`   Message: ${error.message}`);
    }

    console.error('');
    console.error('Full error details:');
    console.error(JSON.stringify(error, null, 2));

    process.exit(1);
  }
}

// Run the test
testDalleAccess();
