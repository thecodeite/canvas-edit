import React, { Component } from 'react';
import './App.css';

const defaultScript = `
ctx.fillStyle = 'rgb(200, 0, 0)';
ctx.fillRect(10, 10, 50, 50);

ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
ctx.fillRect(30, 30, 50, 50);
`

const defaultData = '{}'

class App extends Component {
  constructor () {
    super()
    this.state=this.load()
  }

  load () {
    const name = window.location.hash.substr(1) || 'default'
    const fromLocalStorage = window.localStorage.getItem('canvas-editor-' + name)

    if (fromLocalStorage === null) {
      window.localStorage.setItem('canvas-editor-' + name, this.state ? this.state.text : defaultScript)
    }

    const dataFromLocalStorage = window.localStorage.getItem('canvas-editor-' + name + '-data')

    const names = [...window.localStorage]
      .map((_, i) => localStorage.key(i))
      .filter(n => n.startsWith('canvas-editor-') && !n.endsWith('-data'))
      .map(n => n.substr('canvas-editor-'.length))

    return {
      text: fromLocalStorage || defaultScript,
      data: dataFromLocalStorage || defaultData,
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
    window.localStorage.removeItem('canvas-editor-' + name)
    this.setState(this.load())
  }

  componentDidUpdate() {
    this.drawCanvas()
  }

  getData() {
    try {
      return JSON.parse(this.state.data)
    } catch (e) {
      try {
        return (new Function('return ' + this.state.data.trim()))()
      } catch (e) {
        return {}
      }
    }
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
    const {text, data, name, names} = this.state
    const onChange = e => {
      window.localStorage.setItem('canvas-editor-' + name, e.target.value)
      this.setState(this.load())
    }
    const onChangeData = e => {
      window.localStorage.setItem('canvas-editor-' + name + '-data', e.target.value)
      this.setState(this.load())
    }
    let cells = [];
    let cellsStyle = {}
    try {
      const data = this.getData()
      if (Array.isArray(data)) {
        cells = data
        let dim = 1;
        while(dim*dim < data.length) dim++
        cellsStyle.gridTemplateRows = `repeat(${dim}, 1fr)`
        cellsStyle.gridTemplateColumns = `repeat(${dim}, 1fr)`
      }
    } catch (e){}

    return (
      <div className="App">
        <div className="Editor" >
          <div>
            {names.map(n => <span key={n}>[<a href={`#${n}`}>{n}</a>{' '}<button onClick={() => this.delete(n)} ><span role="img" aria-label={`delete ${name}`}>❌</span></button>]{' '}</span>)}
          </div>
          <h1>{name}</h1>
          <div className="editors">
            <textarea value={text} onChange={onChange} />
            <textarea value={data} onChange={onChangeData} />
          </div>
        </div>

        <div className="Preview">

          {cells.length > 0 ? (
            <div className="cells" style={cellsStyle}>
              {cells.map((_, i) => <canvas key={i} className="cell" id={`cell_${i}`} />)}
            </div>
          ) : <canvas id="preview" /> }
        </div>

      </div>
    );
  }
}

export default App;
