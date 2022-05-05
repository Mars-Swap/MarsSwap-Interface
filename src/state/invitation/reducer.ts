import { createReducer } from '@reduxjs/toolkit'
import { addInvitationList } from './actions'

export const initialState: any = { list: [] }

export default createReducer(initialState, builder =>
  builder.addCase(addInvitationList, (state, { payload: { list } }) => {
    return {
      ...state,
      list
    }
  })
)
