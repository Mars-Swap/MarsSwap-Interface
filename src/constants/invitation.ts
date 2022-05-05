export enum modalType {
  INVITATION = 'INVITATION', // 邀请
  MORTGAGE = 'MORTGAGE', //抵押；
  REDEEM = 'REDEEM', // 赎回本机
  REDEEM_PROFIT = 'REDEEM_PROFIT' // 赎回收益
}
export const wei = 1e18

export const contractAddress = [process.env.REACT_APP_INVITE_ADDRESS]
interface InvitatinDataInterface {
  max: string
  min: string
  invitationList: any[]
  isRedeemed: boolean
}
export class InvitatinData implements InvitatinDataInterface {
  max = ''
  min = ''
  invitationList = []
  isRedeemed = false
  totalCount = 0
  // constructor() {
  //   //
  // }
}
