import { Currency, ETHER, Token } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import BtcLogo from '../../assets/images/btc.png'
import EthLogo from '../../assets/images/ETH.png'
import AdaLogo from '../../assets/images/ada.png'
import CrctLogo from '../../assets/images/cret.png'
import UsdtLogo from '../../assets/images/usdt.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'
import { SWAP_TYPE } from '../../constants'

export const getTokenLogoURL = (address: string) => `/logo/${address}.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency | null
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }
      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if (currency === ETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }
  if (currency?.symbol === SWAP_TYPE.BTC) {
    return <StyledEthereumLogo src={BtcLogo} size={size} style={style} />
  }
  if (currency?.symbol === SWAP_TYPE.ETH) {
    return <StyledEthereumLogo src={EthLogo} size={size} style={style} />
  }
  if (currency?.symbol === SWAP_TYPE.ADA) {
    return <StyledEthereumLogo src={AdaLogo} size={size} style={style} />
  }
  if (currency?.symbol === SWAP_TYPE.USDT) {
    return <StyledEthereumLogo src={UsdtLogo} size={size} style={style} />
  }
  if (currency?.symbol === SWAP_TYPE.CRET) {
    return <StyledEthereumLogo src={CrctLogo} size={size} style={style} />
  }
  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
