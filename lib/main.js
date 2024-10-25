'use babel'

import { CompositeDisposable, File } from 'atom'
import { exec } from 'child_process'
import tmp from 'tmp'
import path from 'path'
import os from 'os'

export default {

  config: {
    executable: {
      title: 'Path to executable',
      description: 'Make sure `ruff` executable is available from command line',
      type: 'string',
      default: 'ruff',
      order: 1,
    },
    pyVersion: {
      title: 'Python version',
      description: 'The minimum Python version that should be supported',
      type: 'string',
      default: '',
      enum: [
        { value:''     , description:'Default' },
        { value:'py313', description:'Python 3.13' },
        { value:'py312', description:'Python 3.12' },
        { value:'py311', description:'Python 3.11' },
        { value:'py310', description:'Python 3.10' },
        { value:'py39' , description:'Python 3.9' },
        { value:'py38' , description:'Python 3.8' },
        { value:'py37' , description:'Python 3.7' },
      ],
      order: 2,
    },
    select: {
      title: 'Rule selection: Select',
      description: 'Comma-separated list of rule codes to enable or `ALL` to enable all rules. Leave empty if you want use configuration files',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 3,
    },
    ignore: {
      title: 'Rule selection: Ignore',
      description: 'Comma-separated list of rule codes to disable',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 4,
    },
    fixable: {
      title: 'Rule selection: Fixable',
      description: 'Comma-separated list of rule codes to treat as eligible for autofix',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 5,
    },
    unfixable: {
      title: 'Rule selection: Unfixable',
      description: 'Comma-separated list of rule codes to treat as ineligible for autofix',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 6,
    },
    error: {
      title: 'Severity selection: Error',
      description: 'Comma-separated list of rule codes to treat as error type',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 7,
    },
    warning: {
      title: 'Severity selection: Warning',
      description: 'Comma-separated list of rule codes to treat as warning type',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 8,
    },
    info: {
      title: 'Severity selection: Info',
      description: 'Comma-separated list of rule codes to treat as info type',
      type: 'array', items: { type: 'string' },
      default: [],
      order: 9,
    },
    useNoqa: {
      title: 'Use noqa flag',
      description: 'Flag `# noqa` is used to silent linter messages per line',
      type: 'boolean',
      default: true,
      order: 10,
    },
    addStar: {
      title: 'Unclassified flags marked by star',
      description: 'Add star to all flags which user do not classified yet',
      type: 'boolean',
      default: true,
      order: 11,
    },
    allowMagic: {
      title: 'Allow magic commands',
      description: 'A bypass of magic commands e.g. `%timeit`',
      type: 'boolean',
      default: true,
      order: 12,
    },
  },

  activate() {
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe("linter-ruff.executable", (value) => {
        this.executable = value
      }),
      atom.config.observe("linter-ruff.configPath", (value) => {
        this.config = value
      }),
      atom.config.observe("linter-ruff.pyVersion", (value) => {
        this.pyVersion = value
      }),
      atom.config.observe("linter-ruff.useNoqa", (value) => {
        this.useNoqa = value
      }),
      atom.config.observe("linter-ruff.addStar", (value) => {
        this.addStar = value
      }),
      atom.config.observe("linter-ruff.allowMagic", (value) => {
        this.allowMagic = value
      }),
      atom.config.observe("linter-ruff.select", (value) => {
        this.select = value
      }),
      atom.config.observe("linter-ruff.ignore", (value) => {
        this.ignore = value
      }),
      atom.config.observe("linter-ruff.fixable", (value) => {
        this.fixable = value
      }),
      atom.config.observe("linter-ruff.unfixable", (value) => {
        this.unfixable = value
      }),
      atom.config.observe("linter-ruff.error", (value) => {
        this.error = this.parseClass(value)
      }),
      atom.config.observe("linter-ruff.warning", (value) => {
        this.warning = this.parseClass(value)
      }),
      atom.config.observe("linter-ruff.info", (value) => {
        this.info = this.parseClass(value)
      }),
      atom.commands.add('atom-workspace', {
        'linter-ruff:toggle-noqa': () => {
          atom.config.set("linter-ruff.useNoqa", !this.useNoqa)
        },
        'linter-ruff:global-pyproject': () => {
          this.openDefaultConfig()
        },
      }),
      atom.commands.add('atom-workspace', {
        'linter-ruff:fix' : () => { this.lint(atom.workspace.getActiveTextEditor(), true) },
      }),
    )
  },

  deactivate() {
    this.disposables.dispose()
  },

  provideLinter() {
    return {
      name: 'ruff',
      scope: 'file',
      lintsOnChange: true,
      grammarScopes: ['source.python', 'source.python.django'],
      lint: this.lint.bind(this),
    }
  },

  lint(editor, fix=false) {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix:'.py' }, (fileError, tempPath) => {
        if (fileError) { return reject(fileError) }
        let editorPath = editor.getPath()
        let editorText = editor.getText()
        if (this.allowMagic) {
          editorText = editorText.replace(/^%/gm, '# %')
          editorText = editorText.replace(/(?<!\w)(_{1,3})(?!\w)/gm, (_, g1) => { return '0'.repeat(g1.length) })
        }
        new File(tempPath).write(editorText).then( () => {
          let args = ['--quiet', '--output-format=json', '--no-cache']
          if (this.select.length) { args.push(`--select=${this.select.join(",")}`) }
          if (this.ignore.length) { args.push(`--ignore=${this.ignore.join(",")}`) }
          if (this.fixable.length) { args.push(`--fixable=${this.fixable.join(",")}`) }
          if (this.unfixable.length) { args.push(`--unfixable=${this.unfixable.join(",")}`) }
          if (!this.useNoqa) { args.push('--ignore-noqa') }
          if (this.pyVersion) { args.push(`--target-version=${this.pyVersion}`) }
          if (fix) { args.push('--fix-only') }
          let opts = { timeout:30*1e4, cwd:path.dirname(editorPath) }
          exec(`"${this.executable}" check "${tempPath}" ${args.join(' ')}`, opts, (error, stdout, stderr) => {
            if (stderr) {
              console.log(stderr) ; reject(error)
            } else if (fix) {
              new File(tempPath).read().then( (newText) => { editor.setText(newText) ; resolve() })
            } else {
              let items = JSON.parse(stdout)
              let data = [] ; let severity
              for (let item of Object.values(items)) {
                if (item.code===null || item.code==='E999') {
                  severity = 'error' ; item.location.column = 1 ; item.code = null
                } else if ( this.error(item.code) ) {
                  severity = 'error'
                } else if ( this.warning(item.code) ) {
                  severity = 'warning'
                } else if ( this.info(item.code) ) {
                  severity = 'info'
                } else {
                  severity = 'error'
                  if (this.addStar) { item.code += '*' }
                }
                data.push({
                  severity: severity,
                  linterName: item.code,
                  excerpt: item.message,
                  location: { file: editorPath,
                    position: [
                      [item.location.row-1, item.location.column-1],
                      [item.end_location.row-1, item.end_location.column-1]
                  ]},
                })
              }
              resolve(data)
            }
          })
        })
      })
    })
  },

  parseClass(patterns) {
    return (code) => {
      for (let pattern of patterns) {
        if (code.startsWith(pattern)) { return true }
      }
      return false
    }
  },

  getPathOfDefaultConfig() {
    let platform = os.platform()
    if (platform==='win32') {
      return path.join(os.homedir(), 'AppData', 'Roaming', 'ruff', 'pyproject.toml')
    } else {
      atom.notifications.addError(`A platform "${platform}" has not been cofiguret yet`)
    }
  },

  openDefaultConfig() {
    let configPath = this.getPathOfDefaultConfig()
    if (!configPath) { return }
    atom.workspace.open(configPath)
  },

}
