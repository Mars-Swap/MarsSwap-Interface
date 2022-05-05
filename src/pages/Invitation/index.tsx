import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { message } from 'antd'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import { RowBetween, AutoRow } from '../../components/Row'
import {
  GetInvitationData,
  AddInvitationUser,
  HandlePledge,
  HandleRedeem,
  // GetStatusByAddress,
  FetchInvitationList,
  getListLimit,
  // useGetShareByPer,
  truncateAddressString,
  getLockTime,
  getBonusByBlock,
  getExpirationCycle,
  toNonExponential
} from '../../utils/invitationCallback'
import {
  TextBox,
  TextButton,
  CardSection,
  DataCard,
  InputBox,
  Text,
  CopyBox,
  // TextHide,
  SectionBox,
  Line
} from '../../components/invitation/styled'
import { useActiveWeb3React } from '../../hooks'
import { modalType } from '../../constants/invitation'
import Modal from '../../components/Modal'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
// import { useBlockNumber } from '../../state/application/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { useTranslation } from 'react-i18next'
import { CloseOutlined } from '@ant-design/icons'
import TableCom from './components/tableCom'
const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const ColumnCenterEle = styled(ColumnCenter)`
  width: initial;
  min-width: 140px;
  margin-bottom: 10px;
`

const DataRow = styled(AutoRow)`
  justify-items: flex-start;
  margin: 20px 0;
`
const Sections = styled.div`
  text-align: center;
  width: 100%;
`
export default function Invitation() {
  const { account } = useActiveWeb3React()
  // const blockNumber = useBlockNumber()
  // const accPerShare = useGetShareByPer()
  const [isOpen, setModel] = useState<boolean>(false)
  const [inputValue, setValue] = useState<string>('')
  const [modelTitle, setModleTitle] = useState<string>('')
  const [modelType, setModelType] = useState<string>('')
  const [placeholder, setPlaceholder] = useState<string>('')
  const [messageError, setMessageError] = useState<string>('')
  const [useInvitation] = AddInvitationUser()
  const [usePledge] = HandlePledge()
  const [useRedeem] = HandleRedeem()
  const toggleWalletModal = useWalletModalToggle()
  const {
    invatationUser,
    totalMortgageMount,
    accumulatedRebateMount,
    accumulatedMount,
    min,
    max,
    isRedeemed,
    totalAmount
  } = GetInvitationData()
  const ethBalance = useETHBalances(account ? [account] : [])?.[account ?? '']?.toSignificant(4)

  // 每天收益 = 每块的奖励 / total * 自己的质押数量 * 28800
  // 每天收益 * 合约上获取到期周期
  const bonus = toNonExponential(
    `${(getBonusByBlock() / totalAmount) * totalMortgageMount * 28800 * getExpirationCycle()}`
  )
  const { t } = useTranslation()
  useEffect(() => {
    sessionStorage.removeItem('startIndex')
    sessionStorage.removeItem('endIndex')
  }, [])
  // we want the latest one to come first, so return negative if a is after b
  function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime
  }
  const [isPledge, unlockRemainingTime] = getLockTime()
  const Status = () => {
    const allTransactions = useAllTransactions()
    const sortedRecentTransactions = useMemo(() => {
      const txs = Object.values(allTransactions)
      return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
    return !!pending.length
  }
  const transactionStatus = Status()

  const toggleClaimModal = () => {
    //
  }
  const handleAll = () => {
    modelType === modalType.MORTGAGE ? setValue(ethBalance ?? '') : setValue(totalMortgageMount ?? '')
  }
  const getButtons = () => {
    return (
      <TextButton
        style={{
          color: '#FFFFFF',
          background: '#8151DB',
          width: '10%',
          textAlign: 'center',
          marginLeft: '10px'
        }}
        onClick={handleAll}
      >
        {t('ALL')}
      </TextButton>
    )
  }
  const getAllButton = () => {
    switch (modelType) {
      case modalType.MORTGAGE:
        return inputValue !== ethBalance ? getButtons() : ''
      case modalType.REDEEM:
        return inputValue !== totalMortgageMount ? getButtons() : ''
      default:
        return ''
    }
  }
  const close = () => {
    setValue('')
    setMessageError('')
    setModel(false)
  }
  const ConfirmModel = () => {
    let eventName = null
    let reg = true
    let error = ''
    switch (modelType) {
      case modalType.INVITATION:
        eventName = useInvitation
        reg = /^(0x)?[0-9a-fA-F]{40}$/i.test(inputValue + '')
        error =
          inputValue?.toLowerCase() === account?.toLowerCase()
            ? t('Invitees cannot be themselves')
            : t('Please enter the correct Addresses')
        break
      case modalType.MORTGAGE:
        eventName = usePledge
        reg = !!(inputValue && Number(inputValue) >= min && Number(inputValue) <= max)
        error = `${min}~${max}`
        break
      case modalType.REDEEM:
        eventName = useRedeem
        const isNumber = /^(([1-9][0-9]*\.[0-9][0-9]*)|([0]\.[0-9][0-9]*)|([1-9][0-9]*)|([0]{1}))$/
        reg = !!(Number(inputValue) <= Number(totalMortgageMount)) && isNumber.test(inputValue)
        error = t('Please enter the correct Redemption amount')
        break
      default:
        eventName = useInvitation
        reg = /^(0x)?[0-9a-fA-F]{40}$/i.test(inputValue + '')
        error =
          modelType === modalType.INVITATION ? t('One cannot invite oneself') : t('Please enter the correct Addresses')
    }
    if (!reg || inputValue?.toLowerCase() === account?.toLowerCase()) {
      setMessageError(error)
      return
    }
    eventName(inputValue)
    close()
  }
  const handleMortgage = useCallback(() => {
    if (transactionStatus || !Number(ethBalance)) {
      return
    }
    if (account) {
      setModelType(modalType.MORTGAGE)
      setModleTitle(t('Pledge'))
      setPlaceholder(t('Please enter your Mars Amount'))
      setModel(true)
    } else {
      toggleWalletModal()
    }
  }, [transactionStatus, ethBalance, account, t, toggleWalletModal])
  const handleRedeem = useCallback(() => {
    if (transactionStatus) {
      return
    }
    if (account) {
      if (isRedeemed && totalMortgageMount) {
        setModelType(modalType.REDEEM)
        setModleTitle(t('Redemption'))
        setPlaceholder(t('Please enter your redemption amount'))
        setModel(true)
      }
    } else {
      toggleWalletModal()
    }
  }, [transactionStatus, account, isRedeemed, totalMortgageMount, t, toggleWalletModal])
  const handleRedeemProfit = useCallback(() => {
    if (account) {
      if (Number(accumulatedMount) && !transactionStatus) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useRedeem(0)
      }
    } else {
      toggleWalletModal()
    }
  }, [account, accumulatedMount, toggleWalletModal, transactionStatus, useRedeem])
  const handleChange = (event: any) => {
    setValue(event.target.value)
  }
  const handleCopy = () => {
    const aux = document.createElement('input')
    aux.setAttribute('value', account || '')
    document.body.appendChild(aux)
    aux.select()
    document.execCommand('copy')
    document.body.removeChild(aux)
    message.success(t('Copy Successfully'))
  }
  const handleAddInvitation = useCallback(() => {
    if (transactionStatus) {
      return
    }
    if (account) {
      setModelType(modalType.INVITATION)
      setModleTitle(t('Add Invitation'))
      setPlaceholder(t('Please enter your Referral Addresses'))
      setModel(true)
    } else {
      toggleWalletModal()
    }
  }, [account, t, toggleWalletModal, transactionStatus])
  const Tables = React.memo(TableCom)
  const Table = () => {
    const [pageChange, setPageChange] = useState<boolean>(false)
    const [list, setList] = useState<any[]>([])
    const startIndex = sessionStorage.getItem('startIndex') || 0
    const endIndex = sessionStorage.getItem('endIndex') || 10
    const { totalCount } = getListLimit()
    const invitationList = FetchInvitationList(Number(startIndex), Number(endIndex))
    const handlePre = () => {
      const start = Number(startIndex) - 10
      const end = Number(endIndex) - 10
      if (start < 0) {
        return
      }
      sessionStorage.setItem('startIndex', `${start}`)
      sessionStorage.setItem('endIndex', `${end}`)
      setPageChange(!pageChange)
      setTimeout(() => {
        setPageChange(!pageChange)
        const res = getListLimit()
        const { invitationList } = res
        setList([...invitationList])
      }, 1000)
    }
    const handleNext = () => {
      if (totalCount <= endIndex) {
        return
      }
      const start = Number(startIndex) + 10
      const end = Number(endIndex) + 10
      sessionStorage.setItem('startIndex', `${start}`)
      sessionStorage.setItem('endIndex', `${end}`)
      setPageChange(!pageChange)
      setTimeout(() => {
        setPageChange(!pageChange)
        const res = getListLimit()
        const { invitationList } = res
        setList([...invitationList])
      }, 1000)
    }
    return (
      <Tables
        invitationList={list.length ? list : invitationList || []}
        handlePre={handlePre}
        handleNext={handleNext}
        start={startIndex}
        endDisabled={totalCount <= endIndex}
      ></Tables>
    )
  }
  return (
    <PageWrapper gap="lg" justify="center" style={{ display: 'block' }}>
      <SectionBox>
        <TextBox style={{ flexWrap: 'wrap', marginRight: '0px', maxWidth: '400px' }}>
          <Text style={{ flex: 'auto', display: 'flex', alignItems: 'center' }}>
            <Text style={{ minWidth: '60px', color: '#666666' }}>{t('Referral')}:</Text>
            <Text style={{ color: '#333333', flex: 'auto', maxWidth: '160px' }}>
              {truncateAddressString(invatationUser && invatationUser[0] ? invatationUser[1] : '') || ' --'}
            </Text>
          </Text>
          {(!invatationUser || !invatationUser[0]) && (
            <CopyBox onClick={handleAddInvitation}>{t('Add Invitation')}</CopyBox>
          )}
        </TextBox>
        <TextBox style={{ marginTop: '10px', flexWrap: 'wrap', marginRight: '0px', maxWidth: '385px' }}>
          <Text style={{ flex: 'auto', display: 'flex', alignItems: 'center' }}>
            <Text style={{ minWidth: '60px', color: '#666666' }}>{t('Invitation Code')}：</Text>
            <Text style={{ color: '#333333', width: '150px' }}>{truncateAddressString(account || '')}</Text>
          </Text>
          <TextBox style={{ marginLeft: '10px' }}>
            <CopyBox onClick={handleCopy}>{t('Copy')}</CopyBox>
          </TextBox>
        </TextBox>
        <Line></Line>
        <DataRow>
          <ColumnCenterEle style={{ alignItems: 'flex-start', marginRight: '20px' }}>
            <Text style={{ color: '#666666' }}>{t('Total Amount of Staking')}</Text>
            <TYPE.white fontWeight={600} style={{ margin: '10px 0', color: '#000000', fontWeight: 'bold' }}>
              {totalAmount}
            </TYPE.white>
          </ColumnCenterEle>
          <ColumnCenterEle style={{ alignItems: 'flex-start', marginRight: '20px' }}>
            <Text style={{ color: '#666666' }}>{t('Accumulated Rebate Rewards')}</Text>
            <TYPE.white fontWeight={600} style={{ margin: '10px 0', color: '#000000', fontWeight: 'bold' }}>
              {accumulatedRebateMount}
            </TYPE.white>
          </ColumnCenterEle>
          <ColumnCenterEle style={{ alignItems: 'flex-start', marginRight: '20px' }}>
            <Text style={{ color: '#666666' }}>
              {t('Current Earnings')}
              {/* {`(块高度：${blockNumber || ''}, 累计收益率：${accPerShare})`} */}
            </Text>
            <TYPE.white fontWeight={600} style={{ margin: '10px 0', color: '#000000', fontWeight: 'bold' }}>
              {accumulatedMount}
            </TYPE.white>
          </ColumnCenterEle>
          <ColumnCenterEle style={{ alignItems: 'flex-start' }}>
            <Text style={{ color: '#666666' }}>{t('Estimation', { cycle: getExpirationCycle() })}</Text>
            <TYPE.white fontWeight={600} style={{ margin: '10px 0', color: '#000000', fontWeight: 'bold' }}>
              {bonus >= 0 ? bonus : ''}
            </TYPE.white>
          </ColumnCenterEle>
        </DataRow>
        <TextBox style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TextButton
            className={!Number(accumulatedMount) || transactionStatus ? 'disabled' : ''}
            onClick={handleRedeemProfit}
            style={{ color: '#ffffff', backgroundColor: '#8151DB', marginRight: '10px' }}
          >
            {t('Redeemed Earnings')}
          </TextButton>
        </TextBox>
      </SectionBox>
      <SectionBox style={{ background: 'linear-gradient(333deg,#eff2f7 40%, #cee0f5 95%)', margin: '15px 0' }}>
        <Text style={{ fontSize: '12px', color: '#333333' }}>{t('Members Info')}</Text>
        <Table></Table>
      </SectionBox>
      <TopSection gap="md">
        <DataCard style={{ background: 'linear-gradient(170deg,#074da8 0%, #000000 82%)' }}>
          <CardSection>
            <RowBetween style={{ width: '100%' }}>
              <ColumnCenter style={{ alignItems: 'flex-start', wordBreak: 'break-all', width: '100%' }}>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontWeight={500} style={{ marginBottom: '10px', fontSize: '12px' }}>
                    {t('Current Staking')}
                  </TYPE.white>
                  <TYPE.white style={{ fontSize: '12px' }}>
                    {isPledge ? `质押结束于${unlockRemainingTime}` : ''}
                  </TYPE.white>
                </RowBetween>
                <TextBox>
                  <TYPE.white fontWeight={600} style={{ fontSize: '20px' }}>
                    {totalMortgageMount}&nbsp; Mars
                  </TYPE.white>
                </TextBox>
              </ColumnCenter>
            </RowBetween>
            <RowBetween style={{ marginTop: '20px' }}>
              <TextButton
                className={transactionStatus || !Number(ethBalance) ? 'disabled' : ''}
                onClick={handleMortgage}
                style={{
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  marginRight: '10px',
                  width: '45%',
                  textAlign: 'center'
                }}
              >
                {Number(ethBalance) ? t('Pledge') : t('Insufficient Balance')}
              </TextButton>
              <TextButton
                className={!isRedeemed || !Number(totalMortgageMount) || transactionStatus ? 'disabled' : ''}
                onClick={handleRedeem}
                style={{ color: '#ffffff', background: '#8151DB', width: '45%', textAlign: 'center' }}
              >
                {t('Redemption')}
              </TextButton>
            </RowBetween>
          </CardSection>
        </DataCard>
      </TopSection>
      <Modal isOpen={isOpen} onDismiss={toggleClaimModal}>
        <ColumnCenterEle
          style={{
            width: '100%'
          }}
        >
          <RowBetween style={{ padding: '10px' }}>
            <Text style={{ color: '#000000', fontSize: '15px' }}>{modelTitle} </Text>
            <Text style={{ color: '#666666', fontSize: '15px' }} onClick={close}>
              <CloseOutlined />
            </Text>
          </RowBetween>
          <Sections>
            <RowBetween style={{ padding: '10px', alignItems: 'center' }}>
              <InputBox
                placeholder={placeholder}
                value={inputValue}
                onChange={event => {
                  handleChange(event)
                }}
              ></InputBox>
              {getAllButton()}
            </RowBetween>
            {messageError && <Sections style={{ color: 'red' }}>{messageError}</Sections>}
          </Sections>
          <TextBox style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
            <TextButton
              style={{ color: '#878A93', background: '#edeef2', width: '40%', margin: '10px', textAlign: 'center' }}
              onClick={close}
            >
              {t('Cancel')}
            </TextButton>
            <TextButton
              style={{ color: '#FFFFFF', background: '#8151DB', width: '40%', margin: '10px', textAlign: 'center' }}
              onClick={ConfirmModel}
            >
              {t('Confirm')}
            </TextButton>
          </TextBox>
        </ColumnCenterEle>
      </Modal>
    </PageWrapper>
  )
}
