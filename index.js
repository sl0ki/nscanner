const fs = require('fs')
const params = require('commander')
const request = require('request-promise-native')
const colors = require('colors')

// parse cli args
params
  .version('0.1.0')
  .option('-u, --urls <path>', 'Urls list file')
  .option('-p, --paths <path>', 'Paths list file')
  .option('-g, --goods <path>', 'Result file')
  .option('-m, --mark [value]', 'Searchable string')
  .option('-t, --threads <n>', 'Number of threads')
  .option('-f, --start-from <n>', 'Start from some N')
  .parse(process.argv)

const mark = params.mark || ''
const threadsCount = params.threads || 1
let current = params.startFrom || 0

// load files
const urls = fs.readFileSync(params.urls)
        .toString('utf8')
        .split(/\r?\n/)
        .filter(s => s.trim().length !== 0)
const paths = fs.readFileSync(params.paths)
        .toString('utf8')
        .split(/\r?\n/)
        .filter(s => s.trim().length !== 0)

const _thread = async function() {
    while (current < urls.length) {
        const _current = current
        const _url = urls[_current]
        current++
        for (let _path of paths) {
            const url = _url + _path
            console.log(`${_current + 1} | ${url} ...`)
            // make http request
            try {
                const html = await request({
                    uri: url,
                    method: 'GET',
                    timeout: 5 * 1000,
                    simple: false,
                })
                if (html.indexOf(mark) === -1) continue
                // good result
                console.log(`Good -> ${url}`.green)
                fs.appendFile(params.goods, `${url}\n`, () => {})
            } catch (e) {
                console.log(`Error: ${e}`.red)
            }
        }
    }
}

// start threads
console.log(`Starting ${threadsCount} threads ...`)
for (let i = 0; i < threadsCount; i++) {
    _thread()
}
