#!/usr/bin/env node
/**
 * Validates k6 test scripts for common issues before running.
 * Run: node scripts/validate.js
 */
const fs = require('fs');
const path = require('path');

const TEST_DIR = path.join(__dirname, '../tests');
const SRC_DIR = path.join(__dirname, '../src');

let errors = 0;
let warnings = 0;

function check(condition, message, level = 'error') {
  if (!condition) {
    if (level === 'error') {
      console.error(`  ❌ ${message}`);
      errors++;
    } else {
      console.warn(`  ⚠️  ${message}`);
      warnings++;
    }
  }
}

console.log('Validating k6 test scripts...\n');

// Check all test files exist and have required exports
const testFiles = fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.test.js'));
console.log(`Found ${testFiles.length} test file(s)`);

for (const file of testFiles) {
  const filePath = path.join(TEST_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n  ${file}:`);

  // Required k6 imports
  check(content.includes("from 'k6'") || content.includes("from 'k6/http'"),
    `${file}: Missing k6 imports`);

  // Required exports
  check(content.includes('export const options'),
    `${file}: Missing 'export const options'`);
  check(content.includes('export default function'),
    `${file}: Missing default export function`);
  check(content.includes('export function handleSummary'),
    `${file}: Missing handleSummary export`, 'warn');

  // Check for setup function
  check(content.includes('export function setup'),
    `${file}: Missing setup() function`, 'warn');

  // Check for checks
  check(content.includes('check('),
    `${file}: No check() assertions found`);

  // Check for sleep (prevents hammering)
  check(content.includes('sleep('),
    `${file}: No sleep() calls — may overwhelm target`);

  // Check base URL is not hardcoded
  check(!content.includes("'https://reqres.in'") && !content.includes('"https://reqres.in"'),
    `${file}: Hardcoded reqres.in URL (use BASE_URL from config)`);

  console.log(`    ✅ Valid`);
}

// Check source helpers exist
console.log('\nValidating source files:');
const requiredSrc = ['config/thresholds.js', 'helpers/auth.js', 'helpers/http.js', 'data/users.js'];
for (const src of requiredSrc) {
  const exists = fs.existsSync(path.join(SRC_DIR, src));
  check(exists, `Missing source file: src/${src}`);
  if (exists) console.log(`  ✅ src/${src}`);
}

console.log(`\n${errors === 0 ? '✅ All validations passed' : `❌ ${errors} error(s)`}${warnings > 0 ? `, ${warnings} warning(s)` : ''}`);
process.exit(errors > 0 ? 1 : 0);
