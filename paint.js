const React = require('react')
const ReactDOM = require('react-dom')
const Rx = require('rx')

const Store = require('react-redux/lib/utils/storeShape').default
const {select, create} = require('./store')

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
      log('[paint] ENTER ', displayName, 'paint(', painting, ')')

      if (!painting) return

      const isArray = Array.isArray(painting)
      const isReactElement = painting.$$typeof === reactElement
      log('[paint] painting is array:', isArray)
      log('[paint] painting is element:', isReactElement)
      if (isArray || isReactElement) {
        log('[paint]   ...setting as view state [DONE]')
        this.setState({ current: painting })
        return Rx.Observable.empty()
      }

      const isRx = typeof painting.subscribe === 'function'
      log('[paint] painting is RxObservable:', isRx)      
      if (isRx) {
        log('[paint]    ...subscribing')
        return painting.subscribe(this.paint)
      }

      const isFunc = typeof painting === 'function'
      log('[paint] painting is function:', isFunc)
      if (isFunc) {
        const subject = new Rx.Subject()
        this.paint(painting(subject))
        return subject
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
