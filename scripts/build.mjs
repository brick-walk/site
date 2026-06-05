import fs from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const baseTemplatePath = path.join(rootDir, "templates/base.html")
const navTemplatePath = path.join(rootDir, "templates/nav.html")
const pagesConfigPath = path.join(rootDir, "src/pages.json")

const TOKEN_REGEX = /\{\{[A-Z_]+\}\}/
const LINK_ATTR_REGEX = /\b(?:href|src)="([^"]+)"/g

function renderTemplate(template, replacements) {
  let rendered = template
  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.split(`{{${key}}}`).join(value ?? "")
  }
  return rendered
}

function isSkippableReference(value) {
  return (
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:") ||
    value.startsWith("//")
  )
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function findBrokenReferences(outputFilePath, html) {
  const broken = []
  const outputDir = path.dirname(outputFilePath)
  const references = html.matchAll(LINK_ATTR_REGEX)

  for (const match of references) {
    const reference = match[1]
    if (!reference || isSkippableReference(reference)) {
      continue
    }

    const [pathname] = reference.split("#")
    if (!pathname) {
      continue
    }

    const targetPath = pathname.startsWith("/")
      ? path.join(rootDir, pathname)
      : path.resolve(outputDir, pathname)

    const exists = await fileExists(targetPath)
    if (!exists) {
      broken.push(`${path.basename(outputFilePath)} -> ${reference}`)
      console.warn(targetPath)
    }
  }

  return broken
}

async function build() {
  const [baseTemplate, navTemplate, pagesRaw] = await Promise.all([
    fs.readFile(baseTemplatePath, "utf8"),
    fs.readFile(navTemplatePath, "utf8"),
    fs.readFile(pagesConfigPath, "utf8"),
  ])

  const pages = JSON.parse(pagesRaw)
  const generatedPaths = []

  for (const page of pages) {
    const pageContent = await fs.readFile(path.join(rootDir, page.content), "utf8")
    const pageHead = page.head ? await fs.readFile(path.join(rootDir, page.head), "utf8") : ""

    const html = renderTemplate(baseTemplate, {
      TITLE: page.title,
      DESCRIPTION: page.description,
      HEAD_EXTRA: pageHead,
      NAV: navTemplate,
      MAIN_CONTENT: pageContent,
    })

    if (TOKEN_REGEX.test(html)) {
      throw new Error(`Unresolved template token while building ${page.output}`)
    }

    const outputPath = path.join(rootDir, page.output)
    await fs.writeFile(outputPath, html, "utf8")
    generatedPaths.push(outputPath)
  }

  const allBroken = []
  for (const generatedPath of generatedPaths) {
    const html = await fs.readFile(generatedPath, "utf8")
    const broken = await findBrokenReferences(generatedPath, html)
    allBroken.push(...broken)
  }

  if (allBroken.length > 0) {
    const message = [
      "Build completed, but broken local links/references were found:",
      ...allBroken.map((entry) => ` - ${entry}`),
    ].join("\n")
    throw new Error(message)
  }

  console.log(`Built ${generatedPaths.length} pages successfully.`)
}

build().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
