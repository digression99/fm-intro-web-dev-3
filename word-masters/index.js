let state = { ...initialState }

function update(action) {
  state = handleActions(state, action)
  rerender()
}

function renderLetterBox(el, props) {
  const { letter, status } = props
  el.innerText = letter.toUpperCase()
  el.classList.toggle('wrong', status === LetterStatus.MISSED)
  el.classList.toggle('exists', status === LetterStatus.EXISTS)
  el.classList.toggle('matched', status === LetterStatus.MATCHED)
}

function renderLetterRows() {
  const letterRows = Array.from(document.querySelectorAll('.letter-row'))
  const validatedWords = selectValidatedWords(state)

  // render previous letter rows. 
  letterRows.slice(0, state.tries - 1)
    .map((ul, i) => {
      const lis = ul.querySelectorAll('.letter-box')
      Array
        .from(lis)
        .map((li, j) =>
          renderLetterBox(li, validatedWords[i][j])
        )
    })
}

function renderCurrentWord() {
  if (state.tries > MAX_TRIES) return
  const currentWord = selectCurrentWord(state)

  const letterRows = Array.from(document.querySelectorAll('.letter-row'))
  const currentWordLis = Array.from(letterRows[state.tries - 1].querySelectorAll('.letter-box'))
  // render current letter row.
  currentWordLis.map((li, i) => {
    li.innerText = (currentWord[i] || '').toUpperCase()
    li.classList.toggle('wrong-blink', state.status === GameStatus.WRONG)
  })
}

function renderLoader() {
  const loader = document.querySelector('.loader')
  loader.classList.toggle('loader-visible', state.status === GameStatus.LOADING)
}

function renderEffects() {
  const { status, answer } = state

  renderLoader()

  if (status === GameStatus.DONE) {
    const message = selectIsMatched(state)
      ? 'You Win!'
      : `You lose! The word is ${answer}`

    alert(message)
  }
}

function rerender() {
  renderLetterRows()
  renderCurrentWord()
  renderEffects()
}

async function handleKeyboardInput(key) {
  if (state.status === GameStatus.LOADING) return

  if (/^[a-zA-z]$/.test(key)) {
    update({
      type: ActionTypes.letter,
      payload: {
        letter: key
      }
    })
  } else if (key === 'Enter') {
    if (state.current.length < MAX_WORD_LENGTH) return

    update({
      type: ActionTypes.loading,
      payload: {
        isLoading: true
      }
    })
    const result = await fetch('https://words.dev-apis.com/validate-word',
      {
        method: 'post',
        body: JSON.stringify({ word: state.current.join('') })
      })
      .then(r => r.json())

    update({
      type: ActionTypes.loading,
      payload: {
        isLoading: false
      }
    })

    const { word, validWord } = result

    if (!validWord) {
      update({ type: ActionTypes.wrong, payload: { isWrong: true } })
      return
    }
    update({ type: ActionTypes.wrong, payload: { isWrong: false } })
    update({ type: ActionTypes.validate })
  } else if (key === 'Backspace') {
    update({ type: ActionTypes.erase })
  }
}

function attachEvents() {
  window.addEventListener('keyup', e => {
    handleKeyboardInput(e.key)
  })
}

function gameStart() {
  update({
    type: ActionTypes.loading,
    payload: {
      isLoading: true
    }
  })
  fetch('https://words.dev-apis.com/word-of-the-day')
    .then(r => r.json())
    .then(response => {
      const { word, puzzleNumber } = response
      update({ type: ActionTypes.loading, payload: { isLoading: false } })
      update({ type: ActionTypes.answer, payload: { answer: word } })
      attachEvents()
    })
}

gameStart()

