import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bulma/css/bulma.css'
import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.css'
import marked from 'marked'
import * as api from './api.js'
import * as util from './utility.js'

const mock_book = {
  title: 'some title',
  author: 'some author',
  cover_img: 'https://example.com',
  avg_rating: 4.2,
  id: '1232-3321',
}

const mock_row = (i) => {
  return (
    <tr>
      <td>{i}</td>
      <td>{mock_book.title}</td>
      <td>{mock_book.author}</td>
      <td>{mock_book.avg_rating}</td>
    </tr>
  )
}

class Root extends React.Component {
  state = {
      entry_rows: new Map(),
      isSearching: false
  }

  textToDom = text => {
    const dom = (new DOMParser()).parseFromString(marked(text), 'text/html'),
          titles = Array.from(dom.querySelectorAll('p')).map(p => p.textContent.split('\n')).flat()
    return titles
  }

  handleChange = fileInput => async (ev) => {
    console.log('handleChange(...) was called')
    ev.preventDefault()

    const text = await fileInput.current.files[0].text(),
          titles = this.textToDom(text)

    const loop = async () => {
      for (const [i, t] of titles.entries()) {
        this.setState({
          ...this.state,
          isSearching: true
        })

        await util.wait(1000)
        api.search(t, 1)
          .then(works => {
            const new_map = new Map(this.state.entry_rows),
                  book = { ...works[0], query_title: t }
            new_map.set(i, book)
            this.setState({
              ...this.state,
              entry_rows: new_map
            })
            console.log(new_map)
          }, console.log)
      }

      this.setState({
        ...this.state,
        isSearching: false
      })
    }

    loop()
  }

  render() {
    return (
      <Fragment>
        <Header>
            <DatabaseChooser/>
            <DragAndDrop handleChange={this.handleChange}/>
        </Header>
        <Grid>
          <BookTable loading={this.state.isSearching} entry_rows={this.state.entry_rows}/>
        </Grid>
      </Fragment>
    )
  }
}

class Grid extends React.Component {
  onDrop = async (ev) => {
    ev.preventDefault()
    let text = await ev.dataTransfer.items[0].getAsFile().text()
    let titles = this.textToDom(text)
    let response = await api.search(titles[0], 1)
    return response
  }

  onDragOver = (ev) => {
    console.log('File is in drop zone')
  }

  render() {
    return (
      <div className='grid'>
        {this.props.children}
      </div>
    )
  }
}

class Header extends React.Component {
  render() {
    return (
      <navbar className='navbar header has-shadow'>
        {this.props.children}
      </navbar>
    )
  }
}

class DatabaseChooser extends React.Component {
  render() {
    return (
      <div className='databasechooser'>
        <button className='button btn-amazon is-small'>An</button>
        <button className='button btn-goodreads is-warning is-small'>GR</button>
        <button className='button btn-openlib is-small'>OL</button>
      </div>
    )
  }
}

class BookTableRow extends React.Component {
  render() {
    if (this.props.undefined) {
      return (
        <tr className='is-danger'>
          <td>
            <span className='has-tooltip-arrow has-tooltip-right has-tooltip-info'
                  data-tooltip={this.props.query}>
              {this.props.index}
            </span>
          </td>
          <td>data missing</td>
          <td>data missing</td>
          <td>data missing</td>
        </tr>
      )
    } else {
      return (
        <tr>
          <td>
            <span className='has-tooltip-arrow has-tooltip-right has-tooltip-info'
                  data-tooltip={this.props.query}>
              {this.props.index}
            </span>
          </td>
          <td>{this.props.title}</td>
          <td>{this.props.author}</td>
          <td>{this.props.avg_rating}</td>
        </tr>
      )
    }
  }
}

class BookTable extends React.Component {
  render() {
    const entry_rows = Array.from(this.props.entry_rows).map(([i, b]) => {
      if (b.title === undefined) {
        return <BookTableRow index={i + 1} query={b.query_title} undefined/>
      } else {
        return <BookTableRow index={i + 1} query={b.query_title} title={b.title} 
                             author={b.author} avg_rating={b.avg_rating}/>
      }
    })

    const loading_row = this.props.loading
      ?
        <tr>
          <td>{entry_rows.length + 1}</td>
          <td><span className='is-loading'>⠀</span></td>
          <td><span className='is-loading'>⠀</span></td>
          <td><span className='is-loading'>⠀</span></td>
        </tr>
      : undefined

    return (
      <table className='booktable table is-striped is-hoverable is-fullwidth is-narrow'>
        <thead>
          <tr>
            <th>№</th>
            <th>Title</th>
            <th>Author</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {entry_rows}
          {loading_row}
        </tbody>
      </table>
    )
  }
}

class DragAndDrop extends React.Component {
  fileInput = React.createRef()

  render() {
    return (
      <div className='draganddrop'>
        <div className='file is-primary is-small'>
          <label className='file-label'>
            <input className='file-input' 
                   type='file' 
                   name='resume'
                   ref={this.fileInput}
                   onChange={this.props.handleChange(this.fileInput)}/>
            <span className='file-cta'>
              <span className='file-icon'>
                <i className='fas fa-upload'></i>
              </span>
              <span className='file-lable'>Choose a file...</span>
            </span>
          </label>
        </div>
        <div>
          <button className='button is-light key-input is-small'>enter code</button>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Root/>
  </React.StrictMode>,

  document.getElementById('root')
);