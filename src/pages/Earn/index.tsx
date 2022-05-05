import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO, useStakingInfo, useCretStakingInfo } from '../../state/stake/hooks'
import { TYPE } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import PoolCardCret from '../../components/earn/PoolCardCret'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
// import { Countdown } from './Countdown'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@uniswap/sdk'
import { BIG_INT_ZERO } from '../../constants'
import { OutlineCard } from '../../components/Card'
import { useTranslation } from 'react-i18next'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

export default function Earn() {
  const { chainId } = useActiveWeb3React()

  // staking info for connected account
  const stakingInfos = useStakingInfo()
  const stakingCartInfos = useCretStakingInfo()

  const { t } = useTranslation()

  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingInfosWithBalance = stakingInfos?.filter(s => JSBI.greaterThanOrEqual(s.stakedAmount.raw, BIG_INT_ZERO))

  // toggle copy if rewards are inactive
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>{t('MarsSwap liquidity mining')}</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  {t('Deposit your Liquidity Provider tokens to receive Mars, the MarsSwap protocol governance token.')}
                </TYPE.white>
              </RowBetween>{' '}
              {/* <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="/blog/Mars/"
                target="_blank"
              >
                <TYPE.white fontSize={14}>{t('Read more about Mars')}</TYPE.white>
              </ExternalLink> */}
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>{t('Participating pools')}</TYPE.mediumHeader>
          {/* <Countdown exactEnd={stakingInfos?.[0]?.periodFinish} /> */}
        </DataRow>

        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !stakingRewardsExist ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : stakingInfos?.length !== 0 && stakingInfosWithBalance.length === 0 ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : (
            [
              ...[stakingInfosWithBalance[1]],
              ...stakingCartInfos,
              ...[stakingInfosWithBalance[0]],
              ...stakingInfosWithBalance?.filter((item, index) => index > 1)
            ]?.map(stakingInfo => {
              // need to sort by added liquidity here
              if (stakingInfo.tokens.length === 1) {
                return <PoolCardCret key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} />
              }
              return <PoolCard key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} />
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}