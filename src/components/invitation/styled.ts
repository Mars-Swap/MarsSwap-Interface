import styled from 'styled-components'
import { AutoColumn } from '../Column'

import uImage from '../../assets/images/big_unicorn.png'
import xlUnicorn from '../../assets/images/xl_uni.png'
import noise from '../../assets/images/noise.png'

export const Line = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e0d5f6;
  margin: 15px 0 10px 0;
`

export const SectionBox = styled.section`
  padding: 10px;
  width: 100%;
  margin-bottom: 10px;
  background: linear-gradient(330deg, #f1eef6 49%, #dfd2f5 96%);
  border-radius: 20px;
`

export const CopyBox = styled.div`
  padding: 3px 4px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #8151db;
  border-radius: 5px;
  font-size: 13px;
  color: #8151db;
`
export const TextBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`
export const Text = styled.div`
  font-size: 14px;
`
export const TextHide = styled(Text)`
  width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
`
export const TextButton = styled.div<{ color?: string; backgroundColor?: string }>`
  padding: 5px 20px;
  border-radius: 5px;
  min-width: 72px;
  cursor: pointer;
  color: ${({ color }) => color && '#ffffff'};
  &.disabled {
    opacity: 0.6;
    cursor: no-drop;
  }
`
export const InputBox = styled.input`
  width: 95%;
  height: 50px;
  background: #ffffff;
  border: 2px solid #f9f6ff;
  border-radius: 10px;
  /* margin-top: 20px; */
  padding-left: 10px;
  &:focus-visible {
    outline: none;
  }
`

export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #814ed9 0%, #2172e5 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

export const CardBGImage = styled.span<{ desaturate?: boolean }>`
  background: url(${uImage});
  width: 1000px;
  height: 600px;
  position: absolute;
  border-radius: 12px;
  opacity: 0.4;
  top: -100px;
  left: -100px;
  transform: rotate(-15deg);
  user-select: none;

  ${({ desaturate }) => desaturate && `filter: saturate(0)`}
`

export const CardBGImageSmaller = styled.span<{ desaturate?: boolean }>`
  background: url(${xlUnicorn});
  width: 1200px;
  height: 1200px;
  position: absolute;
  border-radius: 12px;
  top: -300px;
  left: -300px;
  opacity: 0.4;
  user-select: none;

  ${({ desaturate }) => desaturate && `filter: saturate(0)`}
`

export const CardNoise = styled.span`
  background: url(${noise});
  background-size: cover;
  mix-blend-mode: overlay;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

export const Break = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  height: 1px;
`
