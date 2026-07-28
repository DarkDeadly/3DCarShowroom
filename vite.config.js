import { defineConfig } from 'vite'
import { resolve } from 'path'
import { globSync } from 'glob'

const pages = globSync('src/pages/**/*.html')

// build entries: { about: '/abs/path/src/pages/about.html', ... }
const pageInputs = Object.fromEntries(
  pages.map(file => [
    file.slice('src/pages/'.length, -'.html'.length).replace(/\//g, '_'),
    resolve(__dirname, file)
  ])
)

export default defineConfig({
  build: {
    rollupOptions: {
      input: pageInputs
    }
  },
  server: {
    middlewareMode: false
  },
  appType: 'mpa',
  plugins: [
    {
      name: 'clean-urls-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0]
          if (url !== '/' && !url.includes('.') ) {
            const candidate = `/src/pages/${url}.html`
            const fs = require('fs')
            const path = require('path')
            if (fs.existsSync(path.join(__dirname, candidate))) {
              req.url = candidate
            }
          }
          next()
        })
      }
    }
  ]
})