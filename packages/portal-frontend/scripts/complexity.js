#!/usr/bin/env node

/**
 * Code complexity reporter that analyzes ESLint results (like eslintcc)
 * Works with current ESLint config and displays ranked file output
 */

import { execSync } from 'child_process'
import { relative } from 'path'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  darkRed: '\x1b[91m'
}

// Configuration
const CONFIG = {
  // File patterns to analyze
  patterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}'
  ],
  // Ranking thresholds and colors (like eslintcc/radon)
  ranks: {
    A: { color: colors.green },
    B: { color: colors.green },
    C: { color: colors.yellow },
    D: { color: colors.yellow },
    E: { color: colors.red },
    F: { color: colors.darkRed }
  },
  // Per-rule thresholds (based on eslintcc/radon standards)
  thresholds: {
    complexity: {
      A: { min: 1, max: 5 },
      B: { min: 6, max: 10 },
      C: { min: 11, max: 20 },
      D: { min: 21, max: 30 },
      E: { min: 31, max: 40 },
      F: { min: 41, max: Infinity }
    },
    'max-depth': {
      A: { min: 1, max: 2 },
      B: { min: 3, max: 4 },
      C: { min: 5, max: 6 },
      D: { min: 7, max: 8 },
      E: { min: 9, max: 10 },
      F: { min: 11, max: Infinity }
    },
    'max-params': {
      A: { min: 1, max: 3 },
      B: { min: 4, max: 5 },
      C: { min: 6, max: 7 },
      D: { min: 8, max: 9 },
      E: { min: 10, max: 12 },
      F: { min: 13, max: Infinity }
    },
    'max-statements': {
      A: { min: 1, max: 10 },
      B: { min: 11, max: 20 },
      C: { min: 21, max: 30 },
      D: { min: 31, max: 40 },
      E: { min: 41, max: 50 },
      F: { min: 51, max: Infinity }
    },
    'max-lines-per-function': {
      A: { min: 1, max: 25 },
      B: { min: 26, max: 50 },
      C: { min: 51, max: 100 },
      D: { min: 101, max: 150 },
      E: { min: 151, max: 200 },
      F: { min: 201, max: Infinity }
    },
    'max-nested-callbacks': {
      A: { min: 1, max: 2 },
      B: { min: 3, max: 4 },
      C: { min: 5, max: 6 },
      D: { min: 7, max: 8 },
      E: { min: 9, max: 10 },
      F: { min: 11, max: Infinity }
    }
  }
}

/**
 * Calculate rank for a specific issue based on rule and value (like eslintcc/radon)
 */
function calculateIssueRank(rule, value) {
  const thresholds = CONFIG.thresholds[rule]
  if (!thresholds) return 'C'

  return (
    Object.entries(thresholds).find(
      ([, threshold]) => value >= threshold.min && value <= threshold.max
    )?.[0] || 'F'
  )
}

/**
 * Calculate file rank based on complexity issues (average of all issues, like eslintcc)
 */
function calculateFileRank(issues) {
  if (issues.length === 0) return 'A'

  const rankValues = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }
  const averageScore =
    issues.reduce(
      (sum, issue) =>
        sum + rankValues[calculateIssueRank(issue.rule, issue.value)],
      0
    ) / issues.length

  const thresholds = [1.5, 2.5, 3.5, 4.5, 5.5]
  const ranks = ['A', 'B', 'C', 'D', 'E', 'F']

  const index = thresholds.findIndex((t) => averageScore <= t)
  return index === -1 ? 'F' : ranks[index]
}

/**
 * Run ESLint and get JSON output
 */
function runESLintAnalysis() {
  const command = `npx eslint ${CONFIG.patterns.join(' ')} --format json --no-error-on-unmatched-pattern`

  try {
    const result = execSync(command, { encoding: 'utf-8' })
    return JSON.parse(result)
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout)
      } catch {
        console.error(
          `${colors.red}❌ Failed to parse ESLint output${colors.reset}`
        )
        return []
      }
    }
    console.error(
      `${colors.red}❌ Failed to run ESLint: ${error.message}${colors.reset}`
    )
    return []
  }
}

/**
 * Parse ESLint results into file issues
 */
function parseESLintResults(eslintResults) {
  const fileIssues = new Map()
  const rankCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }

  eslintResults.forEach((file) => {
    const filePath = relative(process.cwd(), file.filePath).replace(/\\/g, '/')
    const issues = []

    if (file.messages?.length > 0) {
      file.messages.forEach((message) => {
        const rulePatterns = {
          complexity: /(\d+)/,
          'max-params': /\((\d+)\)/,
          'max-depth': /(\d+)/,
          'max-statements': /\((\d+)\)/,
          'max-lines-per-function': /\((\d+)\)/,
          'max-nested-callbacks': /\((\d+)\)/
        }

        const pattern = rulePatterns[message.ruleId]
        if (pattern) {
          const match = message.message.match(pattern)
          if (match) {
            const value = parseInt(match[1], 10)
            const getType = (ruleId) =>
              ruleId.includes('depth')
                ? 'block'
                : ruleId.includes('callbacks')
                  ? 'callback'
                  : 'function'

            issues.push({
              line: message.line,
              column: message.column,
              rule: message.ruleId,
              value,
              type: getType(message.ruleId),
              message: message.message
            })
          }
        }
      })
    }

    // Calculate rank for this file
    const rank = calculateFileRank(issues)
    rankCounts[rank]++

    // Store file data
    if (issues.length > 0) {
      fileIssues.set(filePath, { issues, rank })
    }
  })

  // Count all analyzed files for A rank
  const totalFiles = eslintResults.length
  const filesWithIssues = fileIssues.size
  rankCounts.A += totalFiles - filesWithIssues

  return { fileIssues, rankCounts, totalFiles }
}

/**
 * Display results in eslintcc style
 */
function displayResults(fileIssues, rankCounts, totalFiles) {
  // Sort files by rank (worst first)
  const sortedFiles = Array.from(fileIssues.entries()).sort(([, a], [, b]) => {
    const rankOrder = { F: 6, E: 5, D: 4, C: 3, B: 2, A: 1 }
    return rankOrder[b.rank] - rankOrder[a.rank]
  })

  // Display file issues
  sortedFiles.forEach(([filePath, { issues, rank }]) => {
    const rankColor = CONFIG.ranks[rank].color
    console.log(`${rankColor}${rank}${colors.reset} ${filePath}`)

    issues.forEach((issue) => {
      const location = `${issue.line}:${issue.column}`
      const endLocation = `${issue.line}:${issue.column + 1}`

      const ruleNames = {
        'max-lines-per-function': 'max-lines',
        'max-nested-callbacks': 'max-callbacks'
      }

      const ruleName = ruleNames[issue.rule] || issue.rule
      const ruleText = `${ruleName} = ${issue.value}`
      const issueRank = calculateIssueRank(issue.rule, issue.value)
      const issueColor = CONFIG.ranks[issueRank].color

      console.log(
        `  ${issueColor}${issueRank}${colors.reset} ${location.padEnd(8)} ${issue.type} (${location}-${endLocation}) (${ruleText})`
      )
    })
  })

  if (sortedFiles.length > 0) {
    console.log() // Empty line before summary
  }

  // Calculate average rank
  const rankValues = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }
  const { totalScore, weightedFiles } = Object.entries(rankCounts).reduce(
    (acc, [rank, count]) => ({
      totalScore: acc.totalScore + rankValues[rank] * count,
      weightedFiles: acc.weightedFiles + count
    }),
    { totalScore: 0, weightedFiles: 0 }
  )

  const averageRank = weightedFiles > 0 ? totalScore / weightedFiles : 1
  const averageRankLetter =
    Object.keys(rankValues).find(
      (rank) => averageRank <= rankValues[rank] + 0.5
    ) || 'F'

  const averageColor = CONFIG.ranks[averageRankLetter].color

  // Display summary
  console.log(
    `Average rank: ${averageColor}${averageRankLetter}${colors.reset} (${averageRank.toFixed(3)})`
  )
  Object.entries(rankCounts).forEach(([rank, count]) => {
    const rankColor = CONFIG.ranks[rank].color
    console.log(`  ${rankColor}${rank}${colors.reset}: ${count}`)
  })
}

/**
 * Main function
 */
function main() {
  // Run ESLint analysis
  const eslintResults = runESLintAnalysis()

  // Parse complexity data
  const { fileIssues, rankCounts, totalFiles } =
    parseESLintResults(eslintResults)

  // Display results
  displayResults(fileIssues, rankCounts, totalFiles)
}

// Run if called directly
if (process.argv[1].includes('complexity.mjs')) {
  main()
}

export { main as runComplexityAnalysis }
