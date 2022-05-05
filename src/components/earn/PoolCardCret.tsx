import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
import { ButtonPrimary } from '../Button'
import { useColor } from '../../hooks/useColor'
import { Break, CardNoise, CardBGImage } from './styled'
import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { useTranslation } from 'react-i18next'
import CurrencyLogo from '../CurrencyLogo'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`
const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function PoolCard({ stakingInfo }: { stakingInfo: any }) {
  const currency0 = stakingInfo.tokens[0]
  const backgroundColor = useColor()

  const { t } = useTranslation()
  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <CurrencyLogo currency={currency0} size="24px" />
        <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '-8px' }}>
          {currency0.symbol}
        </TYPE.white>

        <StyledInternalLink to={`/Mars/${currency0.address}`} style={{ width: '100%' }}>
          <ButtonPrimary padding="8px" borderRadius="8px">
            {isStaking ? t('Manage') : t('Deposit')}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.white> {t('Total deposited')}</TYPE.white>
          <TYPE.white>
            {(stakingInfo && stakingInfo.totalStakedAmount?.toSignificant(10, { groupSeparator: ',' })) ?? '-'}{' '}
            {currency0.symbol}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {t('Pool Rate')} </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${stakingInfo.totalRewardRate
                    ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                    ?.toFixed(0, { groupSeparator: ',' })} ${currency0.symbol} / week`
                : `0 ${currency0.symbol} / week`
              : '-'}
          </TYPE.white>
        </RowBetween>
      </StatContainer>
      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>{t('Your rate')}</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚡
              </span>
              {stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.rewardRate
                      ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                      ?.toSignificant(4, { groupSeparator: ',' })} ${currency0.symbol} / week`
                  : `0 ${currency0.symbol} / week`
                : '-'}
            </TYPE.black>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
