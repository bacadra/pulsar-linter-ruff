'use babel'

import { CompositeDisposable, File } from 'atom'
import { exec } from 'child_process'
const tmp  = require('tmp')

export default {

  config: {
    executable: {
      type: 'string',
      title: 'Path to executable',
      description: 'Make sure `ruff` executable is available from command line',
      default: 'ruff',
      order: 1,
    },
    pyVersion: {
      type: 'string',
      title: 'Python version',
      description: 'The minimum Python version that should be supported',
      default: '',
      enum: [
        {value:''     , description:'Default'    },
        {value:'py311', description:'Python 3.11'},
        {value:'py311', description:'Python 3.11'},
        {value:'py310', description:'Python 3.10'},
        {value:'py39' , description:'Python 3.9' },
        {value:'py38' , description:'Python 3.8' },
        {value:'py37' , description:'Python 3.7' },
      ],
      order: 2,
    },
    select: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Select',
      description: 'Comma-separated list of rule codes to enable or `ALL` to enable all rules',
      default: [],
      order: 3,
    },
    ignore: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Ignore',
      description: 'Comma-separated list of rule codes to disable',
      default: [],
      order: 4,
    },
    fixable: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Fixable',
      description: 'Comma-separated list of rule codes to treat as eligible for autofix',
      default: [],
      order: 5,
    },
    unfixable: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Unfixable',
      description: 'Comma-separated list of rule codes to treat as ineligible for autofix',
      default: [],
      order: 6,
    },
    error: {
      type: 'array', items: { type: 'string' },
      title: 'Class selection: Error',
      description: 'Comma-separated list of rule codes to treat as error type',
      default: [],
      order: 7,
    },
    warning: {
      type: 'array', items: { type: 'string' },
      title: 'Class selection: Warning',
      description: 'Comma-separated list of rule codes to treat as warning type',
      default: [],
      order: 8,
    },
    info: {
      type: 'array', items: { type: 'string' },
      title: 'Class selection: Info',
      description: 'Comma-separated list of rule codes to treat as info type',
      default: [],
      order: 9,
    },
    useNoqa: {
      type: 'boolean',
      title: 'Use noqa flag',
      description: 'Flag `# noqa` is used to silent linter messages per line',
      default: true,
      order: 10,
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
        }
      }),
      atom.commands.add('atom-workspace', {
        'linter-ruff:fix' : () => {this.lint(atom.workspace.getActiveTextEditor(), true )},
      }),
    );
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
    };
  },

  lint(editor, fix=false) {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix:'.py' }, (fileError, tempPath) => {
        if (fileError) { return reject(fileError) }
        let editorPath = editor.getPath()
        let editorText = editor.getText()
        new File(tempPath).write(editorText).then( () => {
          let args = ['--quiet', '--format=json', `--stdin-filename="${editorPath}"`, '--no-cache']
          if (this.select.length) {args.push(`--select=${this.select.join(",")}`)}
          if (this.ignore.length) {args.push(`--ignore=${this.ignore.join(",")}`)}
          if (this.fixable.length) {args.push(`--fixable=${this.fixable.join(",")}`)}
          if (this.unfixable.length) {args.push(`--unfixable=${this.unfixable.join(",")}`)}
          if (!this.useNoqa) {args.push('--ignore-noqa')}
          if (this.pyVersion) {args.push(`--target-version=${this.pyVersion}`)}
          if (fix) {args.push('--fix-only')}
          let opts = { timeout:30*1e4 }
          exec(`"${this.executable}" check ${tempPath} ${args.join(' ')}`, opts, (error, stdout, stderr) => {
            if (stderr) {
              console.log(stderr) ; reject(error)
            } else if (fix) {
              new File(tempPath).read().then( (newText) => { editor.setText(newText) ; resolve() })
            } else {
              let items = JSON.parse(stdout)
              let data = [] ; let severity
              for (let item of Object.values(items)) {
                if (item.code==='E999') {
                  severity = 'error' ; item.location.column = 1
                } else if ( this.error(item.code) ) {
                  severity = 'error'
                } else if ( this.warning(item.code) ) {
                  severity = 'warning'
                } else if ( this.info(item.code) ) {
                  severity = 'info'
                } else {
                  severity = 'error' ; item.code += '*'
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
  }
}
