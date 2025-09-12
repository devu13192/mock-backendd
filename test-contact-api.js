const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testContactAPI() {
    console.log('🧪 Testing Contact Management API...\n');

    try {
        // Test 1: Create a new contact
        console.log('1. Testing POST /api/contacts (Create Contact)');
        const newContact = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            inquiryType: 'general',
            message: 'This is a test message for the contact management system.',
            consent: true
        };

        const createResponse = await axios.post(`${BASE_URL}/api/contacts`, newContact);
        console.log('✅ Contact created successfully:', createResponse.data);
        const contactId = createResponse.data.data.id;

        // Test 2: Get all contacts
        console.log('\n2. Testing GET /api/contacts (Get All Contacts)');
        const getResponse = await axios.get(`${BASE_URL}/api/contacts`);
        console.log('✅ Contacts retrieved successfully:', getResponse.data);

        // Test 3: Update contact status
        console.log('\n3. Testing PATCH /api/contacts/:id/status (Update Status)');
        const updateResponse = await axios.patch(`${BASE_URL}/api/contacts/${contactId}/status`, {
            status: 'contacted'
        });
        console.log('✅ Contact status updated successfully:', updateResponse.data);

        // Test 4: Get contact statistics
        console.log('\n4. Testing GET /api/contacts/stats (Get Statistics)');
        const statsResponse = await axios.get(`${BASE_URL}/api/contacts/stats`);
        console.log('✅ Contact statistics retrieved successfully:', statsResponse.data);

        console.log('\n🎉 All tests passed! Contact Management API is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Full error:', error);
    }
}

// Run the test
testContactAPI();

