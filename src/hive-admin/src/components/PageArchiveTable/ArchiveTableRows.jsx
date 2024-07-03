import styled from 'styled-components'

import Table from 'antd/lib/table'

const ArchiveTableRows = styled(Table)`
  .ant-table > .ant-table-content table {
    border-color: ${({ theme }) => theme.less.borderColor};
    th,
    td {
      padding: 8px 12px !important;
      border-color: ${({ theme }) => theme.less.borderColor} !important;
      white-space: nowrap;
    }
    th > span {
      color: ${({ theme }) => theme.less.textColor};
      font-weight: 400;
    }
  }
`

export default ArchiveTableRows
