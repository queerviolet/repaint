const React = require('react')
const ReactDOM = require('react-dom')
const Rx = require('rx')

const Store = require('react-redux/lib/utils/storeShape').default
const {select, createStore} = require('./store')

const paint = Symbol()
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
      this.store = props.store || context.store || createStore()
      log('store=', this.store)
      this.selection = select(this.store)
      this.painter = painter
      this.state = {current: <empty-painter />}
      this[paint] = this[paint].bind(this)
    }
    
    componentDidMount() {
      console.log('mounted painter', this)
      this.update()
    }
    
    render() {
      return this.state.current
    }

    [paint](painting) {
      log('[paint]', painting, this)
      if (!painting) return
      log('[paint] isArray=', Array.isArray(painting))
      log('[paint] isReactElement=', painting.$$typeof === reactElement)
      if (Array.isArray(painting) || painting.$$typeof === reactElement) {
        log('did set leaf state')
        this.setState({ current: painting })
        return        
      }
      
      if (typeof painting.subscribe === 'function') {
        painting.subscribe(this[paint])
        return
      }
    }

    getChildContext() {
      return { store: this.store }
    }
    
    update() {
      log('[update]', 'painter=', this.painter)
      this[paint](
        this.painter(
          this.selection,
          this[paint],        
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

Paint.debug = false

module.exports = Paint
