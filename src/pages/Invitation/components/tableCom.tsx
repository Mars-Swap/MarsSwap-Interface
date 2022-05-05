import React, { useEffect, useRef, useState } from 'react'
import 'whatwg-fetch'
import styled from 'styled-components'
import { Text } from '../../../components/invitation/styled'
import { AutoRow } from '../../../components/Row'
import { truncateAddressString } from '../../../utils/invitationCallback'
import { useTranslation } from 'react-i18next'
export default function TableCom(props: any) {
  const node = useRef<HTMLDivElement>()
  const { invitationList, handlePre, handleNext, start, endDisabled } = props
  const { t } = useTranslation()
  const IndexPage = styled.div`
    padding: 2px 8px;
    border: 1px solid #999999;
    border-radius: 6px;
    margin: 0 10px;
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `

  const DataRow = styled(AutoRow)`
    justify-items: flex-start;
    margin: 20px 0;
  `
  const Ths = styled.th`
    text-align: left;
    color: '#999999';
  `

  const Row = (props: any) => {
    const { item, index } = props
    const [status, setStatus] = useState<boolean>(false)
    // GetStatusByAddress(item).then((status: any) => {
    //   setStatus(status)
    // })
    useEffect(() => {
      function fetchData() {
        fetch((process.env.REACT_APP_INVITE_STATUS as RequestInfo) || '/invite/', {
          method: 'POST',
          // headers: {
          //   Accept: 'application/json',
          //   'Content-Type': 'application/json'
          // },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'getDeposit',
            params: [item],
            id: 1
          })
        })
          .then(res => {
            return res.json()
          })
          .then(data => {
            const { status } = data.result
            setStatus(status === 'success')
          })
      }
      fetchData()
    })
    return (
      <tr style={{ position: 'relative' }} ref={node as any} key={index}>
        <td style={{ color: '#333333' }}>{index + 1}</td>
        <td>
          <Text style={{ color: '#333333' }}>{truncateAddressString(item)}</Text>
        </td>
        <td style={{ color: '#333333' }}>{status ? t('Pledged') : t('Not Pledged')}</td>
      </tr>
    )
  }
  const Rows = React.memo(Row, (preprop: any, nextprop: any) => {
    return preprop.item !== nextprop.item
  })
  return (
    <section>
      <table style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <Ths>{t('Serial Number')}</Ths>
            <Ths>{t('Member Addresses')}</Ths>
            <Ths>{t('Status')}</Ths>
          </tr>
        </thead>
        <tbody>
          {invitationList?.map((item: any, index: number) => (
            <Rows item={item} key={item} index={index}></Rows>
          ))}
        </tbody>
      </table>
      <DataRow style={{ justifyContent: 'flex-end' }}>
        <IndexPage onClick={handlePre} className={Number(start) === 0 ? 'disabled' : ''}>
          {'<'}
        </IndexPage>
        <IndexPage onClick={handleNext} className={endDisabled ? 'disabled' : ''}>
          {'>'}
        </IndexPage>
      </DataRow>
    </section>
  )
}
