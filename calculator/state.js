// you can load multiple js files.
// that will cause delays and need to think about orders,
// but it's the easiest.

// enums
const STATUS = {
  LEFT: 'LEFT',
  OP: 'OP',
  RIGHT: 'RIGHT',
  RESULT: 'RESULT'
}

const OPERATOR = {
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  DIVIDE: 'DIVIDE',
  MULTIPLE: 'MULTIPLE',
}

const ActionTypes = {
  num: 'num',
  op: 'op',
  eq: 'eq',
  clear: 'clear',
  back: 'back'
}

const initialState = {
  status: STATUS.RESULT,
  operator: undefined,
  left: '0',
  right: undefined,
  display: '0'
}

const calculate = (left, op, right) => {
  if (op === OPERATOR.ADD) {
    return left + right
  } else if (op === OPERATOR.SUBTRACT) {
    return left - right
  } else if (op === OPERATOR.DIVIDE) {
    const result = left / right
    return isNaN(result) ? 'Error' : result
  } else if (op === OPERATOR.MULTIPLE) {
    return left * right
  }
}

const getResult = (state) => {
  let { left, operator, right = left } = state
  return String(calculate(Number(left), operator, Number(right)))
}

const reduceNumber = (num) => {
  const n = Number(num)
  if (n < 10) return String(0)
  return String(Math.floor(n / 10))
}

const addNumber = (num, c) => {
  if (num === '0') return c
  return num.concat(c)
}

// wip
const stateMachine = (state, status, stateObject) => {
  const m = mo(state)
  return Object.entries(stateObject).reduce((acc, [k, v]) => {
    if (k === state) {
      return m(v)
    }
    return acc
  }, state)
}

// action handler
const handleActions = (state = initialState, action) => {
  const m = mo(state)

  switch (action.type) {
    case ActionTypes.num:
      const { num } = action.payload

      if (state.status === STATUS.LEFT) {
        const left = addNumber(state.left, num)
        return m({
          left,
          display: left
        })
      } else if (state.status === STATUS.RIGHT) {
        const right = addNumber(state.right, num)
        return m({ right, display: right })
      } else if (state.status === STATUS.RESULT) {
        return m({
          status: STATUS.LEFT,
          left: num,
          display: num
        })
      } else if (state.status === STATUS.OP) {
        return m({
          status: STATUS.RIGHT,
          right: num,
          display: num
        })
      }

    case ActionTypes.op: {
      const { operator } = action.payload
      if (state.status === STATUS.LEFT) {
        return m({ status: STATUS.OP, operator, })
      } else if (state.status === STATUS.RIGHT) {
        const result = getResult(state)
        return m({
          status: STATUS.RESULT,
          left: result,
          display: result
        })
      } else if (state.status === STATUS.RESULT) {
        return m({ status: STATUS.OP, operator })
      } else if (state.status === STATUS.OP) {
        return m({ operator })
      }
    }

    case ActionTypes.eq: {
      const result = getResult(state)

      return m({
        status: STATUS.RESULT,
        left: result,
        display: result,
      })
    }
    case ActionTypes.clear:
      return initialState
    case ActionTypes.back:
      if (state.status === STATUS.LEFT) {
        const n = reduceNumber(state.left)
        return m({ left: n, display: n })
      } else if (state.status === STATUS.RIGHT) {
        const n = reduceNumber(state.right)
        return m({ right: n, display: n })
      }
    default:
      return state
  }
}


