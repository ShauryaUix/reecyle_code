import React from 'react'
import styled from 'styled-components'

import List from 'antd/lib/list'

const ArchiveTableList = styled(List)`
  flex: 1;
`

const ArchiveTableListItem = styled(List.Item)`
  padding: 30px 10px;
  &:first-child {
    padding-top: 10px;
  }
`

const Title = styled.div`
  font-size: 28px;
  font-weight: 700;
`

const Subtitle = styled.div`
  font-size: 16px;
  opacity: 0.5;
`

const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: stretch;
  width: 100%;
  margin-left: -5px;
`

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 5px;
  min-width: 125px;
  margin-right: 10px;
  margin-top: 15px;
  width: 160px;
  @media screen and (max-width: 425px) {
    width: 100%;
  }
`

const InfoItemLabel = styled.div`
  font-size: 14px;
  text-align: center;
  flex: 1;
  opacity: 0.5;
`

const InfoItemValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
`

export default function ArchiveTableCards({
  columns: allColumns,
  titleColumnPath,
  subtitleColumnPath,
  ...props
}) {
  const { titleColumn, subtitleColumn, columns } = allColumns.reduce(
    (agr, column) => {
      if (column.path === titleColumnPath) {
        agr.titleColumn = column
      } else if (column.path === subtitleColumnPath) {
        agr.subtitleColumn = column
      } else {
        agr.columns.push(column)
      }
      return agr
    },
    { titleColumn: null, subtitleColumn: null, columns: [] }
  )
  return (
    <ArchiveTableList
      itemLayout="vertical"
      {...props}
      renderItem={(item) => (
        <ArchiveTableListItem key={item[props.rowKey]}>
          <Title>
            {titleColumn ? titleColumn.render('', item) : item.name || item._id}
          </Title>
          {subtitleColumn ? (
            <Subtitle>{subtitleColumn.render('', item)}</Subtitle>
          ) : null}
          <Info>
            {columns.map((column) => (
              <InfoItem key={column.key}>
                <InfoItemLabel>{column.title}</InfoItemLabel>
                <InfoItemValue>{column.render('', item)}</InfoItemValue>
              </InfoItem>
            ))}
          </Info>
        </ArchiveTableListItem>
      )}
    />
  )
}
