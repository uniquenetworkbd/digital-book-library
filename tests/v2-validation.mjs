import { readFileSync, existsSync } from 'node:fs';
const required=['index.html','reader.html','creator.html','dashboard.html','manifest.json','sw.js','assets/js/db.js','assets/js/complete-bot-engine.js','assets/js/bot.js','assets/js/backup-engine.js','assets/js/dashboard.js'];
for(const file of required) if(!existsSync(file)) throw new Error(`Missing ${file}`);
const bot=readFileSync('assets/js/complete-bot-engine.js','utf8');
for(let i=1;i<=60;i++) if(!bot.includes(`${i}:`)) throw new Error(`BOT-${i} missing`);
for(const file of ['index.html','reader.html','creator.html','dashboard.html']){const html=readFileSync(file,'utf8');for(const script of ['assets/js/complete-bot-engine.js','assets/js/bot.js']) if(!html.includes(script)) throw new Error(`${script} missing from ${file}`)}
const db=readFileSync('assets/js/db.js','utf8');for(const token of ['DB_VERSION = 2','drafts','chatHistory','bookmarks','readingStats']) if(!db.includes(token)) throw new Error(`DB contract missing ${token}`);
const backup=readFileSync('assets/js/backup-engine.js','utf8');for(const token of ['version:2','exportFullBackup','restoreFullBackup']) if(!backup.includes(token)) throw new Error(`Backup contract missing ${token}`);
console.log('V2 static validation PASS');
