const React = require('react')
const ReactDOM = require('react-dom')
const Rx = require('rx')

const Store = require('react-redux/lib/utils/storeShape').default
const {select, create} = require('./store')

const EventEmitter = require('eventemitter-rx').default

const reactElement = <h1/>.$$typeof

const Paint = painter => {
  const displayName = `Painter (${painter.name})`

  function log(...args) {
    if (!Paint.debug) {
      log = () => {}
      return
    }
    console.log(displayName, ...args)
  }
  
  class PainterComponent extends React.Component {
    constructor(props, context) {
      super(props, context)
      log('store from props', props.store)
      log('store from context', context.store)
      this.store = props.store || context.store || create()
      log('store=', this.store)
      this.selection = select(this.store)
      this.painter = painter
      this.state = {current: <empty-painter />}

      this.paint = this.paint.bind(this)
    }
    
    componentDidMount() {
      console.log('mounted painter', this)
      this.update()
    }

    render() {
      return this.state.current
    }

    paint(painting) {
      log('[paint]', painting, this)
      log('[paint] painting is function:', typeof painting === 'function')

      if (!painting) return
      
      if (Array.isArray(painting) || painting.$$typeof === reactElement) {
        log('did set leaf state')
        this.setState({ current: painting })
        return Rx.Observable.empty()
      }
      
      if (typeof painting.subscribe === 'function') {        
        return painting.subscribe(this.paint)
      }

      if (typeof painting === 'function') {
        const emitter = new EventEmitter()
        painting.apply(this, emitter)
        return emitter
      }
    }

    getChildContext() {
      return { store: this.store }
    }
    
    update() {
      log('[update]', 'painter=', this.painter)
      this.paint(
        this.painter(
          this.selection,
          this.paint,
          this.props))
    }
  }

  PainterComponent.displayName = displayName
  PainterComponent.contextTypes = {
    store: Store
  }
  PainterComponent.childContextTypes = {
    store: Store
  }
  PainterComponent.propTypes = {
    store: Store
  }
  
  return PainterComponent
}

Paint.debug = true

module.exports = Paint
