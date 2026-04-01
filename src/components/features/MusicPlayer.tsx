'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import {
  getCardType,
  MUSIC_STYLES,
  generateMiniMaxMusic,
  isMiniMaxConfigured,
  type CardType,
} from '@/lib/music-minimax'

// Legacy type alias for internal use
type LegacyCardType = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'

// Music configurations for each card type
const LEGACY_MUSIC_STYLES: Record<LegacyCardType, { notes: number[], tempo: number; description: string; color: string }> = {
  major: {
    notes: [130.81, 196.00, 261.63, 392.00, 523.25, 784.00],
    tempo: 10,
    description: 'Mysterious & Ethereal',
    color: '#C9A227',
  },
  wands: {
    notes: [261.63, 329.63, 392.00, 523.25, 659.25],
    tempo: 8,
    description: 'Passionate & Energetic',
    color: '#E07B39',
  },
  cups: {
    notes: [220.00, 261.63, 329.63, 440.00, 523.25],
    tempo: 10,
    description: 'Gentle & Emotional',
    color: '#4A90D9',
  },
  swords: {
    notes: [146.83, 174.61, 220.00, 293.66, 349.23],
    tempo: 9,
    description: 'Tense & Mysterious',
    color: '#8E8EAF',
  },
  pentacles: {
    notes: [196.00, 246.94, 293.66, 392.00, 493.88],
    tempo: 9,
    description: 'Steady & Prosperous',
    color: '#27AE60',
  },
}

// ============================================================
// Advanced Web Audio Synthesizer - Pure Web Audio API
// ============================================================

function createImpulseResponse(
  ctx: AudioContext,
  duration: number,
  decay: number,
  reverse: boolean = false
): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
    }
  }
  return impulse
}

function createEtherealImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const duration = 4.0
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const t = i / length
      const decay1 = Math.pow(1 - t, 2)
      const decay2 = Math.pow(1 - t, 0.5)
      const noise = Math.random() * 2 - 1
      const earlyRef = i < sampleRate * 0.1 ? Math.sin(i / sampleRate * 50) * 0.3 : 0
      channelData[i] = (noise * decay1 * 0.7 + earlyRef + noise * decay2 * 0.3) * 0.5
    }
  }
  return impulse
}

function createNoiseBuffer(ctx: AudioContext, duration: number, type: 'white' | 'pink' = 'white'): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  } else {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return buffer
}

function applyADSR(
  param: AudioParam,
  ctx: AudioContext,
  startTime: number,
  duration: number,
  attack: number = 0.05,
  decay: number = 0.1,
  sustain: number = 0.7,
  release: number = 0.3
): void {
  const attackEnd = startTime + attack
  const decayEnd = attackEnd + decay
  const releaseStart = startTime + duration - release
  const releaseEnd = startTime + duration

  param.setValueAtTime(0, startTime)
  param.linearRampToValueAtTime(1, attackEnd)
  param.linearRampToValueAtTime(sustain, decayEnd)
  param.setValueAtTime(sustain, releaseStart)
  param.linearRampToValueAtTime(0, releaseEnd)
}

function createLFO(
  ctx: AudioContext,
  frequency: number,
  depth: number,
  target: AudioParam,
  startTime: number,
  duration: number
): OscillatorNode {
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()

  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(frequency, startTime)
  lfoGain.gain.setValueAtTime(depth, startTime)

  lfo.connect(lfoGain)
  lfoGain.connect(target)

  lfo.start(startTime)
  lfo.stop(startTime + duration)

  return lfo
}

function createMasterChannel(ctx: AudioContext, volume: number): {
  masterGain: GainNode
  compressor: DynamicsCompressorNode
  panner: StereoPannerNode
} {
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.setValueAtTime(-24, ctx.currentTime)
  compressor.knee.setValueAtTime(30, ctx.currentTime)
  compressor.ratio.setValueAtTime(12, ctx.currentTime)
  compressor.attack.setValueAtTime(0.003, ctx.currentTime)
  compressor.release.setValueAtTime(0.25, ctx.currentTime)

  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(0, ctx.currentTime)

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(volume, ctx.currentTime)

  compressor.connect(panner)
  panner.connect(masterGain)
  masterGain.connect(ctx.destination)

  return { masterGain, compressor, panner }
}

// ============================================================
// Card-Specific Music Generators
// ============================================================

// Major Arcana: Mysterious & Ethereal
function createMajorArcanaMusic(ctx: AudioContext, volume: number, duration: number): () => void {
  const { masterGain, compressor, panner } = createMasterChannel(ctx, volume)

  const reverb = ctx.createConvolver()
  reverb.buffer = createEtherealImpulse(ctx)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.6, ctx.currentTime)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.4, ctx.currentTime)

  const chordFreqs = [
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [261.63, 329.63, 392.00],
    [196, 246.94, 293.66],
  ]

  const now = ctx.currentTime
  const chordDuration = duration / chordFreqs.length

  chordFreqs.forEach((chord, chordIdx) => {
    const chordStart = now + chordIdx * chordDuration

    chord.forEach((freq) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, chordStart)
      createLFO(ctx, 4, freq * 0.005, osc.frequency, chordStart, chordDuration)
      applyADSR(oscGain.gain, ctx, chordStart, chordDuration, 1, 1, 0.8, 2)
      osc.connect(oscGain)
      oscGain.connect(dryGain)
      osc.start(chordStart)
      osc.stop(chordStart + chordDuration + 2)

      const tri = ctx.createOscillator()
      const triGain = ctx.createGain()
      tri.type = 'triangle'
      tri.frequency.setValueAtTime(freq * 2, chordStart)
      createLFO(ctx, 3.5, freq * 0.003, tri.frequency, chordStart, chordDuration)
      applyADSR(triGain.gain, ctx, chordStart + 0.1, chordDuration, 0.8, 0.8, 0.5, 2)
      tri.connect(triGain)
      triGain.connect(reverbGain)
      reverbGain.connect(reverb)
      tri.start(chordStart)
      tri.stop(chordStart + chordDuration + 2)
    })
  })

  const bellFreqs = [784, 880, 1047, 1175]
  bellFreqs.forEach((freq, i) => {
    const startTime = now + i * (duration / bellFreqs.length) * 0.8
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    oscGain.gain.setValueAtTime(0, startTime)
    oscGain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 2)

    filter.type = 'highpass'
    filter.frequency.setValueAtTime(500, startTime)

    osc.connect(filter)
    filter.connect(oscGain)
    oscGain.connect(reverbGain)
    reverbGain.connect(reverb)
    osc.start(startTime)
    osc.stop(startTime + 2)
  })

  const noiseBuffer = createNoiseBuffer(ctx, duration + 2, 'pink')
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuffer

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(800, now)
  noiseFilter.Q.setValueAtTime(0.5, now)

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0, now)
  noiseGain.gain.linearRampToValueAtTime(0.03, now + 2)
  noiseGain.gain.setValueAtTime(0.03, now + duration - 3)
  noiseGain.gain.linearRampToValueAtTime(0, now + duration)

  noiseSource.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(dryGain)

  noiseSource.start(now)
  noiseSource.stop(now + duration)

  reverb.connect(dryGain)

  masterGain.gain.setValueAtTime(volume, now)
  masterGain.gain.linearRampToValueAtTime(0, now + duration)

  return () => {
    masterGain.disconnect()
    compressor.disconnect()
    panner.disconnect()
  }
}

// Wands: Passionate & Energetic
function createWandsMusic(ctx: AudioContext, volume: number, duration: number): () => void {
  const { masterGain, compressor, panner } = createMasterChannel(ctx, volume)

  const reverb = ctx.createConvolver()
  reverb.buffer = createImpulseResponse(ctx, 1.5, 3)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.3, ctx.currentTime)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.7, ctx.currentTime)

  const distortion = ctx.createWaveShaper()
  const curve = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1
    curve[i] = Math.tanh(x * 2)
  }
  distortion.curve = curve

  const now = ctx.currentTime
  const chordFreqs = [
    [392, 493.88, 587.33],
    [261.63, 329.63, 392.00],
    [293.66, 369.99, 440.00],
    [392, 493.88, 587.33],
  ]

  const beatDuration = 0.5
  const beatsPerChord = Math.floor(duration / beatDuration / chordFreqs.length)

  chordFreqs.forEach((chord, chordIdx) => {
    const chordStart = now + chordIdx * beatsPerChord * beatDuration

    chord.forEach((freq) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, chordStart)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2000, chordStart)
      filter.Q.setValueAtTime(1, chordStart)

      const noteDuration = beatsPerChord * beatDuration
      oscGain.gain.setValueAtTime(0, chordStart)
      oscGain.gain.linearRampToValueAtTime(0.12, chordStart + 0.05)
      oscGain.gain.setValueAtTime(0.12, chordStart + noteDuration * 0.3)
      oscGain.gain.linearRampToValueAtTime(0.08, chordStart + noteDuration * 0.6)
      oscGain.gain.setValueAtTime(0.08, chordStart + noteDuration - 0.1)
      oscGain.gain.linearRampToValueAtTime(0, chordStart + noteDuration)

      osc.connect(filter)
      filter.connect(distortion)
      distortion.connect(oscGain)
      oscGain.connect(dryGain)

      osc.start(chordStart)
      osc.stop(chordStart + noteDuration + 0.1)
    })
  })

  for (let beat = 0; beat < duration / beatDuration; beat++) {
    const beatTime = now + beat * beatDuration

    if (beat % 4 === 0) {
      const kick = ctx.createOscillator()
      const kickGain = ctx.createGain()

      kick.type = 'sine'
      kick.frequency.setValueAtTime(150, beatTime)
      kick.frequency.exponentialRampToValueAtTime(40, beatTime + 0.1)

      kickGain.gain.setValueAtTime(0.3, beatTime)
      kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15)

      kick.connect(kickGain)
      kickGain.connect(dryGain)

      kick.start(beatTime)
      kick.stop(beatTime + 0.2)
    }

    if (beat % 2 === 1) {
      const hatBuffer = createNoiseBuffer(ctx, 0.1, 'white')
      const hat = ctx.createBufferSource()
      hat.buffer = hatBuffer

      const hatFilter = ctx.createBiquadFilter()
      hatFilter.type = 'highpass'
      hatFilter.frequency.setValueAtTime(8000, beatTime)

      const hatGain = ctx.createGain()
      hatGain.gain.setValueAtTime(0.08, beatTime)
      hatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.05)

      hat.connect(hatFilter)
      hatFilter.connect(hatGain)
      hatGain.connect(dryGain)

      hat.start(beatTime)
      hat.stop(beatTime + 0.1)
    }

    if (beat % 4 === 2) {
      const snareBuffer = createNoiseBuffer(ctx, 0.15, 'white')
      const snare = ctx.createBufferSource()
      snare.buffer = snareBuffer

      const snareFilter = ctx.createBiquadFilter()
      snareFilter.type = 'bandpass'
      snareFilter.frequency.setValueAtTime(3000, beatTime)
      snareFilter.Q.setValueAtTime(1, beatTime)

      const snareGain = ctx.createGain()
      snareGain.gain.setValueAtTime(0.15, beatTime)
      snareGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.12)

      snare.connect(snareFilter)
      snareFilter.connect(snareGain)
      snareGain.connect(dryGain)

      snare.start(beatTime)
      snare.stop(beatTime + 0.15)
    }
  }

  masterGain.gain.setValueAtTime(volume, now)
  masterGain.gain.linearRampToValueAtTime(0, now + duration)

  return () => {
    masterGain.disconnect()
    compressor.disconnect()
    panner.disconnect()
  }
}

// Cups: Gentle & Emotional
function createCupsMusic(ctx: AudioContext, volume: number, duration: number): () => void {
  const { masterGain, compressor, panner } = createMasterChannel(ctx, volume)

  const reverb = ctx.createConvolver()
  reverb.buffer = createImpulseResponse(ctx, 2.5, 2)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.5, ctx.currentTime)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.5, ctx.currentTime)

  const now = ctx.currentTime
  const chordFreqs = [
    [220, 261.63, 329.63, 392],
    [174.61, 220, 261.63, 329.63],
    [261.63, 329.63, 392, 493.88],
    [196, 246.94, 293.66, 369.99],
  ]

  const arpeggioPatterns = [
    [0, 2, 4, 6, 4, 2],
    [0, 1, 3, 4, 3, 1],
    [0, 2, 4, 5, 4, 2],
    [0, 3, 4, 6, 4, 3],
  ]

  const chordDuration = duration / chordFreqs.length
  const noteTime = chordDuration / 6

  chordFreqs.forEach((chord, chordIdx) => {
    const chordStart = now + chordIdx * chordDuration
    const pattern = arpeggioPatterns[chordIdx % arpeggioPatterns.length]

    pattern.forEach((noteIdx, i) => {
      if (noteIdx < chord.length) {
        const freq = chord[noteIdx]
        const noteStart = chordStart + i * noteTime

        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const oscGain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(freq, noteStart)

        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(freq * 2, noteStart)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1200, noteStart)
        filter.Q.setValueAtTime(0.5, noteStart)

        oscGain.gain.setValueAtTime(0, noteStart)
        oscGain.gain.linearRampToValueAtTime(0.15, noteStart + 0.1)
        oscGain.gain.exponentialRampToValueAtTime(0.05, noteStart + noteTime * 3)
        oscGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteTime * 4)

        const notePanner = ctx.createStereoPanner()
        notePanner.pan.setValueAtTime((Math.random() - 0.5) * 0.6, noteStart)

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(oscGain)
        oscGain.connect(notePanner)
        notePanner.connect(dryGain)
        notePanner.connect(reverbGain)

        osc1.start(noteStart)
        osc1.stop(noteStart + noteTime * 5)
        osc2.start(noteStart)
        osc2.stop(noteStart + noteTime * 5)
      }
    })
  })

  const waterBuffer = createNoiseBuffer(ctx, duration + 2, 'pink')
  const waterSource = ctx.createBufferSource()
  waterSource.buffer = waterBuffer

  const waterFilter = ctx.createBiquadFilter()
  waterFilter.type = 'bandpass'
  waterFilter.frequency.setValueAtTime(400, now)
  waterFilter.Q.setValueAtTime(0.3, now)

  const waterLFO = ctx.createOscillator()
  const waterLFOGain = ctx.createGain()
  waterLFO.type = 'sine'
  waterLFO.frequency.setValueAtTime(0.2, now)
  waterLFOGain.gain.setValueAtTime(100, now)
  waterLFO.connect(waterLFOGain)
  waterLFOGain.connect(waterFilter.frequency)
  waterLFO.start(now)
  waterLFO.stop(now + duration)

  const waterGain = ctx.createGain()
  waterGain.gain.setValueAtTime(0, now)
  waterGain.gain.linearRampToValueAtTime(0.025, now + 2)
  waterGain.gain.setValueAtTime(0.025, now + duration - 2)
  waterGain.gain.linearRampToValueAtTime(0, now + duration)

  waterSource.connect(waterFilter)
  waterFilter.connect(waterGain)
  waterGain.connect(dryGain)

  waterSource.start(now)
  waterSource.stop(now + duration)

  reverbGain.connect(reverb)

  masterGain.gain.setValueAtTime(volume, now)
  masterGain.gain.linearRampToValueAtTime(0, now + duration)

  return () => {
    masterGain.disconnect()
    compressor.disconnect()
    panner.disconnect()
  }
}

// Swords: Tense & Mysterious
function createSwordsMusic(ctx: AudioContext, volume: number, duration: number): () => void {
  const { masterGain, compressor, panner } = createMasterChannel(ctx, volume)

  const delay = ctx.createDelay(1.0)
  delay.delayTime.setValueAtTime(0.3, ctx.currentTime)

  const delayFeedback = ctx.createGain()
  delayFeedback.gain.setValueAtTime(0.4, ctx.currentTime)

  const delayFilter = ctx.createBiquadFilter()
  delayFilter.type = 'lowpass'
  delayFilter.frequency.setValueAtTime(2000, ctx.currentTime)

  delay.connect(delayFilter)
  delayFilter.connect(delayFeedback)
  delayFeedback.connect(delay)

  const reverb = ctx.createConvolver()
  reverb.buffer = createImpulseResponse(ctx, 2, 2.5)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.4, ctx.currentTime)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.6, ctx.currentTime)

  const now = ctx.currentTime
  const chordFreqs = [
    [146.83, 174.61, 220, 293.66],
    [138.59, 174.61, 207.65, 277.18],
    [130.81, 155.56, 196, 261.63],
    [116.54, 146.83, 174.61, 233.08],
  ]

  const chordDuration = duration / chordFreqs.length

  chordFreqs.forEach((chord, chordIdx) => {
    const chordStart = now + chordIdx * chordDuration

    chord.forEach((freq, noteIdx) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'square'
      osc.frequency.setValueAtTime(freq * (1 + (noteIdx - 1.5) * 0.007), chordStart)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1500, chordStart)
      filter.Q.setValueAtTime(2, chordStart)

      oscGain.gain.setValueAtTime(0, chordStart)
      oscGain.gain.linearRampToValueAtTime(0.06, chordStart + 1)
      oscGain.gain.setValueAtTime(0.06, chordStart + chordDuration - 1)
      oscGain.gain.linearRampToValueAtTime(0, chordStart + chordDuration)

      const notePanner = ctx.createStereoPanner()
      const panLFO = ctx.createOscillator()
      const panLFOGain = ctx.createGain()
      panLFO.type = 'sine'
      panLFO.frequency.setValueAtTime(0.5, chordStart)
      panLFOGain.gain.setValueAtTime(0.3, chordStart)
      panLFO.connect(panLFOGain)
      panLFOGain.connect(notePanner.pan)
      panLFO.start(chordStart)
      panLFO.stop(chordStart + chordDuration)

      osc.connect(filter)
      filter.connect(oscGain)
      oscGain.connect(notePanner)
      notePanner.connect(dryGain)
      notePanner.connect(delay)
      notePanner.connect(reverbGain)

      osc.start(chordStart)
      osc.stop(chordStart + chordDuration + 0.5)
    })
  })

  const windBuffer = createNoiseBuffer(ctx, duration + 2, 'white')
  const windSource = ctx.createBufferSource()
  windSource.buffer = windBuffer

  const windFilter = ctx.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.setValueAtTime(600, now)
  windFilter.Q.setValueAtTime(0.8, now)

  const windLFO = ctx.createOscillator()
  const windLFOGain = ctx.createGain()
  windLFO.type = 'sine'
  windLFO.frequency.setValueAtTime(0.15, now)
  windLFOGain.gain.setValueAtTime(300, now)
  windLFO.connect(windLFOGain)
  windLFOGain.connect(windFilter.frequency)
  windLFO.start(now)
  windLFO.stop(now + duration)

  const windGain = ctx.createGain()
  windGain.gain.setValueAtTime(0, now)
  windGain.gain.linearRampToValueAtTime(0.04, now + 1.5)
  windGain.gain.setValueAtTime(0.04, now + duration - 2)
  windGain.gain.linearRampToValueAtTime(0, now + duration)

  windSource.connect(windFilter)
  windFilter.connect(windGain)
  windGain.connect(dryGain)

  windSource.start(now)
  windSource.stop(now + duration)

  delay.connect(reverb)
  reverb.connect(dryGain)

  masterGain.gain.setValueAtTime(volume, now)
  masterGain.gain.linearRampToValueAtTime(0, now + duration)

  return () => {
    masterGain.disconnect()
    compressor.disconnect()
    panner.disconnect()
  }
}

// Pentacles: Steady & Prosperous
function createPentaclesMusic(ctx: AudioContext, volume: number, duration: number): () => void {
  const { masterGain, compressor, panner } = createMasterChannel(ctx, volume)

  const reverb = ctx.createConvolver()
  reverb.buffer = createImpulseResponse(ctx, 2, 2.5)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.35, ctx.currentTime)

  const dryGain = ctx.createGain()
  dryGain.gain.setValueAtTime(0.65, ctx.currentTime)

  const now = ctx.currentTime
  const chordFreqs = [
    [146.83, 220, 293.66, 369.99],
    [174.61, 261.63, 329.63, 440.00],
    [261.63, 329.63, 392, 493.88],
    [196, 246.94, 293.66, 369.99],
  ]

  const chordDuration = duration / chordFreqs.length
  const beatDuration = 0.75

  const arpeggioPattern = [0, 1, 2, 3, 2, 1, 0, 1]

  chordFreqs.forEach((chord, chordIdx) => {
    const chordStart = now + chordIdx * chordDuration

    arpeggioPattern.forEach((noteIdx, i) => {
      if (noteIdx < chord.length) {
        const freq = chord[noteIdx]
        const noteStart = chordStart + i * (beatDuration / 2)

        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const oscGain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(freq, noteStart)

        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(freq / 2, noteStart)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(3000, noteStart)
        filter.Q.setValueAtTime(0.5, noteStart)

        const noteDuration = beatDuration * 1.5
        oscGain.gain.setValueAtTime(0, noteStart)
        oscGain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02)
        oscGain.gain.exponentialRampToValueAtTime(0.06, noteStart + noteDuration * 0.5)
        oscGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration)

        const notePanner = ctx.createStereoPanner()
        notePanner.pan.setValueAtTime(Math.sin(i * 0.5 + chordIdx) * 0.4, noteStart)

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(oscGain)
        oscGain.connect(notePanner)
        notePanner.connect(dryGain)
        notePanner.connect(reverbGain)

        osc1.start(noteStart)
        osc1.stop(noteStart + noteDuration + 0.1)
        osc2.start(noteStart)
        osc2.stop(noteStart + noteDuration + 0.1)
      }
    })
  })

  const bassFreqs = [73.42, 87.31, 65.41, 98]
  bassFreqs.forEach((freq, i) => {
    const startTime = now + i * chordDuration

    const bass = ctx.createOscillator()
    const bassGain = ctx.createGain()
    const bassFilter = ctx.createBiquadFilter()

    bass.type = 'sine'
    bass.frequency.setValueAtTime(freq, startTime)

    bassFilter.type = 'lowpass'
    bassFilter.frequency.setValueAtTime(200, startTime)
    bassFilter.Q.setValueAtTime(1, startTime)

    bassGain.gain.setValueAtTime(0, startTime)
    bassGain.gain.linearRampToValueAtTime(0.12, startTime + 0.05)
    bassGain.gain.setValueAtTime(0.12, startTime + chordDuration * 0.8)
    bassGain.gain.linearRampToValueAtTime(0, startTime + chordDuration)

    bass.connect(bassFilter)
    bassFilter.connect(bassGain)
    bassGain.connect(dryGain)

    bass.start(startTime)
    bass.stop(startTime + chordDuration + 0.1)
  })

  reverbGain.connect(reverb)

  masterGain.gain.setValueAtTime(volume, now)
  masterGain.gain.linearRampToValueAtTime(0, now + duration)

  return () => {
    masterGain.disconnect()
    compressor.disconnect()
    panner.disconnect()
  }
}

// ============================================================
// Unified Music Generator Dispatcher
// ============================================================

function createAdvancedCardMusic(
  audioContext: AudioContext,
  cardType: CardType,
  volume: number = 0.15
): () => void {
  const durationMap: Record<CardType, number> = {
    major: 12,
    wands: 10,
    cups: 12,
    swords: 11,
    pentacles: 11,
  }

  const duration = durationMap[cardType] || 10

  switch (cardType) {
    case 'major':
      return createMajorArcanaMusic(audioContext, volume, duration)
    case 'wands':
      return createWandsMusic(audioContext, volume, duration)
    case 'cups':
      return createCupsMusic(audioContext, volume, duration)
    case 'swords':
      return createSwordsMusic(audioContext, volume, duration)
    case 'pentacles':
      return createPentaclesMusic(audioContext, volume, duration)
    default:
      return createMajorArcanaMusic(audioContext, volume, duration)
  }
}

const MUSIC_STORAGE_KEY = 'wishing-moon-music-enabled'
const VOLUME_STORAGE_KEY = 'wishing-moon-music-volume'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [currentMusicType, setCurrentMusicType] = useState<CardType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) || '0.5')
    }
    return 0.5
  })
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const isPlayingRef = useRef(false)
  const currentMusicTypeRef = useRef<CardType | null>(null)
  const musicTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const useMiniMaxRef = useRef(false)

  // ---- All callbacks defined BEFORE useEffects ----

  const stopMusic = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentMusicType(null)
    setGenerationError(null)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    if (musicTimeoutRef.current) {
      clearTimeout(musicTimeoutRef.current)
      musicTimeoutRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const playWebAudioFallback = useCallback((cardType: CardType) => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    cleanupRef.current = createAdvancedCardMusic(audioContextRef.current, cardType, volume * 0.3)

    const style = LEGACY_MUSIC_STYLES[cardType as LegacyCardType]
    if (musicTimeoutRef.current) {
      clearTimeout(musicTimeoutRef.current)
    }
    musicTimeoutRef.current = setTimeout(() => {
      stopMusic()
    }, (style.tempo + 2) * 1000)
  }, [volume, stopMusic])

  const playMiniMaxMusic = useCallback((url: string, cardType: CardType) => {
    try {
      const audio = new Audio(url)
      audioRef.current = audio

      audio.volume = volume * 0.6
      audio.play().catch(e => {
        console.warn('Audio playback failed:', e)
        if (isPlayingRef.current && currentMusicTypeRef.current === cardType) {
          playWebAudioFallback(cardType)
        }
      })

      audio.onended = () => {
        isPlayingRef.current = false
        setIsPlaying(false)
        setCurrentMusicType(null)
        audioRef.current = null
      }

      audio.onerror = () => {
        console.warn('MiniMax audio load failed, trying Web Audio fallback')
        if (isPlayingRef.current && currentMusicTypeRef.current === cardType) {
          audio.pause()
          audio.src = ''
          playWebAudioFallback(cardType)
        }
      }

      if (musicTimeoutRef.current) {
        clearTimeout(musicTimeoutRef.current)
      }
      musicTimeoutRef.current = setTimeout(() => {
        stopMusic()
      }, 120000)
    } catch (e) {
      console.warn('MiniMax audio creation failed:', e)
      if (isPlayingRef.current) {
        playWebAudioFallback(cardType)
      }
    }
  }, [volume, stopMusic, playWebAudioFallback])

  const playCardMusic = useCallback(async (cardId: number) => {
    const cardType = getCardType(cardId)
    currentMusicTypeRef.current = cardType
    setCurrentMusicType(cardType)
    setGenerationError(null)

    stopMusic()

    isPlayingRef.current = true
    setIsPlaying(true)

    const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY
    if (useMiniMaxRef.current && apiKey) {
      setIsGenerating(true)
      try {
        const result = await generateMiniMaxMusic(cardType, apiKey)
        setIsGenerating(false)

        if (result.error) {
          setGenerationError(result.error)
          if (isPlayingRef.current) {
            playWebAudioFallback(cardType)
          }
        } else if (result.url) {
          playMiniMaxMusic(result.url, cardType)
        }
      } catch (e) {
        setIsGenerating(false)
        console.warn('MiniMax error, falling back to Web Audio:', e)
        if (isPlayingRef.current) {
          playWebAudioFallback(cardType)
        }
      }
    } else {
      playWebAudioFallback(cardType)
    }
  }, [stopMusic, playMiniMaxMusic, playWebAudioFallback])

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMusic()
      localStorage.setItem(MUSIC_STORAGE_KEY, 'false')
    } else {
      localStorage.setItem(MUSIC_STORAGE_KEY, 'true')
      if (!currentMusicTypeRef.current) {
        playCardMusic(0)
      }
    }
  }, [isPlaying, stopMusic, playCardMusic])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    localStorage.setItem(VOLUME_STORAGE_KEY, String(newVolume))

    if (audioRef.current) {
      audioRef.current.volume = newVolume * 0.6
    }
  }, [])

  // ---- All useEffects defined AFTER callbacks ----

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MUSIC_STORAGE_KEY)
      if (saved === 'true') {
        setIsVisible(true)
      }
      useMiniMaxRef.current = isMiniMaxConfigured()
    }
  }, [])

  useEffect(() => {
    const handleCardFlip = (event: CustomEvent<{ cardId: number }>) => {
      playCardMusic(event.detail.cardId)
    }

    const handleCardMusic = (event: CustomEvent<{ cardId: number }>) => {
      playCardMusic(event.detail.cardId)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('tarotCardFlipped', handleCardFlip as EventListener)
      window.addEventListener('playCardMusic', handleCardMusic as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tarotCardFlipped', handleCardFlip as EventListener)
        window.removeEventListener('playCardMusic', handleCardMusic as EventListener)
      }
    }
  }, [playCardMusic])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [stopMusic])

  const getMusicTypeDisplay = () => {
    if (isGenerating) return 'Generating music...'
    if (generationError) return 'Using fallback audio'
    if (!currentMusicType) return 'Tap a card to play music'
    return MUSIC_STYLES[currentMusicType].description
  }

  const getMusicTypeColor = () => {
    if (!currentMusicType) return '#FFFFFF'
    return MUSIC_STYLES[currentMusicType].color
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setShowControls(!showControls)}
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-yellow-400'
            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
        }`}
        title={isPlaying ? 'Music playing - Click for controls' : 'Turn on ambient music'}
        style={isPlaying && currentMusicType ? {
          borderColor: MUSIC_STYLES[currentMusicType].color + '50',
          boxShadow: `0 0 20px ${MUSIC_STYLES[currentMusicType].color}33`,
        } : undefined}
      >
        <Music size={20} className={isPlaying ? 'animate-pulse' : ''} style={isPlaying ? { color: getMusicTypeColor() } : undefined} />
      </motion.button>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-32 right-4 z-50 bg-black/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 w-60"
            style={isPlaying && currentMusicType ? {
              borderColor: MUSIC_STYLES[currentMusicType].color + '40',
              boxShadow: `0 0 30px ${MUSIC_STYLES[currentMusicType].color}22`,
            } : undefined}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'bg-white/30'}`}
                style={isPlaying && currentMusicType ? { backgroundColor: MUSIC_STYLES[currentMusicType].color } : undefined}
              />
              <span className="text-white text-sm font-medium">Tarot Music</span>
              {isGenerating && <Loader2 size={14} className="animate-spin text-yellow-400 ml-auto" />}
            </div>

            {isPlaying && currentMusicType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 px-3 py-2 rounded-lg text-center text-xs"
                style={{
                  backgroundColor: `${MUSIC_STYLES[currentMusicType].color}15`,
                  border: `1px solid ${MUSIC_STYLES[currentMusicType].color}33`,
                  color: MUSIC_STYLES[currentMusicType].color,
                }}
              >
                {MUSIC_STYLES[currentMusicType].description}
                {isGenerating && ' (AI generating...)'}
                {generationError && ' (fallback mode)'}
              </motion.div>
            )}

            {!isPlaying && (
              <div className="mb-3 px-3 py-2 rounded-lg text-center text-xs text-white/40">
                {getMusicTypeDisplay()}
              </div>
            )}

            <button
              onClick={toggleMusic}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all mb-3"
              disabled={isGenerating}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="text-sm">{isPlaying ? 'Stop Music' : 'Play Demo'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.5)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-yellow-400
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/30 text-xs text-center mb-2">Music plays automatically when you flip cards</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {(['major', 'wands', 'cups', 'swords', 'pentacles'] as CardType[]).map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: `${MUSIC_STYLES[type].color}15`,
                      color: MUSIC_STYLES[type].color,
                      opacity: currentMusicType === type ? 1 : 0.5,
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/20 text-xs text-center">
                {useMiniMaxRef.current ? 'MiniMax AI: Enabled' : 'MiniMax AI: Not configured'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}