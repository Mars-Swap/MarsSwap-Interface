import { Interface } from '@ethersproject/abi'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as STAKING_REWARDS_FACTORY_ABI } from '@uniswap/liquidity-staker/build/StakingRewardsFactory.json'
import INVITE_STAKE_ABI from './invite-stake.json'
import WETH9_ABI from './weth9.json'

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI)

const STAKING_REWARDS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_FACTORY_ABI)
const INVITE_STAKE = new Interface(INVITE_STAKE_ABI)
const WETH9_ABI_INTERFACE = new Interface(WETH9_ABI)

export { STAKING_REWARDS_FACTORY_INTERFACE, STAKING_REWARDS_INTERFACE, INVITE_STAKE, WETH9_ABI_INTERFACE }
