'use babel'

import { CompositeDisposable, File } from 'atom'
import { exec } from 'child_process'
const tmp = require('tmp')

export default {

  config: {
    flake8: {
      type: 'object',
      title: 'flake8',
      order: 1,
      properties: {
        executable: {
          type: 'string',
          title: 'Path to flake8 executable',
          description: '#TODO',
          default: 'flake8',
          order: 1,
        },
        skipped: {
          type: 'string',
          title: 'Regex to determine skippaable codes',
          default: '',
          order: 2,
        },
        complexity: {
          "description": "McCabe complexity threshold (`-1` to disable)",
          type: "integer",
          default: 10,
        },
      },
    },
  },

  flake8: {
    infos: ['F401', 'F403', 'F404', 'F504', 'F522', 'F523', 'F524', 'F541', 'F811', 'F841', 'E101', 'E111', 'E112', 'E113', 'E114', 'E115', 'E116', 'E117', 'E121', 'E122', 'E123', 'E124', 'E125', 'E126', 'E127', 'E128', 'E129', 'E131', 'E133', 'E201', 'E202', 'E203', 'E211', 'E221', 'E222', 'E223', 'E224', 'E225', 'E226', 'E227', 'E228', 'E231', 'E241', 'E242', 'E251', 'E261', 'E262', 'E265', 'E266', 'E271', 'E272', 'E273', 'E274', 'E275', 'E301', 'E302', 'E303', 'E304', 'E305', 'E306', 'E401', 'E402', 'E501', 'E502', 'E701', 'E702', 'E703', 'E704', 'E711', 'E712', 'E713', 'E714', 'E721', 'E722', 'E731', 'E741', 'E742', 'E743', 'D100', 'D101', 'D102', 'D103', 'D104', 'D105', 'D106', 'D107', 'D200', 'D201', 'D202', 'D203', 'D204', 'D205', 'D206', 'D207', 'D208', 'D209', 'D210', 'D211', 'D212', 'D213', 'D214', 'D215', 'D300', 'D301', 'D302', 'D400', 'D401', 'D401', 'D402', 'D403', 'D404', 'D405', 'D406', 'D407', 'D408', 'D409', 'D410', 'D411', 'D412', 'D413', 'D414', 'D415', 'D416', 'D417', 'D418', 'D419'],
    warns: ['F402', 'F601', 'F602', 'F631', 'F634', 'F901', 'C901', 'W191', 'W291', 'W292', 'W293', 'W391', 'W503', 'W504', 'W505', 'W605', 'W606'],
    errors: ['F405', 'F406', 'F407', 'F501', 'F502', 'F503', 'F505', 'F506', 'F507', 'F508', 'F509', 'F521', 'F525', 'F621', 'F622', 'F632', 'F633', 'F701', 'F702', 'F703', 'F704', 'F706', 'F707', 'F721', 'F722', 'F723', 'F821', 'F822', 'F823', 'F831', 'E901', 'E902', 'E999'],
  },

  activate() {
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe("linter-python.flake8.executable", (value) => {
        this.flake8.executable = value
      }),
      atom.config.observe("linter-python.flake8.skipped", (value) => {
        try {
          if (value) {
            let regex = new RegExp(`^${value}$`)
            this.flake8.test = (code) => { return code.match(regex) }
          } else {
            this.flake8.test = () => { return false }
          }
        } catch (error) {
          console.log(error)
          this.flake8.test = () => { return true }
        }
      }),
      atom.config.observe("linter-python.flake8.complexity", (value) => {
        this.flake8.complexity = value
      }),
    );
  },

  deactivate() {
    this.disposables.dispose()
  },

  provideLinter() {
    return {
      name: 'py',
      scope: 'file',
      lintsOnChange: true,
      grammarScopes: ['source.python'],
      lint: this.lint.bind(this),
    };
  },

  lint(editor) {
    let editorPath = editor.getPath()
    let editorText = editor.getText()
    return new Promise((resolve, reject) => {
      tmp.file({postfix:'.py'}, (fileError, tempPath) => {
        if (fileError) { return reject(fileError) }
        new File(tempPath).write(editorText).then( () =>{
          // ===== linters ===== //
          let promises = []
          promises.push( this.lint_flake8(editorPath, tempPath) )
          // =================== //
          Promise.all(promises).then( (results) => {
            resolve( [].concat(...results) )
          })
        })
      })
    });
  },

  lint_flake8(editorPath, tempPath) {
    let fmt = '--format="%(row)d::%(col)d::%(code)s::%(text)s"'
    let cmx = `--max-complexity ${this.flake8.complexity}`
    let stt = {timeout:15*1e4}
    return new Promise((resolve, reject) => {
        exec(`"${this.flake8.executable}" "${tempPath}" ${fmt} ${cmx}`, stt, (error, stodut, stderr) => {
          if (stderr) { return reject(error) }
          data = []
          for (let line of stodut.split(/\n/)) {
            if (!line) { continue }
            splitted = line.split(/::/)
            if (splitted.length<2) { console.log('?', line) ; continue }
            let [row, col, code, text] = splitted
            row = parseInt(row)-1 ; col1 = parseInt(col)-1 ; col2=1e9
            if ( this.flake8.test(code) ) {
              continue
            } else if ( code=='E999' ) {
              severity = 'error' ; col1 = 0
            } else if (this.flake8.infos.includes(code)) {
              severity = 'info'
            } else if (this.flake8.warns.includes(code)) {
              severity = 'warning'
            } else if (this.flake8.errors.includes(code)) {
              severity = 'error'
            } else {
              severity = 'error' ; code += '*'
            }
            data.push({
               severity: severity, linterName: code, excerpt: text,
               location: { file: editorPath, position: [[row, col1], [row, col2]] },
            })
          }
          resolve(data)
        })
    })
  },


  // lint(editor) {
  //   return new Promise((resolve, reject) => {
  //     let editorPath = editor.getPath()
  //     let flake8 = this.flake8.executable
  //     let format = '%(row)d::%(col)d::%(code)s::%(text)s'
  //     tmp.file({postfix: '.py'}, (err, tempPath) => {
  //       if (err) throw err;
  //       cmx = this.complexity>0 ? `--max-complexity ${this.complexity}` : ''
  //       new File(tempPath).write(editor.getText()).then(()=>{
  //         exec(`"${flake8}" --format="${format}" "${tempPath}" ${cmx}`, {timeout:15*1e4}, (error, stodut, stderr) => {
  //           if (stderr) { return reject(stderr, error)}
  //           data = []
  //           for (let line of stodut.split(/\n/)) {
  //             splitted = line.split(/::/)
  //             if (splitted.length<2) { continue }
  //             let [row, col, code, text] = splitted
  //             row = parseInt(row)-1 ; col1 = parseInt(col)-1 ; col2=1e9
  //             if ( this.flake8.test(code) ) { continue }
  //             if ( code=='E999' ) { col1=0 }
  //             if (this.flake8.infos.includes(code)) {
  //               severity = 'info'
  //             } else if (this.flake8.warns.includes(code)) {
  //               severity = 'warning'
  //             } else if (this.flake8.errors.includes(code)) {
  //               severity = 'error'
  //             } else {
  //               severity = 'error'
  //               code += '*'
  //             }
  //             data.push({
  //                severity: severity,
  //                location: {
  //                  file: editorPath,
  //                  position: [[row, col1], [row, col2]],
  //                },
  //                linterName: code,
  //                excerpt: text,
  //             })
  //           }
  //           resolve(data)
  //         })
  //       })
  //     });
  //   })
  // }


}
