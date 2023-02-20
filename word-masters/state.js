const MAX_WORD_LENGTH = 5
const MAX_TRIES = 6

const LetterStatus = {
  MATCHED: 'MATCHED',
  EXISTS: 'EXISTS',
  MISSED: 'MISSED',
}

const ActionTypes = {
  letter: 'letter', // payload: { letter }
  validate: 'validate',
  erase: 'erase',
  answer: 'answer', // payload: { answer }
  loading: 'loading', // payload: { isLoading }
  wrong: 'wrong'
}

const GameStatus = {
  STARTED: 'STARTED',
  WRONG: 'WRONG',
  LOADING: 'LOADING',
  DONE: 'DONE',
}

const initialState = {
  status: GameStatus.INIT,
  current: [],
  stored: [],
  tries: 1,
  answer: undefined // need answer word.
}

function handleActions(state, action) {
  const { current, stored, answer, tries } = state
  console.log('[handleActions]', state)
  console.log('[handleActions]', action)

  switch (action.type) {
    case ActionTypes.wrong:
      return {
        ...state,
        status: action.payload.isWrong
          ? GameStatus.WRONG
          : GameStatus.STARTED
      }
    case ActionTypes.loading:
      return {
        ...state,
        status: action.payload.isLoading
          ? GameStatus.LOADING
          : GameStatus.STARTED
      }
    case ActionTypes.answer:
      return {
        ...state,
        answer: action.payload.answer
      }
    case ActionTypes.letter:
      if (current.length === MAX_WORD_LENGTH) {
        return {
          ...state,
          current: [...current.slice(0, current.length - 1), action.payload.letter]
        }
      }

      return {
        ...state,
        current: [...current, action.payload.letter]
      }
    case ActionTypes.validate:
      // if wrong, merge current with stored.
      // if correct, change game status.
      if (current.length < MAX_WORD_LENGTH) return

      const guessedWord = current.join('')
      const newStored = [...stored, [...current]]
      const matched = guessedWord === answer
      const nextTries = tries + 1

      return {
        ...state,
        stored: newStored,
        current: [],
        tries: nextTries,
        status:
          matched || nextTries > MAX_TRIES ? GameStatus.DONE
            : GameStatus.STARTED
      }
    case ActionTypes.erase:
      return {
        ...state,
        current: current.slice(0, current.length - 1)
      }
    default:
      return state
  }
}

function getLetterCountMap(str) {
  if (!str) return {}
  return str
    .split('')
    .reduce((acc, cur) =>
      ({ ...acc, [cur]: acc[cur] ? acc[cur] + 1 : 1 }), {})
}

// selectors
function selectValidatedWords(state) {
  const { answer, stored } = state
  const letterCountMap = getLetterCountMap(answer)

  return stored.map(wa =>
    wa.map((l, i) => ({
      letter: l,
      status:
        answer[i] === l
          ? LetterStatus.MATCHED
          : (letterCountMap[l]-- > 0 && answer.includes(l))
            ? LetterStatus.EXISTS
            : LetterStatus.MISSED
    }))
  )
}

function selectIsMatched(state) {
  // return if the last guessed word is the answer.
  const { stored, answer } = state
  return stored[stored.length - 1].join('') === answer
}

function selectCurrentWord(state) {
  return state.current
}
