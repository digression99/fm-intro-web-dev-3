// const popmotion = require('popmotion')
import * as popmotion from 'popmotion'
console.log('popmotion :', popmotion)
const ball = document.querySelector('.ball')

popmotion.animate({
  from: '0px',
  to: '100px',
  repeat: Infinity,
  repeatType: 'mirror',
  type: 'spring',
  onUpdate(update) {
    ball.style.left = update
  }
})