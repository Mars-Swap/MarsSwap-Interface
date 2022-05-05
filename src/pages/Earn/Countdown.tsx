import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STAKING_GENESIS, REWARDS_DURATION_DAYS, REWARDS_DURATION_DAYS_CRET } from '../../state/stake/hooks'
import { TYPE } from '../../theme'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const REWARDS_DURATION = DAY * REWARDS_DURATION_DAYS
const REWARDS_DURATION_CRET = DAY * REWARDS_DURATION_DAYS_CRET

export function Countdown({ exactEnd, tokens }: { exactEnd?: Date; tokens?: any[] }) {
  // get end/beginning times
  const end = useMemo(() => (exactEnd ? Math.floor(exactEnd.getTime() / 1000) : STAKING_GENESIS + REWARDS_DURATION), [
    exactEnd
  ])
  const isSingleCurrency = tokens?.length === 1
  const begin = useMemo(() => end - (isSingleCurrency ? REWARDS_DURATION_CRET : REWARDS_DURATION), [
    end,
    isSingleCurrency
  ])

  // get current time
  const [time, setTime] = useState(() => Math.floor(Date.now() / 1000))
  useEffect((): (() => void) | void => {
    // we only need to tick if rewards haven't ended yet
    if (time <= end) {
      const timeout = setTimeout(() => setTime(Math.floor(Date.now() / 1000)), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [time, end])

  const timeUntilGenesis = begin - time
  const timeUntilEnd = end - time

  const { t } = useTranslation()

  let timeRemaining: number
  let message: string
  if (timeUntilGenesis >= 0) {
    message = isSingleCurrency ? t('Staking begin in') : t('Rewards begin in')
    timeRemaining = timeUntilGenesis
  } else {
    const ongoing = timeUntilEnd >= 0
    if (ongoing) {
      message = isSingleCurrency ? t('Staking end in') : t('Rewards end in')
      timeRemaining = timeUntilEnd
    } else {
      message = isSingleCurrency ? t('Staking have ended!') : t('Rewards have ended!')
      timeRemaining = Infinity
    }
  }
  
  const days = (timeRemaining - (timeRemaining % DAY)) / DAY
  timeRemaining -= days * DAY
  const hours = ((timeRemaining - (timeRemaining % HOUR)) / HOUR)
  timeRemaining -= hours * HOUR
  const minutes = ((timeRemaining - (timeRemaining % MINUTE)) / MINUTE)
  timeRemaining -= minutes * MINUTE
  const seconds = timeRemaining
  
  const hour = hours.toString().length === 1 ? `0${hours.toString()}`: hours.toString()
  const minute = minutes.toString().length === 1 ? `0${minutes.toString()}`: minutes.toString()
  const second = seconds.toString().length === 1 ? `0${seconds.toString()}`: seconds.toString()

  return (
    <TYPE.black fontWeight={400}>
      {message}{' '}
      {Number.isFinite(timeRemaining) && (
        <code>
          {`${days}:${hour}:${minute}:${second}`}
            
        </code>
      )}
    </TYPE.black>
  )
}
