import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Read instance name from specified env file
 * Usage: node prepare-public.js .env.urbn
 * or: node prepare-public.js urbn
 */
function getInstanceFromEnvFile(envFileName) {
  const envPath = path.join(__dirname, '..', envFileName)

  if (!fs.existsSync(envPath)) {
    console.error(`Error: Environment file not found: ${envPath}`)
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(
    /NEXT_PUBLIC_APP_CONFIGURATION\s*=\s*['"]?([^'"\n\r]+)['"]?/
  )

  if (!match) {
    console.error(
      `Error: NEXT_PUBLIC_APP_CONFIGURATION not found in ${envFileName}`
    )
    process.exit(1)
  }

  return match[1].trim()
}

// Get env file name from command line argument or use process.env
let currentInstance
const envFileArg = process.argv[2]

if (envFileArg) {
  // If argument provided, construct the env file name
  const envFileName = envFileArg.startsWith('.env')
    ? envFileArg
    : `.env.${envFileArg}`
  console.log(`Reading instance from: ${envFileName}`)
  currentInstance = getInstanceFromEnvFile(envFileName)
} else {
  // Fallback to process.env
  currentInstance = process.env.NEXT_PUBLIC_APP_CONFIGURATION || 'defaults'
}

const publicDir = path.join(__dirname, '..', 'public')
const configsDir = path.join(__dirname, '..', 'src', 'configs')

console.log(`\nCleaning public folder for instance: ${currentInstance}\n`)

/**
 * Get all instance names from src/configs folder
 */
function getAllInstances() {
  try {
    const items = fs.readdirSync(configsDir)
    const instances = items.filter((item) => {
      const itemPath = path.join(configsDir, item)
      return fs.statSync(itemPath).isDirectory()
    })
    console.log(`Found instances: ${instances.join(', ')}`)
    return instances
  } catch (error) {
    console.error('Error reading configs directory:', error)
    return []
  }
}

/**
 * Clean public folder:
 * 1. Get all instance names from src/configs
 * 2. Keep only the folder matching current instance
 * 3. Remove folders matching other instance names
 * 4. Do not touch any root files
 */
function cleanPublicFolder() {
  try {
    const allInstances = getAllInstances()
    const items = fs.readdirSync(publicDir)

    items.forEach((item) => {
      const itemPath = path.join(publicDir, item)
      const stat = fs.statSync(itemPath)

      // Only process directories
      if (!stat.isDirectory()) {
        return
      }

      // Keep current instance folder
      if (item === currentInstance) {
        console.log(`Keeping current instance folder: ${item}/`)
        return
      }

      // Remove ONLY folders that match other instance names (not current!)
      if (allInstances.includes(item) && item !== currentInstance) {
        console.log(`Removing other instance folder: ${item}/`)
        fs.rmSync(itemPath, { recursive: true, force: true })
        return
      }

      // Keep all other folders (like inspirations, etc.)
      console.log(`Keeping non-instance folder: ${item}/`)
    })

    removeUnusedSharedFolders()

    console.log(`\nPublic folder cleaned successfully!\n`)
  } catch (error) {
    console.error('Error cleaning public folder:', error)
    process.exit(1)
  }
}

/**
 * Remove shared public folders that are only needed when specific features are active.
 * Reads the aiSearch flag from the active tenant's configs/<tenant>/features.ts
 * (tenant-first, then defaults).
 *
 * - public/inspirations/ — only needed when aiSearch feature is enabled
 */
function removeUnusedSharedFolders() {
  // Feature flags moved from GrowthBook (_static.json) to static configs/<tenant>/features.ts.
  // Read the aiSearch scalar directly from source (tenant-first, then defaults).
  const readAiSearch = (instance) => {
    try {
      const src = fs.readFileSync(
        path.join(configsDir, instance, 'features.ts'),
        'utf-8'
      )
      const match = src.match(/aiSearch:\s*(true|false)/)
      return match ? match[1] === 'true' : undefined
    } catch {
      return undefined
    }
  }

  const aiSearch = readAiSearch(currentInstance) ?? readAiSearch('defaults')

  if (aiSearch === undefined) {
    console.log('Skipping feature-based cleanup: aiSearch flag not found')
    return
  }

  const inspirationsDir = path.join(publicDir, 'inspirations')
  if (!aiSearch && fs.existsSync(inspirationsDir)) {
    console.log('Removing public/inspirations/ (aiSearch feature is disabled)')
    fs.rmSync(inspirationsDir, { recursive: true, force: true })
  } else if (aiSearch) {
    console.log('Keeping public/inspirations/ (aiSearch feature is enabled)')
  }
}

cleanPublicFolder()
