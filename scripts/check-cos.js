/**
 * 检查 COS 存储中的文件
 */
const fs = require('fs');
const path = require('path');

// 手动加载 .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  });
}

const COS = require('cos-nodejs-sdk-v5');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const bucket = process.env.COS_BUCKET || 'lsjx-1354453097';
const region = process.env.COS_REGION || 'ap-beijing';

// 列出 zeocanvas/ 下的所有文件
cos.getBucket({
  Bucket: bucket,
  Region: region,
  Prefix: 'zeocanvas/',
  MaxKeys: 100,
}, (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  const contents = data.Contents || [];

  console.log('=== COS 存储文件列表 ===\n');
  console.log('Bucket:', bucket);
  console.log('Region:', region);
  console.log('Prefix: zeocanvas/');
  console.log('\n找到', contents.length, '个文件:\n');

  if (contents.length > 0) {
    // 按路径分组显示
    const grouped = {};
    contents.forEach(item => {
      const parts = item.Key.split('/');
      const category = parts.slice(0, 3).join('/');
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        key: item.Key,
        size: (item.Size / 1024).toFixed(2) + ' KB',
        lastModified: item.LastModified,
      });
    });

    Object.entries(grouped).forEach(([category, files]) => {
      console.log('📁', category + '/');
      files.forEach(f => {
        console.log('   └─', f.key.split('/').pop(), '(' + f.size + ')');
      });
      console.log('');
    });
  } else {
    console.log('(空)');
  }
});
