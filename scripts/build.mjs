import fs from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const baseTemplatePath = path.join(rootDir, "templates/base.html")
const navTemplatePath = path.join(rootDir, "templates/nav.html")
const pagesConfigPath = path.join(rootDir, "src/pages.json")
const portfolioConfigPath = path.join(rootDir, "src/pages/portfolio")
const portfolioDetailTemplatePath = path.join(rootDir, "templates/portfolio-detail.html")

const siteBasePath = (process.env.SITE_BASE_PATH || "/site").replace(/\/+$/, "")
const basePathPrefix = siteBasePath === "/" ? "" : siteBasePath

const TOKEN_REGEX = /\{\{[A-Z_]+\}\}/
const LINK_ATTR_REGEX = /\b(?:href|src)="([^"]+)"/g

function renderTemplate(template, replacements) {
  let rendered = template
  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.split(`{{${key}}}`).join(value ?? "")
  }
  return rendered
}

function prefixBasePath(value) {
  if (!value) return value
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:") ||
    value.startsWith("#")
  ) {
    return value
  }

  if (value.startsWith("/")) {
    return `${basePathPrefix}${value}`
  }

  return value
}

function rewriteRootAbsoluteLocalUrls(html) {
  return html.replace(LINK_ATTR_REGEX, (fullMatch, url) => {
    const rewritten = prefixBasePath(url)
    return fullMatch.replace(url, rewritten)
  })
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

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function titleCaseFromSlug(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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

    let pathname = reference.split("#")[0]
    if (!pathname) continue

    if (basePathPrefix && pathname.startsWith(`${basePathPrefix}/`)) {
      pathname = pathname.slice(basePathPrefix.length)
    }

    const targetPath = pathname.startsWith("/")
      ? path.join(rootDir, pathname)
      : path.resolve(outputDir, pathname)

    const exists = await fileExists(targetPath)
    if (!exists) {
      broken.push(`${path.relative(rootDir, outputFilePath)} -> ${reference}`)
    }
  }

  return broken
}

async function loadPortfolioConfigs() {
  const entries = await fs.readdir(portfolioConfigPath)

  const configs = await Promise.all(
    entries.map(async (entry) => {
      const configPath = path.join(portfolioConfigPath, entry)

      if (!(await fileExists(configPath)) || !entry.endsWith(".json")) {
        return null
      }

      const raw = await fs.readFile(configPath, "utf8")
      return {
        typeSlug: path.basename(entry, ".json"),
        config: JSON.parse(raw),
      }
    }),
  )

  return configs.filter(Boolean).sort((a, b) => a.typeSlug.localeCompare(b.typeSlug))
}

function toRelativeHref(fromFilePath, toFilePath, { stripIndex = false } = {}) {
  const fromDir = path.dirname(fromFilePath)
  let href = path.relative(fromDir, toFilePath).replace(/\\/g, "/")

  if (stripIndex) {
    href = href.replace(/index\.html$/, "")
    if (href === "") return "./"
  }

  return href
}

function buildPathReplacements(outputPath, portfolioPageOutputPath) {
  return {
    SITE_BASE_PATH: basePathPrefix,
    INDEX_HREF: toRelativeHref(outputPath, path.join(rootDir, "index.html")),
    LOGO_SRC: toRelativeHref(outputPath, path.join(rootDir, "logo.png")),
    STYLES_HREF: toRelativeHref(outputPath, path.join(rootDir, "styles.css")),
    SCRIPT_HREF: toRelativeHref(outputPath, path.join(rootDir, "script.js")),
    PORTFOLIO_HREF: toRelativeHref(outputPath, portfolioPageOutputPath),
    ABOUT_HREF: toRelativeHref(outputPath, path.join(rootDir, "about.html")),
    BLOG_HREF: toRelativeHref(outputPath, path.join(rootDir, "blog.html")),
    FAQ_HREF: toRelativeHref(outputPath, path.join(rootDir, "faq.html")),
    COMMISSIONS_HREF: toRelativeHref(outputPath, path.join(rootDir, "commissions.html")),
    CONTACT_HREF: toRelativeHref(outputPath, path.join(rootDir, "contact.html")),
  }
}

function buildPortfolioDropdownItemsHtml(portfolioConfigs, currentOutputPath, portfolioPageOutputPath) {
  const portfolioPageHref = toRelativeHref(currentOutputPath, portfolioPageOutputPath)

  return portfolioConfigs
    .map(({ typeSlug }) => {
      const typeLabel = titleCaseFromSlug(typeSlug)
      return `<li><a href="${portfolioPageHref}#${typeSlug}">${typeLabel}</a></li>`
    })
    .join("\n")
}

function buildViewsHtml(views, title) {
  return (views ?? [])
    .map(
      (viewSrc) => `
        <figure class="overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <img
            src="${prefixBasePath(viewSrc)}"
            alt="${title}"
            class="aspect-square w-full object-cover"
            loading="lazy"
          />
        </figure>
      `,
    )
    .join("")
}

function buildPortfolioSectionsHtml(portfolioConfigs, currentOutputPath) {
  const currentDir = path.dirname(currentOutputPath)

  return portfolioConfigs
    .map(({ typeSlug, config }) => {
      const typeLabel = titleCaseFromSlug(typeSlug)
      const images = Array.isArray(config.images) ? config.images : []

      const itemsHtml = images
        .map((image) => {
          const pieceSlug = slugify(image.title)
          const detailOutputPath = path.join(
            rootDir,
            "portfolio",
            typeSlug,
            pieceSlug,
            "index.html",
          )

          let href = path.relative(currentDir, detailOutputPath).replace(/\\/g, "/")
          href = href.replace(/index\.html$/, "")

          return `
            <a href="${href}" class="portfolio-item" aria-label="${image.title}">
              <img src="${prefixBasePath(image.src)}" alt="${image.title}" loading="lazy">
            </a>
          `
        })
        .join("")

      return `
        <section id="${typeSlug}" class="content-section" style="max-width: 100%; margin-top: 80px;">
          <h2 style="text-align: center; margin-bottom: 40px;">${typeLabel}</h2>
          <div class="portfolio-grid">
            ${itemsHtml}
          </div>
        </section>
      `
    })
    .join("\n")
}

function buildNavHtml(navTemplate, currentOutputPath, portfolioConfigs, portfolioPageOutputPath) {
  const replacements = {
    ...buildPathReplacements(currentOutputPath, portfolioPageOutputPath),
    PORTFOLIO_DROPDOWN_ITEMS: buildPortfolioDropdownItemsHtml(
      portfolioConfigs,
      currentOutputPath,
      portfolioPageOutputPath,
    ),
  }

  return renderTemplate(navTemplate, replacements)
}

async function build() {
  const [baseTemplate, navTemplate, portfolioDetailTemplate, pagesRaw, portfolioConfigs] =
    await Promise.all([
      fs.readFile(baseTemplatePath, "utf8"),
      fs.readFile(navTemplatePath, "utf8"),
      fs.readFile(portfolioDetailTemplatePath, "utf8"),
      fs.readFile(pagesConfigPath, "utf8"),
      loadPortfolioConfigs(),
    ])

  const pages = JSON.parse(pagesRaw)
  const generatedPaths = []

  const portfolioPage = pages.find((page) => path.basename(page.output) === "portfolio.html")
  if (!portfolioPage) {
    throw new Error('Could not find "portfolio.html" in src/pages.json')
  }

  const portfolioPageOutputPath = path.join(rootDir, portfolioPage.output)

  for (const page of pages) {
    const outputPath = path.join(rootDir, page.output)
    const pathReplacements = buildPathReplacements(outputPath, portfolioPageOutputPath)
    const navHtml = buildNavHtml(
      navTemplate,
      outputPath,
      portfolioConfigs,
      portfolioPageOutputPath,
    )

    let pageContent = await fs.readFile(path.join(rootDir, page.content), "utf8")
    pageContent = renderTemplate(pageContent, pathReplacements)

    const pageHead = page.head ? await fs.readFile(path.join(rootDir, page.head), "utf8") : ""

    if (path.basename(page.output) === "portfolio.html") {
      pageContent = renderTemplate(pageContent, {
        PORTFOLIO_SECTIONS: buildPortfolioSectionsHtml(portfolioConfigs, outputPath),
      })
    }

    let html = renderTemplate(baseTemplate, {
      TITLE: page.title,
      DESCRIPTION: page.description,
      HEAD_EXTRA: pageHead,
      NAV: navHtml,
      MAIN_CONTENT: pageContent,
      ...pathReplacements,
    })

    html = rewriteRootAbsoluteLocalUrls(html)

    if (TOKEN_REGEX.test(html)) {
      throw new Error(`Unresolved template token while building ${page.output}`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, html, "utf8")
    generatedPaths.push(outputPath)
  }

  for (const { typeSlug, config } of portfolioConfigs) {
    const buildTypeLabel = titleCaseFromSlug(typeSlug)
    const images = Array.isArray(config.images) ? config.images : []

    for (const image of images) {
      const pieceSlug = slugify(image.title)
      const outputPath = path.join(
        rootDir,
        "portfolio",
        typeSlug,
        pieceSlug,
        "index.html",
      )

      const pathReplacements = buildPathReplacements(outputPath, portfolioPageOutputPath)
      const navHtml = buildNavHtml(
        navTemplate,
        outputPath,
        portfolioConfigs,
        portfolioPageOutputPath,
      )

      const detailContent = renderTemplate(portfolioDetailTemplate, {
        BUILD_TYPE_LABEL: buildTypeLabel,
        TITLE: image.title,
        MAIN_SRC: prefixBasePath(image.src),
        DESCRIPTION: image.description,
        VIEWS_HTML: buildViewsHtml(image.views, image.title),
        ...pathReplacements,
      })

      let html = renderTemplate(baseTemplate, {
        TITLE: `${image.title} | ${buildTypeLabel}`,
        DESCRIPTION: image.description,
        HEAD_EXTRA: "",
        NAV: navHtml,
        MAIN_CONTENT: detailContent,
        ...pathReplacements,
      })

      html = rewriteRootAbsoluteLocalUrls(html)

      if (TOKEN_REGEX.test(html)) {
        throw new Error(
          `Unresolved template token while building ${path.relative(rootDir, outputPath)}`,
        )
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, html, "utf8")
      generatedPaths.push(outputPath)
    }
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
