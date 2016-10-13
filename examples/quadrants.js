const React = require('react')
const Paint = require('../paint')
const Rx = require('rx')
const {createStore} = require('../store')

const Extension = require('adopt').Extension

const pipe = Extension (Object) ({
  [Extension.defaultKey]: 'pipe',
  pipe(func, ...args) {
    return func(this, ...args)
  }
})

const backgrounds = (...backgrounds) => backgrounds
  .map(bg => Object.keys(bg))
  .reduce((keys, keySet) => (keySet.forEach(key => keys[key] = true),
                             keys), {})
  [pipe] (Object.keys)
  .map(key => ({
    css: key,
    values: backgrounds
      .map(bg => bg[key] || 'initial')
  }))
  .reduce((all, property) =>
          (all[property.css] = property.values.join(', '), all),
          {})
         
const solid = color => `linear-gradient(${color}, ${color})`

const Quadrants = world =>
      world()
      .map(
        ({x, y}) => {
          console.log('received point:', x, y)
          const backgroundSize = `${x}px ${y}px`
          const backgroundRepeat = 'no-repeat'
          const backgroundBlendMode = 'add'
          return backgrounds(
            {
              backgroundPosition: 'top left',
              backgroundImage: solid('cyan'),
              backgroundRepeat, backgroundSize,
              backgroundBlendMode,
            },
            {
              backgroundPosition: 'top right',
              backgroundImage: solid('magenta'),
              backgroundRepeat, backgroundSize,               
              backgroundBlendMode,
            },
            {
              backgroundPosition: 'bottom right',
              backgroundImage: solid('yellow'),
              backgroundRepeat, backgroundSize,
              backgroundBlendMode,
            },
            {
              backgroundPosition: 'bottom left',
              backgroundImage: solid('black'),
              backgroundRepeat, backgroundSize,
              backgroundBlendMode,
            })
        }
      )
      .map(backgrounds =>
           <div
           onMouseMove={
             ({pageX: x, pageY: y}) =>
               world.write({x, y}) }
           style={
             Object.assign({}, {
               position: 'fixed',
               width: '100%',
               height: '100%',
             }, backgrounds)
           } />)

//const PaintTracker = Paint (Tracker),
const    PaintQuadrants = Paint (Quadrants)

const app = (
    <PaintQuadrants />
)

require('react-dom').render(app, document.getElementById('app'))
