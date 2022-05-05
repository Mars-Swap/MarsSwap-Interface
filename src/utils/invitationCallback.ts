/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useCallback } from 'react'
import { message } from 'antd'
import 'antd/dist/antd.css'
import { TransactionResponse } from '@ethersproject/providers'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { INVITE_STAKE } from '../constants/abis/staking-rewards'
import { useActiveWeb3React } from '../hooks/index'
import { useInvitationContract } from '../hooks/useContract'
import { calculateGasMargin } from '.'
import { useTransactionAdder } from '../state/transactions/hooks'
import { contractAddress, wei, InvitatinData } from '../constants/invitation'
// import { addInvitationList } from '../state/invitation/actions'
// import { useDispatch } from 'react-redux'
// import { AppDispatch } from '../state/index'

const listLimit: any = new InvitatinData()
const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

const errors = (messages: string) => {
  message.error(messages)
}
// 处理科学记数法转数字；
export const toNonExponential = (numStr: string) => {
  //这边看下你那边有没有指定格式，可能没有+，所以后面改成('E')就好了
  const temp: string[] = numStr.toUpperCase().split('E+')
  const tempReduce: string[] = numStr.toUpperCase().split('E-')
  if (!temp[1] && !tempReduce[1]) {
    return numStr
  } else {
    if (temp[1]) {
      console.log('temp[0]:::', temp[0])
      const arr = temp[0].split('.')
      let tempNumStr = '1'
      let lengths = 0
      if (arr[1]) {
        tempNumStr = `${arr[0]}${arr[1]}`
        lengths = arr[1].length
      }
      for (let i = 0; i < parseInt(temp[1]) - lengths; i++) {
        tempNumStr += '0'
      }
      return tempNumStr
    } else {
      if (parseInt(tempReduce[1]) > 5) {
        return 0
      }
      let tempNumStr = '0.'
      for (let i = 0; i < parseInt(tempReduce[1]) - 1; i++) {
        tempNumStr += '0'
      }
      return tempNumStr + tempReduce[0]
    }
  }
}

export function truncateAddressString(address: string, num = 8) {
  if (!address) {
    return ''
  }

  const first = address.slice(0, num)
  const last = address.slice(-num)
  return `${first}...${last}`
}
export function getListLimit() {
  return listLimit
}
export function formart16To10(val: any) {
  if (!val?.result || !val?.result[0]._hex) {
    return 0
  }
  return parseInt(val?.result[0]._hex, 16)
}
export function formart16To10ByNumber(val: any) {
  return Number(parseInt(val, 16)) || 0
}
// 获取到期周期；
export function getExpirationCycle() {
  const expirationCycle = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'expire')
  if (!expirationCycle[0].loading && !expirationCycle[0].error) {
    return formart16To10(expirationCycle[0]) / 28800
  }
  return 0
}
// 获取每个块的奖励；
export function getBonusByBlock() {
  const bonus = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'MarsPerBlock')
  if (!bonus[0].loading && !bonus[0].error) {
    return formart16To10(bonus[0]) / wei
  }
  return 0
}
// 获取锁仓剩余时间；
export function getLockTime() {
  const { account } = useActiveWeb3React()
  const blockCount: any[] = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'getRemainderExpire', [
    account ?? ''
  ])
  if (!blockCount[0].loading && !blockCount[0].error) {
    let timeRemaining = formart16To10ByNumber(blockCount[0]?.result[1]._hex) * 3

    const days = (timeRemaining - (timeRemaining % DAY)) / DAY
    timeRemaining -= days * DAY
    const hours = ((timeRemaining - (timeRemaining % HOUR)) / HOUR)
    timeRemaining -= hours * HOUR
    const minutes = ((timeRemaining - (timeRemaining % MINUTE)) / MINUTE)
    timeRemaining -= minutes * MINUTE
    const hour = hours.toString().length === 1 ? `0${hours.toString()}`: hours.toString()
    const minute = minutes.toString().length === 1 ? `0${minutes.toString()}`: minutes.toString()
    return [
      blockCount[0]?.result[0],
      `${days} 天 ${hour} 小时 ${minute}分`
    ]
  }
  return [false, 0]
}
// 获取每股收益；
export function useGetShareByPer() {
  const share = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'accPerShare')
  if (!share[0].loading && !share[0].error) {
    return formart16To10(share[0])
  }
  return 0
}
// 添加邀请人；
export function AddInvitationUser() {
  const tokenContract = useInvitationContract(contractAddress[0])
  const addTransaction = useTransactionAdder()
  const useInvitation = useCallback(
    async (inviter?: string): Promise<void> => {
      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }

      const estimatedGas = await tokenContract.estimateGas.addInviter(inviter).catch(error => {
        errors(error.data ? error.data.message : error.message ?? '请重新尝试')
        return tokenContract.estimateGas.addInviter(inviter)
      })

      return tokenContract
        .addInviter(inviter, {
          gasLimit: calculateGasMargin(estimatedGas)
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {})
        })
        .catch((error: any) => {
          errors(error.data ? error.data.message : error.message ?? '请重新尝试')
          console.debug('Failed to approve token', error)
          throw error
        })
    },
    [tokenContract, addTransaction]
  )
  return [useInvitation]
}
// 赎回
export function HandleRedeem() {
  const tokenContract = useInvitationContract(contractAddress[0])
  const addTransaction = useTransactionAdder()
  const useRedeem = useCallback(
    async (num: number | string): Promise<void> => {
      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }
      const amount = `${Number(num) * wei}`
      const estimatedGas = await tokenContract.estimateGas.withdraw(amount).catch(() => {
        return tokenContract.estimateGas.withdraw(amount)
      })

      return tokenContract
        .withdraw(amount, {
          gasLimit: calculateGasMargin(estimatedGas)
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {})
        })
        .catch((error: any) => {
          errors(error.data ? error.data.message : error.message ?? '请重新尝试')
          console.debug('Failed to approve token', error)
          throw error
        })
    },
    [tokenContract, addTransaction]
  )
  return [useRedeem]
}

// 抵押；
export function HandlePledge() {
  const tokenContract = useInvitationContract(contractAddress[0])
  const addTransaction = useTransactionAdder()
  const usePledge = useCallback(
    async (num: number | string): Promise<void> => {
      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }
      const amount = toNonExponential(`${Number(num) * wei}`)
      const estimatedGas = await tokenContract.estimateGas
        .deposit({
          value: amount
        })
        .catch((error: any) => {
          errors(error.data ? error.data.message : error.message ?? '请重新尝试')
          return tokenContract.estimateGas.deposit({
            value: amount
          })
        })
      return tokenContract
        .deposit({
          gasLimit: calculateGasMargin(estimatedGas),
          value: amount
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {})
        })
        .catch((error: any) => {
          errors(error.data ? error.data.message : error.message ?? '请重新尝试')
          console.debug('Failed to approve token', error)
          throw error
        })
    },
    [tokenContract, addTransaction]
  )
  return [usePledge]
}

// 获取被邀请人数量；
export function getInviteeListLength() {
  const { account } = useActiveWeb3React()
  const tokenContract: any = useInvitationContract(contractAddress[0])
  tokenContract.getInviteeListLength(account).then(async (response: any) => {
    listLimit.totalCount = formart16To10ByNumber(response._hex)
  })
}

// // 根据账户获取邀请人；
export function GetInvitationUser() {
  const { account } = useActiveWeb3React()
  const invatationUser = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'getInviter', [account || ''])
  return invatationUser
}
export function GetStatusByAddress(address: string) {
  const tokenContract: any = useInvitationContract(contractAddress[0])
  return useMemo(() => {
    return tokenContract
      .isDeposit(address)
      .then(async (response: TransactionResponse) => {
        return response
      })
      .catch((error: Error) => {
        console.log('error', error)
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [address, tokenContract])
}
export function FetchInvitationList(start: number, end: number) {
  const { account } = useActiveWeb3React()
  const tokenContract: any = useInvitationContract(contractAddress[0])
  // const dispatch = useDispatch<AppDispatch>()
  tokenContract.getInviteeListV2(start, end, account).then(async (response: any) => {
    if (response) {
      listLimit.invitationList = [...response]
      // dispatch(addInvitationList({ list: [...response] }))
    }
  })
  return listLimit.invitationList
}
// 获取用户抵押值；
export function GetUserDepInvAmount() {
  const { account } = useActiveWeb3React()
  const userDepInvAmount = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'getStakedInvitation', [
    account || ''
  ])
  const userDepositAmountObj: any = userDepInvAmount[0]
  const result = userDepositAmountObj.result
  if (!userDepositAmountObj.loading && !userDepositAmountObj.error && result) {
    return {
      totalMortgageMount: toNonExponential(`${Number(formart16To10ByNumber(result[0]._hex)) / wei}`),
      accumulatedRebateMount: toNonExponential(`${Number(formart16To10ByNumber(result[1]._hex)) / wei}`)
    }
  }
  return {}
}
// 获取用户收益
export function GetUserProfit() {
  const { account } = useActiveWeb3React()
  const accumulatedMount = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'getProfit', [account || ''])
  const result = accumulatedMount[0].result
  if (result) {
    return toNonExponential(`${Number(formart16To10ByNumber(result[0]._hex)) / wei}`)
  }
  return 0
}
// 获取抵押最小值；
export async function GetminAmount() {
  const tokenContract: any = useInvitationContract(contractAddress[0])
  const res = await tokenContract
    .stakeLowerLimit()
    .then(async (response: TransactionResponse) => {
      return response
    })
    .catch((error: Error) => {
      console.log('error', error)
      console.debug('Failed to approve token', error)
      throw error
    })
  if (res) {
    const num = formart16To10ByNumber(res._hex) / wei
    listLimit.min = toNonExponential(`${num}`)
  }
  return 0
}
// 获取抵押最大值；
export async function GetmaxAmount() {
  const tokenContract: any = useInvitationContract(contractAddress[0])
  const res = await tokenContract
    .stakeUpLimit()
    .then(async (response: TransactionResponse) => {
      return response
    })
    .catch((error: Error) => {
      console.log('error', error)
      console.debug('Failed to approve token', error)
      throw error
    })
  if (res) {
    listLimit.max = formart16To10ByNumber(res._hex) / wei
  }
  return 0
}
// 查询是否可以抵押赎回本金；
export async function IsExpire() {
  const { account } = useActiveWeb3React()
  const tokenContract: any = useInvitationContract(contractAddress[0])
  const res = await tokenContract
    .isExpire(account)
    .then(async (response: TransactionResponse) => {
      return response
    })
    .catch((error: Error) => {
      console.log('error', error)
      console.debug('Failed to approve token', error)
      throw error
    })
  listLimit.isRedeemed = res
}
// 获取抵押总量
export function FetchTotalAmount() {
  const totalAmount = useMultipleContractSingleData(contractAddress, INVITE_STAKE, 'totalAmount')
  return toNonExponential(`${Number(formart16To10(totalAmount[0])) / wei}`)
}
function GetInvitationDataByAccount() {
  const invatationUser = GetInvitationUser()
  const userAmount = GetUserDepInvAmount()
  const accumulatedMount = GetUserProfit()
  const totalAmount = FetchTotalAmount()
  GetminAmount()
  GetmaxAmount()
  IsExpire()
  getInviteeListLength()
  return useMemo(() => {
    let obj: any = {}
    const invatationUserObj = invatationUser[0]
    if (!invatationUserObj.loading) {
      obj = {
        invatationUser: invatationUserObj.result,
        accumulatedMount,
        totalAmount,
        ...userAmount
      }
    }
    return { ...obj, ...listLimit }
  }, [invatationUser, userAmount, accumulatedMount, totalAmount])
}
export function GetInvitationData() {
  const { account } = useActiveWeb3React()
  if (!account) {
    return {}
  }
  return GetInvitationDataByAccount()
}
