import { Component, createSignal, Setter } from 'solid-js';
import styles from './styles/FrontPage.module.css';
import { getGlitchTxt } from './glitchlib';

function rand(bound: number) : number {
  return Math.round(
    Math.random() * bound
  )
}

const boardStrs: string[] = [
  "whatever",
  "lorem ipsum",
  "lmao",
  "FAILURE: catastrophic power drain",
  "testing",
  "NaN",
]

function randStr() : string {
  let idx = rand(boardStrs.length)
  if (idx == boardStrs.length) idx--
  return boardStrs[idx]
}

class boardstate {
  pauseMult: number
  current:   string
  target:    string
  delay:     number
  pause:     number
  next:      string
  up:        boolean
  constructor(delay: number) {
    this.up = true
    this.current = ""
    this.target = randStr()
    this.next = randStr()
    this.pause  = 0
    this.pauseMult = 10
    this.delay = delay
    this.resolveCollision()
  }

  progress() {
    if (this.up) {
      this.current = this.target.slice(0, this.current.length + 1)
    } else {
      this.current = this.current.slice(0, this.current.length - 1)
    }

    if (this.current.length == this.target.length) {
      if (this.up) {
        this.target = ""
      } else {
        this.target = this.next
        this.resolveCollision()
      }
      this.up = this.up ? false : true // inverts
      this.pause = this.pauseMult * this.delay
    }
  }

  isPaused() : boolean {
    return this.pause > 0
  }

  resolveCollision() { // TODO: do better than this
    while (this.target == this.next) {
      this.next = randStr()
    }
  }

  /**
 * @param chances should be a small, <1 float - i.e., 1 / 100
 * @returns whether text output to the substation billboard should glitch
 */
  glitched(chances: number) : boolean {
    let rng = Math.random()
    if (rng <= chances) {
      return true
    }
    return false
  }

  toString(pipe: boolean) : string {
    let s = ""
    let probability = 1 / 4
    if (this.glitched(probability)) {
      s = getGlitchTxt(this.current, probability / 3, probability)
    } else {
      s = this.current
    }
    if (pipe) {
      return s + "|"
    } else {
      return s
    }
  }
}

/**
 * Controls a lot of the "terminal" fx on substation's backboard.
 * @param setTxt 
 */
function permaloop_text(setTxt: Setter<string>) : void {

  const invert = (b: boolean): boolean => { return b ? false : true }

  let delay = 66
  let state = new boardstate(delay)
  let pipe = false // '|' char in station terminal
  setTxt(state.toString(false))
  let tx = 0 // ticks

  setInterval(() => {
    if (tx == 5) {
      pipe = invert(pipe) // pipe flicker effect
      tx = 0
    }

    if (! state.isPaused()) {
      state.progress()
      setTxt(state.toString(pipe))
      
    } else {
      state.pause -= state.delay
      setTxt(state.toString(pipe))
    }
    tx++
  }, delay)
}

/**
 * This only affects the flicker of the station backboard.
 * @param setFlicker the station css to use to swap colors / fx
 */
function permaloop_flicker(setFlicker: Setter<string>) : void {
  let flkr   = 0
  let cycles = 0
  
  let fset = new Set<number>()
  const inFlickerSet = (n: number) => { return fset.has(n) }
  // I kinda want a really jank flicker length
  for (let i = 30; i < 50; i += 2) {
    fset.add(i)
  }

  let delay = 4
  
  setInterval(() => {
    flkr++
    if (inFlickerSet(flkr)) {
      if (cycles % 4 == 0) {
        setFlicker(styles.stationtext2red)
      } else {
        setFlicker(styles.stationtext2dark)
      }
      
    } else if (flkr >= 80) {
      flkr = 0
      cycles++

    } else {
      setFlicker(styles.stationtext2)
    }
  }, delay)
}

const FrontPage: Component = () => {

  let [txt, settxt]             = createSignal("")
  let [signFlicker, setFlicker] = createSignal(styles.stationtext2)

  permaloop_text(settxt)
  permaloop_flicker(setFlicker)

  return (
    <div class={styles.centerer}>
      <div class={styles.pinned_div}>
        <div class={styles.stationdiv}>

          <img class={styles.station}></img>

          {/* <p class={styles.stationtext2}> */}
          <p class={signFlicker()}>
            {txt()}
          </p>

        </div>
      </div>
    </div>
  );
};

export default FrontPage;
