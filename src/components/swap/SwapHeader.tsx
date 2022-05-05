import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  const { t } = useTranslation()
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.black fontWeight={500}>{t('swap')}</TYPE.black>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}