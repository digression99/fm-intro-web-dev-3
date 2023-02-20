let state = initialState

function buttonAdapter(name, v) {
  if (name === 'num') {
    state = handleActions(state, {
      type: ActionTypes.num,
      payload: { num: v }
    })
  } else if (name === 'clear') {
    state = handleActions(state, {
      type: ActionTypes.clear,
    })
  } else if (name === 'eq') {
    state = handleActions(state, {
      type: ActionTypes.eq
    })
  } else if (name === 'op') {
    state = handleActions(state, {
      type: ActionTypes.op,
      payload: {
        operator: v
      }
    })
  } else if (name === 'back') {
    state = handleActions(state, {
      type: ActionTypes.back,
    })
  }
}

function setScreen(display) {
  const screen = document.querySelector('.screen')
  screen.innerText = display
}

function attachEvents() {
  const container = document.querySelector('.container')
  container.addEventListener('click', e => {
    const { tagName, name, dataset } = e.target
    if (tagName !== 'BUTTON') return

    buttonAdapter(name, dataset.value)
    setScreen(state.display)
  })
}

attachEvents()

