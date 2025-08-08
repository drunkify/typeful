#! /usr/bin/env node
import { generateTypes } from './generate.js'

const args = process.argv.slice(2)
const outputPath = args[0] || process.cwd()

generateTypes(outputPath).catch(console.error)
