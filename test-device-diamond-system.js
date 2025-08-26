#!/usr/bin/env node

// Test script to verify device-based diamond system is working correctly
import https from 'https';
import crypto from 'crypto';

const SERVER_URL = 'https://red-velvet-connection.replit.app';

// Generate a mock device fingerprint (similar to Android)
function generateMockDeviceFingerprint() {
  const androidId = crypto.randomUUID();
  const model = 'TestDevice';
  const manufacturer = 'TestManufacturer';
  const brand = 'TestBrand';
  
  const rawFingerprint = `${androidId}_${model}_${manufacturer}_${brand}`;
  return Buffer.from(rawFingerprint).toString('base64');
}

// Make HTTP request with device fingerprint
function makeRequest(path, method = 'GET', data = null, deviceFingerprint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'red-velvet-connection.replit.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'RedVelvet-Test/1.0',
        'X-Device-Fingerprint': deviceFingerprint,
        'X-Platform': 'test'
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test device diamond system
async function testDeviceDiamondSystem() {
  console.log('🔧 Testing Device-Based Diamond System');
  console.log('=====================================');
  
  const deviceFingerprint = generateMockDeviceFingerprint();
  console.log(`📱 Mock Device Fingerprint: ${deviceFingerprint.substring(0, 16)}...`);
  
  try {
    // Test 1: Get/Create Device Session
    console.log('\n1️⃣ Testing Device Session Creation...');
    const sessionResponse = await makeRequest('/api/mobile/device-session', 'GET', null, deviceFingerprint);
    console.log(`   Status: ${sessionResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(sessionResponse.data, null, 2)}`);
    
    if (sessionResponse.statusCode === 200) {
      console.log('   ✅ Device session created successfully');
    } else {
      console.log('   ❌ Failed to create device session');
      return;
    }
    
    // Test 2: Get Diamond Count
    console.log('\n2️⃣ Testing Diamond Count Retrieval...');
    const diamondResponse = await makeRequest('/api/mobile/diamonds', 'GET', null, deviceFingerprint);
    console.log(`   Status: ${diamondResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(diamondResponse.data, null, 2)}`);
    
    if (diamondResponse.statusCode === 200) {
      console.log('   ✅ Diamond count retrieved successfully');
      const initialDiamonds = diamondResponse.data.diamonds;
      console.log(`   💎 Initial diamonds: ${initialDiamonds}`);
      
      // Test 3: Deduct Diamonds
      console.log('\n3️⃣ Testing Diamond Deduction...');
      const deductData = JSON.stringify({ amount: 1 });
      const deductResponse = await makeRequest('/api/mobile/diamonds/deduct', 'POST', deductData, deviceFingerprint);
      console.log(`   Status: ${deductResponse.statusCode}`);
      console.log(`   Response: ${JSON.stringify(deductResponse.data, null, 2)}`);
      
      if (deductResponse.statusCode === 200 && deductResponse.data.success) {
        console.log('   ✅ Diamond deduction successful');
        console.log(`   💎 Remaining diamonds: ${deductResponse.data.remainingDiamonds}`);
        
        // Test 4: Verify Diamond Count After Deduction
        console.log('\n4️⃣ Testing Diamond Count After Deduction...');
        const verifyResponse = await makeRequest('/api/mobile/diamonds', 'GET', null, deviceFingerprint);
        console.log(`   Status: ${verifyResponse.statusCode}`);
        console.log(`   Response: ${JSON.stringify(verifyResponse.data, null, 2)}`);
        
        if (verifyResponse.statusCode === 200) {
          const finalDiamonds = verifyResponse.data.diamonds;
          console.log(`   💎 Final diamonds: ${finalDiamonds}`);
          
          if (finalDiamonds === initialDiamonds - 1) {
            console.log('   ✅ Diamond deduction verified correctly');
          } else {
            console.log('   ❌ Diamond count mismatch');
          }
        }
      } else {
        console.log('   ❌ Diamond deduction failed');
      }
    } else {
      console.log('   ❌ Failed to retrieve diamond count');
    }
    
    // Test 5: Test Chat Message with Diamond Deduction
    console.log('\n5️⃣ Testing Chat Message with Diamond Deduction...');
    const chatData = JSON.stringify({
      message: 'Hello, this is a test message',
      sessionId: 'test-session',
      deviceId: deviceFingerprint
    });
    
    const chatResponse = await makeRequest('/api/companions/1/chat', 'POST', chatData, deviceFingerprint);
    console.log(`   Status: ${chatResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(chatResponse.data, null, 2)}`);
    
    if (chatResponse.statusCode === 200) {
      console.log('   ✅ Chat message sent successfully');
      console.log(`   💬 AI Response: ${chatResponse.data.message || chatResponse.data.text}`);
      console.log(`   💎 Remaining diamonds: ${chatResponse.data.diamondsRemaining}`);
    } else if (chatResponse.statusCode === 402) {
      console.log('   ⚠️  Insufficient diamonds (expected behavior)');
    } else {
      console.log('   ❌ Chat message failed');
    }
    
    console.log('\n🚀 DEVICE DIAMOND SYSTEM TEST COMPLETE');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDeviceDiamondSystem();