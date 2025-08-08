import sql from './db.js'
import fs from 'fs'
import path from 'path'

type Table = {
  schemaname: string
  tablename: string
}

type Column = {
  column_name: string
  data_type: string
  is_nullable: string
}

type ForeignKey = {
  column_name: string
  foreign_table: string
}

const typeMapping: { [key: string]: string } = {
  // Numeric types
  'smallint': 'number',
  'integer': 'number',
  'bigint': 'number',
  'decimal': 'number',
  'numeric': 'number',
  'real': 'number',
  'double precision': 'number',
  'smallserial': 'number',
  'serial': 'number',
  'bigserial': 'number',

  // Character types
  'character varying': 'string',
  'varchar': 'string',
  'character': 'string',
  'char': 'string',
  'text': 'string',

  // Date/time types
  'timestamp': 'string',
  'timestamp without time zone': 'string',
  'timestamp with time zone': 'string',
  'date': 'string',
  'time': 'string',
  'time without time zone': 'string',
  'time with time zone': 'string',
  'interval': 'string',

  // Boolean type
  'boolean': 'boolean',

  // UUID type
  'uuid': 'string',

  // JSON types
  'json': 'any',
  'jsonb': 'any',

  // Binary types
  'bytea': 'Buffer',

  // Geometric types
  'point': 'string',
  'line': 'string',
  'lseg': 'string',
  'box': 'string',
  'path': 'string',
  'polygon': 'string',
  'circle': 'string',

  // Network types
  'inet': 'string',
  'cidr': 'string',
  'macaddr': 'string',
  'macaddr8': 'string',

  // Bit string types
  'bit': 'string',
  'bit varying': 'string',

  // Text search types
  'tsvector': 'string',
  'tsquery': 'string',

  // Money type
  'money': 'number',

  // Array types (basic handling)
  'integer[]': 'number[]',
  'text[]': 'string[]',
  'varchar[]': 'string[]',
  'boolean[]': 'boolean[]',

  // Range types
  'int4range': 'string',
  'int8range': 'string',
  'numrange': 'string',
  'tsrange': 'string',
  'tstzrange': 'string',
  'daterange': 'string',
}

const reservedWords = new Set([
  'import',
  'export',
  'default',
  'class',
  'function',
  'const',
  'let',
  'var',
  'if',
  'else',
  'for',
  'while',
  'return',
  'async',
  'await',
  'yield',
  'static',
  'extends',
  'implements',
  'interface',
  'enum',
  'type',
  'namespace',
  'module',
  'declare',
  'abstract',
  'as',
  'from',
  'get',
  'set',
  'null',
  'undefined',
  'true',
  'false',
  'new',
  'this',
  'super',
  'typeof',
  'instanceof',
  'in',
  'of',
  'void',
  'delete',
  'try',
  'catch',
  'finally',
  'throw',
  'switch',
  'case',
  'break',
  'continue',
  'do',
  'with',
  'debugger',
  'public',
  'private',
  'protected',
  'readonly',
  'require',
  'imports',
  'exports',
  'package',
])

function setupDirectories(basePath: string): string {
  const typesDir = path.join(basePath, 'generated', 'tables')
  if (fs.existsSync(typesDir)) {
    fs.readdirSync(typesDir).forEach((file) => {
      fs.unlinkSync(path.join(typesDir, file))
    })
  } else {
    fs.mkdirSync(path.join(basePath, 'generated'))
    fs.mkdirSync(path.join(basePath, 'generated', 'tables'))
    fs.mkdirSync(path.join(basePath, 'generated', 'views'))
  }
  return typesDir
}

function generateTypeDefinition(tableName: string, columns: Column[]): string {
  const typeName = reservedWords.has(tableName) ? `_${tableName}` : tableName
  let typeDefinitions = `export type ${typeName} = {\n`
  for (const c of columns) {
    const tsType = typeMapping[c.data_type] || 'any'
    const optional = c.is_nullable === 'YES' ? '?' : ''
    const propertyName = reservedWords.has(c.column_name) ? `_${c.column_name}` : c.column_name
    typeDefinitions += `    ${propertyName}${optional}: ${tsType};\n`
  }
  typeDefinitions += '}\n'
  return typeDefinitions
}

function writeTypeFile(typesDir: string, tableName: string, content: string): string {
  const fileName = reservedWords.has(tableName) ? `_${tableName}` : tableName
  const filePath = path.join(typesDir, `${fileName}.ts`)
  fs.writeFileSync(filePath, content)
  console.info(`Created file: ${filePath}`)
  return fileName
}

function processForeignKeyRelationship(fk: ForeignKey, tableName: string, typesDir: string, uniqueProperties: Set<string>, uniqueImports: Set<string>): { updatedDefinitions?: string } {
  const propertyName = reservedWords.has(fk.foreign_table) ? `_${fk.foreign_table}` : fk.foreign_table
  const foreignTypeName = reservedWords.has(fk.foreign_table) ? `_${fk.foreign_table}` : fk.foreign_table

  let updatedDefinitions: string | undefined

  if (!uniqueProperties.has(propertyName)) {
    uniqueProperties.add(propertyName)
    updatedDefinitions = `    ${propertyName}: ${foreignTypeName}[];\n}`
  }

  uniqueImports.add(fk.foreign_table)

  const foreignFileName = reservedWords.has(fk.foreign_table) ? `_${fk.foreign_table}` : fk.foreign_table
  const foreignFilePath = path.join(typesDir, `${foreignFileName}.ts`)
  if (!fs.existsSync(foreignFilePath)) {
    fs.writeFileSync(foreignFilePath, `export type ${foreignTypeName} = {\n    // Define fields here\n}\n`)
    console.info(`Created file: ${foreignFilePath}`)
  }

  addReverseRelationship(fk.foreign_table, tableName, typesDir)

  return { updatedDefinitions }
}

function addReverseRelationship(foreignTable: string, sourceTable: string, typesDir: string): void {
  const foreignFileName = reservedWords.has(foreignTable) ? `_${foreignTable}` : foreignTable
  const reverseFilePath = path.join(typesDir, `${foreignFileName}.ts`)
  let reverseTypeDefinitions = fs.readFileSync(reverseFilePath, 'utf8')

  const reversePropertyName = reservedWords.has(sourceTable) ? `_${sourceTable}` : sourceTable
  const reverseTypeName = reservedWords.has(sourceTable) ? `_${sourceTable}` : sourceTable

  if (!reverseTypeDefinitions.includes(`${reversePropertyName}:`)) {
    reverseTypeDefinitions = reverseTypeDefinitions.replace(/}\s*$/, `    ${reversePropertyName}: ${reverseTypeName}[];\n}`)

    if (sourceTable !== foreignTable) {
      const importTypeName = reservedWords.has(sourceTable) ? `_${sourceTable}` : sourceTable
      const importFileName = reservedWords.has(sourceTable) ? `_${sourceTable}` : sourceTable
      const reverseImport = `import type { ${importTypeName} } from './${importFileName}';\n`
      if (!reverseTypeDefinitions.includes(reverseImport)) {
        reverseTypeDefinitions = reverseImport + reverseTypeDefinitions
      }
    }

    fs.writeFileSync(reverseFilePath, reverseTypeDefinitions)
    console.info(`Updated file with reverse relationship: ${reverseFilePath}`)
  }
}

async function processForeignKeys(tableName: string, typesDir: string): Promise<void> {
  const foreignKeys = await sql<ForeignKey[]>`
    SELECT 
      kcu.column_name, 
      ccu.table_name AS foreign_table
    FROM 
      information_schema.key_column_usage AS kcu
    JOIN 
      information_schema.constraint_column_usage AS ccu 
    ON 
      kcu.constraint_name = ccu.constraint_name
    WHERE 
      kcu.table_name = ${tableName}
      AND kcu.constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
      )
  `

  if (foreignKeys.length === 0) return

  const fileName = reservedWords.has(tableName) ? `_${tableName}` : tableName
  const filePath = path.join(typesDir, `${fileName}.ts`)
  let typeDefinitions = fs.readFileSync(filePath, 'utf8')

  const uniqueImports = new Set<string>()
  const uniqueProperties = new Set<string>()

  const existingImports = typeDefinitions.match(/import type { (\w+) } from/g) || []
  existingImports.forEach((imp) => {
    const match = imp.match(/import type { (\w+) } from/)
    if (match) uniqueImports.add(match[1])
  })

  const existingProps = typeDefinitions.match(/^\s*(\w+):/gm) || []
  existingProps.forEach((prop) => {
    const match = prop.match(/^\s*(\w+):/)
    if (match) uniqueProperties.add(match[1])
  })

  for (const fk of foreignKeys) {
    const result = processForeignKeyRelationship(fk, tableName, typesDir, uniqueProperties, uniqueImports)

    if (result.updatedDefinitions !== undefined) {
      typeDefinitions = typeDefinitions.replace(/}\s*$/, result.updatedDefinitions)
    }
  }

  let imports = ''
  for (const imp of uniqueImports) {
    if (imp === tableName) continue

    const importTypeName = reservedWords.has(imp) ? `_${imp}` : imp
    const importFileName = reservedWords.has(imp) ? `_${imp}` : imp

    if (!typeDefinitions.includes(`import type { ${importTypeName} } from`)) {
      imports += `import type { ${importTypeName} } from './${importFileName}';\n`
    }
  }

  if (imports !== '') {
    typeDefinitions = `${imports}\n${typeDefinitions}`
  }

  fs.writeFileSync(filePath, typeDefinitions)
  console.info(`Updated file with foreign keys: ${filePath}`)
}

export const generateTypes = async (outputPath?: string): Promise<void> => {
  const res = await sql<Table[]>`SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname='public'`
  console.info(`Found ${res.length} tables in the public schema.`)
  const basePath = outputPath ?? process.env.PWD ?? ''
  const typesDir = setupDirectories(basePath)

  let rootTypeDefinitions = ''
  let rootImports = ''

  for (const t of res.filter((table) => table.schemaname === 'public')) {
    console.info(t.tablename)
    const columns = await sql<Column[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = ${t.tablename}
    `

    const typeDefinitions = generateTypeDefinition(t.tablename, columns)
    const fileName = writeTypeFile(typesDir, t.tablename, typeDefinitions)

    const typeName = reservedWords.has(t.tablename) ? `_${t.tablename}` : t.tablename
    rootImports += `import type { ${typeName} } from './${fileName}';\n`
    rootTypeDefinitions += `    ${t.tablename}: ${typeName}[];\n`
  }

  for (const t of res.filter((table) => table.schemaname === 'public')) {
    await processForeignKeys(t.tablename, typesDir)
  }

  rootTypeDefinitions = `export type Tables = {\n${rootTypeDefinitions}}\n`
  const rootFilePath = path.join(typesDir, 'index.ts')

  fs.writeFileSync(rootFilePath, `${rootImports}\n${rootTypeDefinitions}`)
  console.info(`Created root type file: ${rootFilePath}`)
}
