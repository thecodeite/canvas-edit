import React, { Component } from 'react';
import cheerio from 'cheerio';
import './App.css';

const defaultScript = `
<html>

</html>
`

const defaultSelector = ''

class App extends Component {
  constructor () {
    super()
    this.state=this.load()
  }

  load () {
    const name = window.location.hash.substr(1) || 'default'
    const fromLocalStorage = window.localStorage.getItem('cheerio-editor-' + name)

    if (fromLocalStorage === null) {
      window.localStorage.setItem('cheerio-editor-' + name, this.state ? this.state.text : defaultScript)
    }

    const selectorFromLocalStorage = window.localStorage.getItem('cheerio-editor-' + name + '-selector')

    const names = [...window.localStorage]
      .map((_, i) => localStorage.key(i))
      .filter(n => n.startsWith('cheerio-editor-') && !n.endsWith('-data'))
      .map(n => n.substr('cheerio-editor-'.length))

    return {
      text: fromLocalStorage || defaultScript,
      selector: selectorFromLocalStorage || defaultSelector,
      name,
      names
    }
  }

  componentDidMount () {
    window.addEventListener('hashchange', e => {
      console.log('hashchange')
      this.setState(this.load())
    })
    this.drawCanvas()
  }

  delete (name) {
    window.localStorage.removeItem('cheerio-editor-' + name)
    this.setState(this.load())
  }

  componentDidUpdate() {
    this.drawCanvas()
  }

  drawCanvas () {
    try {
      const renderFunc = new Function('canvas', 'ctx', 'data', this.state.text)
      const data = this.getData()

      if (Array.isArray(data)) {
        data.forEach((d, i) => {
          const canvas = document.getElementById('cell_'+i);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          renderFunc(canvas, ctx, d)
        })
      } else {
        const canvas = document.getElementById('preview');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        renderFunc(canvas, ctx, data)
      }
    } catch (e) {
      console.log('e:', e)
      // ctx.fillText(e.toString(), 0, 10, canvas.width)
    }
  }

  render() {
    const {text, selector, name, names} = this.state
    const onChange = e => {
      window.localStorage.setItem('cheerio-editor-' + name, e.target.value)
      this.setState(this.load())
    }
    const onChangeSelector = e => {
      window.localStorage.setItem('cheerio-editor-' + name + '-selector', e.target.value)
      this.setState(this.load())
    }

    const toStr= x => {
      try{
        return `${x}`
      } catch (e) {
        return 'No'
      }
    }

    const $ = cheerio.load(text)
    let res = []
    try {

      const [nextPageSelector, nextPageVal] = selector.split('->');

      if (nextPageSelector && nextPageVal) {
        res[0] = $(nextPageSelector)
          .map((_, el) => el.name)
          .get();

        res[1] = $(nextPageSelector)
          .map((_, el) => el.attribs[nextPageVal])
          .get()[0];
      }

    }catch(e) {
      res = toStr(e)
    }
    return (
      <div className="App">
        <div className="Editor" >
          <div>
            {names.map(n => <span key={n}>[<a href={`#${n}`}>{n}</a>{' '}<button onClick={() => this.delete(n)} ><span role="img" aria-label={`delete ${name}`}>❌</span></button>]{' '}</span>)}
          </div>
          <h1>{name}</h1>
          <div className="editors">
            <textarea value={text} onChange={onChange} />
            <textarea value={selector} onChange={onChangeSelector} />
          </div>
        </div>

        <div className="Preview">
          <pre>
            {JSON.stringify(res, null, '  ')}
          </pre>

        </div>

      </div>
    );
  }
}

export default App;
