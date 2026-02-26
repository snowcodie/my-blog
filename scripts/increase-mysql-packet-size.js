const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function increasePacketSize() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Checking current max_allowed_packet...');
    
    const [currentSetting] = await connection.execute(
      "SHOW VARIABLES LIKE 'max_allowed_packet'"
    );
    
    if (currentSetting.length > 0) {
      const currentValue = currentSetting[0].Value;
      const currentMB = Math.round(currentValue / (1024 * 1024));
      console.log(`Current max_allowed_packet: ${currentMB}MB`);
    }

    console.log('\nIncreasing max_allowed_packet to 64MB for this session...');
    await connection.execute("SET GLOBAL max_allowed_packet=67108864"); // 64MB
    console.log('✓ Session packet size increased to 64MB!');
    
    console.log('\n⚠️  IMPORTANT: This change is temporary and will reset when MySQL restarts.');
    console.log('To make it permanent, add this to your MySQL configuration file (my.ini or my.cnf):');
    console.log('\n[mysqld]');
    console.log('max_allowed_packet=64M\n');
    console.log('Then restart MySQL service.');
    
    console.log('\n✅ Configuration updated successfully!');
  } catch (error) {
    console.error('❌ Failed to update settings:', error.message);
    console.log('\nAlternatively, reduce image sizes in your posts:');
    console.log('- Cover images: Keep under 1MB');
    console.log('- Content images: Compress before inserting');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

increasePacketSize();
