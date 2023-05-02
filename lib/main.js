'use babel'

import { CompositeDisposable, File } from 'atom'
import { exec } from 'child_process'
const tmp  = require('tmp')

export default {

  config: {
    executable: {
      type: 'string',
      title: 'Path to ruff executable',
      default: 'ruff',
      order: 1,
    },
    select: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Select',
      description: 'Comma-separated list of rule codes to enable or `ALL` to enable all rules',
      default: [],
      order: 2,
    },
    ignore: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Ignore',
      description: 'Comma-separated list of rule codes to disable',
      default: [],
      order: 3,
    },
    fixable: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Fixable',
      description: 'Comma-separated list of rule codes to treat as eligible for autofix',
      default: [],
      order: 4,
    },
    unfixable: {
      type: 'array', items: { type: 'string' },
      title: 'Rule selection: Unfixable',
      description: 'Comma-separated list of rule codes to treat as ineligible for autofix',
      default: [],
      order: 5,
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
  },

  activate() {
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe("linter-ruff.executable", (value) => {
        this.executable = value
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

  lint(editor) {
    return new Promise((resolve, reject) => {
      tmp.file({ postfix:'.py' }, (fileError, tempPath) => {
        if (fileError) { return reject(fileError) }
        let editorPath = editor.getPath()
        let editorText = editor.getText()
        new File(tempPath).write(editorText).then( () =>{
          let args = ['--quiet', '--format=json', `--ignore-noqa`]
          if (this.select.length) {args.push(`--select=${this.select.join(",")}`)}
          if (this.ignore.length) {args.push(`--ignore=${this.ignore.join(",")}`)}
          if (this.fixable.length) {args.push(`--fixable=${this.fixable.join(",")}`)}
          if (this.unfixable.length) {args.push(`--unfixable=${this.unfixable.join(",")}`)}
          let opts = { timeout:30*1e4 }
          exec(`"${this.executable}" check ${tempPath} ${args.join(' ')}`, opts, (error, stdout, stderr) => {
            if (stderr) { console.log(stderr) ; return reject(error) }
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
            return resolve(data)
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
