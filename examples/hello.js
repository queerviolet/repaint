const React = require('react')
const Paint = require('../paint')
const {select, createStore} = require('../store')

const Hello = select => select().map (
  ({ message="Hello" }) =>
    <h1 onClick={
      event => select.write({message: 'Goodbye'})
    }> {message} </h1>
)

const HelloPainter = Paint (Hello)
const store = createStore()

require('react-dom').render(<HelloPainter store={store}/>,
                            document.getElementById('app'))

select(store).write({ message: 'hello' })
