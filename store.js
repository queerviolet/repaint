const Rx = require('rx')
const redux = require('redux')
const ReactRedux = require('react-redux')
const Immutable = require('immutable')

const select = store => {
  const selection =
          () => Rx.Observable.create (
            observer => {
              const emit = state => observer.onNext(state ? state.toJS() : {})
              
              emit(store.getState()['/proc'])
              return store.subscribe(_ => emit(store.getState()['/proc']))
            }
          )

  selection.write =
    newState => store.dispatch({
      type: 'write',
      write: newState      
    })
  return selection
}

const devTools =
      () =>
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()      

const create =
      root => redux.createStore (
        redux.combineReducers (Object.assign({
          '/proc': (state=Immutable.Map(), action) =>
            action.type === 'write' ? state.merge(action.write)
            : state,
        }, root ? {
          '/root': root
        } : {})),
        devTools()
      )

module.exports = {select, create}
