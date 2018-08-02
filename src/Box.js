import React, { Component } from 'react';
import './App.css';


class App extends Component {
  constructor () {
    super()
    this.state = {
      text: defaultSvg
    }
  }

  render() {
    const {text} = this.state
    const onChange = e => this.setState({text: e.target.value})
    return (
      <div className="App">
        <div className="Editor" >
          <textarea value={text} onChange={onChange} />
        </div>

        <div className="Preview" >
          <canvas id="preview" />
        </div>
      </div>
    );
  }
}

export default App;
