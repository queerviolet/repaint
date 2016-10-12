const Rx = require('rx')
const redux = require('redux')
const ReactRedux = require('react-redux')
const Immutable = require('immutable')

const select = store => {
  const selection =
          () => Rx.Observable.create (
            observer => {
              const emit = state => observer.onNext(state ? state.toJS() : {})
              
              emit(store.getState())
              return store.subscribe(_ => emit(store.getState()))
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

const createStore =
      () => redux.createStore (
        (state=Immutable.Map(), action) =>
          action.type === 'write' ? state.merge(action.write)
          : undefined,
        devTools()
      )

module.exports = {select, createStore}
