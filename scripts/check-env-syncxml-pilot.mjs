// scripts/check-env-syncxml-pilot.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.example');

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_CTA_ORG_ID',
  'SYNCXML_WEBHOOK_SECRET',
  'SYNCXML_INTERNAL_API_URL',
  'SYNCXML_INTERNAL_API_SECRET',
  'SYNCXML_APP_URL',
  'SYNCXML_LOGIN_URL',
  'HERMES_WORKER_URL',
  'HERMES_WORKER_API_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL'
];

function checkEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.example not found');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  let missing = [];

  for (const v of REQUIRED_VARS) {
    const regex = new RegExp(`^${v}=`, 'm');
    if (!regex.test(content)) {
      missing.push(v);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required variables in .env.example:');
    missing.forEach(m => console.error(`  - ${m}`));
    process.exit(1);
  }

  console.log('✅ .env.example has all required variables for SyncXML Pilot.');
}

checkEnv();
