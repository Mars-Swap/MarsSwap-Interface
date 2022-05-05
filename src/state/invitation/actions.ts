import { createAction } from '@reduxjs/toolkit'

export const addInvitationList = createAction<{ list: string[] }>('invitation/addInvitationList')
