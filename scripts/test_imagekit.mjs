import fs from 'fs';

const PRIVATE_KEY = 'private_BSNkTDg+vq6eboXvrkDevE9+XMk=';

async function testImageKitAuth() {
  console.log('Testing ImageKit API with private key...');
  
  const authHeader = 'Basic ' + Buffer.from(PRIVATE_KEY + ':').toString('base64');
  
  // Test listing or pinging ImageKit
  const res = await fetch('https://api.imagekit.io/v1/files?limit=1', {
    headers: {
      Authorization: authHeader
    }
  });

  console.log('ImageKit Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('ImageKit Response:', data);
}

testImageKitAuth().catch(console.error);
