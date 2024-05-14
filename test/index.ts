import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import t from 'tap'
import { fileURLToPath, pathToFileURL } from 'url'
import { findPackageJson, loadPackageJson } from '../src/index.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pj = resolve(__dirname, '../package.json')
const pkg = JSON.parse(readFileSync(pj, 'utf8'))

t.test('not in dist', t => {
  t.equal(findPackageJson(import.meta.url), pj)
  t.equal(findPackageJson(__filename), pj)
  t.equal(findPackageJson(import.meta.url, '../package.json'), pj)
  t.equal(findPackageJson(__filename, '../package.json'), pj)

  t.strictSame(loadPackageJson(import.meta.url), pkg)
  t.strictSame(loadPackageJson(__filename), pkg)
  t.strictSame(
    loadPackageJson(import.meta.url, '../package.json'),
    pkg,
  )
  t.strictSame(loadPackageJson(__filename, '../package.json'), pkg)

  t.end()
})

t.test('from dist, not in node_modules', t => {
  const dir = t.testdir({
    foo: {
      'package.json': JSON.stringify({
        name: 'foo',
        version: '1.2.3',
      }),
    },
    '@scoped': {
      foo: {
        'package.json': JSON.stringify({
          name: '@scoped/foo',
          version: '3.2.1',
        }),
      },
    },
  })
  t.test('unscoped', t => {
    const p = resolve(dir, 'foo/dist/a/b/x.js')
    const u = pathToFileURL(p)
    t.strictSame(loadPackageJson(p), {
      name: 'foo',
      version: '1.2.3',
    })
    t.strictSame(loadPackageJson(u), {
      name: 'foo',
      version: '1.2.3',
    })
    // pathFromSrc doesn't matter, we're in node_modules
    t.strictSame(loadPackageJson(p, '../../../package.json'), {
      name: 'foo',
      version: '1.2.3',
    })
    t.strictSame(loadPackageJson(u, '../../../package.json'), {
      name: 'foo',
      version: '1.2.3',
    })
    t.end()
  })
  t.test('scoped', t => {
    const p = resolve(dir, '@scoped/foo/dist/a/b/x.js')
    const u = pathToFileURL(p)
    t.strictSame(loadPackageJson(p), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.strictSame(loadPackageJson(u), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    // pathFromSrc doesn't matter, we're in node_modules
    t.strictSame(loadPackageJson(p, '../../../package.json'), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.strictSame(loadPackageJson(u, '../../../package.json'), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.end()
  })

  t.end()
})

t.test('from dist, in node_modules', t => {
  const dir = t.testdir({
    node_modules: {
      foo: {
        'package.json': JSON.stringify({
          name: 'foo',
          version: '1.2.3',
        }),
      },
      '@scoped': {
        foo: {
          'package.json': JSON.stringify({
            name: '@scoped/foo',
            version: '3.2.1',
          }),
        },
      },
    },
  })
  t.test('unscoped', t => {
    const p = resolve(dir, 'node_modules/foo/dist/a/b/x.js')
    const u = pathToFileURL(p)
    t.strictSame(loadPackageJson(p), {
      name: 'foo',
      version: '1.2.3',
    })
    t.strictSame(loadPackageJson(u), {
      name: 'foo',
      version: '1.2.3',
    })
    // pathFromSrc doesn't matter, we're in node_modules
    t.strictSame(loadPackageJson(p, '../../../package.json'), {
      name: 'foo',
      version: '1.2.3',
    })
    t.strictSame(loadPackageJson(u, '../../../package.json'), {
      name: 'foo',
      version: '1.2.3',
    })
    t.end()
  })
  t.test('scoped', t => {
    const p = resolve(dir, 'node_modules/@scoped/foo/dist/a/b/x.js')
    const u = pathToFileURL(p)
    t.strictSame(loadPackageJson(p), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.strictSame(loadPackageJson(u), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    // pathFromSrc doesn't matter, we're in node_modules
    t.strictSame(loadPackageJson(p, '../../../package.json'), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.strictSame(loadPackageJson(u, '../../../package.json'), {
      name: '@scoped/foo',
      version: '3.2.1',
    })
    t.end()
  })

  t.end()
})
