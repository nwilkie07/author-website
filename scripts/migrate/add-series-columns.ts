// Simple migration runner placeholder for adding series columns to Cloudflare D1
// NOTE: This script currently prints the SQL to run. Connect to your Cloudflare D1 and execute the SQL.
import { readFileSync } from 'fs'
import { join } from 'path'

async function main() {
  const sqlPath = join(__dirname, 'add-series-columns.sql')
  const sql = readFileSync(sqlPath, 'utf8')
  console.log('Migration SQL to run on Cloudflare D1 (books table):')
  console.log(sql)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
