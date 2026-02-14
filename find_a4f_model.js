/**
 * Test script to find available A4F models
 */

const models = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'provider-1/gpt-4o-mini',
    'provider-2/gpt-4o-mini',
    'provider-3/gpt-4o-mini',
    'provider-4/gpt-4o-mini',
    'provider-5/gpt-4o-mini',
    'provider-1/gpt-3.5-turbo',
    'provider-2/gpt-3.5-turbo',
    'openai/gpt-4o-mini',
    'openai/gpt-3.5-turbo',
];

const A4F_API_KEY = 'ddc-a4f-f387974c09d049589d1accee41093658';
const A4F_BASE_URL = 'https://api.a4f.co/v1';

async function testModel(model) {
    try {
        const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${A4F_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 5
            })
        });

        const status = response.status;

        if (status === 200) {
            console.log(`✅ ${model} - WORKS!`);
            return true;
        } else if (status === 404) {
            console.log(`❌ ${model} - Not found`);
        } else if (status === 403) {
            console.log(`⚠️  ${model} - Permission denied (exists but not available on your plan)`);
        } else {
            const data = await response.json().catch(() => ({}));
            console.log(`❓ ${model} - Status ${status}:`, data.error?.message || 'Unknown');
        }
        return false;
    } catch (error) {
        console.log(`❌ ${model} - Error:`, error.message);
        return false;
    }
}

async function findWorkingModel() {
    console.log('🔍 Testing A4F models with your new API key...\n');

    for (const model of models) {
        const works = await testModel(model);
        if (works) {
            console.log(`\n🎉 FOUND WORKING MODEL: ${model}`);
            console.log(`\nUpdate your .env file with:`);
            console.log(`A4F_MODEL=${model}`);
            return;
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n❌ No working models found. Please check:');
    console.log('1. API key is valid');
    console.log('2. You have an active A4F plan');
    console.log('3. Visit https://a4f.co/dashboard to see available models');
}

findWorkingModel();
