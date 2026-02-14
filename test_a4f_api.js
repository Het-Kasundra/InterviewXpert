/**
 * Test script to verify A4F API integration
 * This will test if AI-generated questions are working properly
 */

const testA4FIntegration = async () => {
  console.log('🧪 Testing A4F API Integration...\n');
  
  const testConfig = {
    roles: ['Frontend Developer', 'React Developer'],
    level: 'medium',
    interviewType: 'technical',
    questionTypes: ['mcq', 'qa', 'code'],
    durationMin: 30,
    inputMode: 'text',
    resumeText: '',
    usedIds: [],
    userId: 'test-user-123'
  };

  try {
    console.log('📡 Sending request to A4F API...');
    console.log('📋 Config:', JSON.stringify(testConfig, null, 2));
    
    const response = await fetch('http://localhost:3001/api/generate-questions-a4f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testConfig)
    });

    console.log('\n📊 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n✅ SUCCESS! A4F API is working!\n');
    console.log('📈 Response Summary:');
    console.log('  - Source:', data.source);
    console.log('  - Questions Generated:', data.count);
    console.log('  - Questions Array Length:', data.questions?.length || 0);
    
    if (data.questions && data.questions.length > 0) {
      console.log('\n📝 Sample Questions:\n');
      
      // Show first 3 questions
      data.questions.slice(0, 3).forEach((q, idx) => {
        console.log(`Question ${idx + 1}:`);
        console.log(`  Type: ${q.type}`);
        console.log(`  Skill: ${q.skill}`);
        console.log(`  Difficulty: ${q.difficulty}`);
        console.log(`  Prompt: ${q.prompt.substring(0, 100)}...`);
        if (q.type === 'mcq' && q.options) {
          console.log(`  Options: ${q.options.length} choices`);
        }
        if (q.type === 'code' && q.codeSnippet) {
          console.log(`  Has Code Snippet: Yes`);
        }
        console.log('');
      });
      
      console.log('✨ AI Question Generation is WORKING PERFECTLY!');
      console.log('🎓 Your final year project is ready for AI-generated questions!\n');
      
      // Statistics
      const questionTypes = {};
      data.questions.forEach(q => {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
      });
      
      console.log('📊 Question Type Distribution:');
      Object.entries(questionTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} questions`);
      });
      
    } else {
      console.log('\n⚠️  No questions were generated');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Error testing A4F API:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Hint: Make sure the backend server is running:');
      console.log('   npm run server');
    }
    
    process.exit(1);
  }
};

// Run the test
testA4FIntegration();
