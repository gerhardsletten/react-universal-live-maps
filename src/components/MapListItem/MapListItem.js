import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import styled from 'styled-components'
import moment from 'moment'

import config from '../../config'

const Container = styled.div`
  padding: 4px 8px;
  margin-bottom: 10px;
  border-left: 3px solid #999;
`

export default class MapListItem extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    editAction: PropTypes.func,
    removeAction: PropTypes.func
  }

  render () {
    const {item, editAction, removeAction} = this.props
    return (
      <Container>
        <Link to={`/maps/${item._id}`}>{item.title}</Link>
        {moment(item.date).format(config.dateFormatUI)} -
        {moment(item.date_end).format(config.dateFormatUI)}
        {editAction && (
          <button onClick={editAction.bind(this, item)}>Edit</button>
        )}
        {removeAction && (
          <button onClick={removeAction.bind(this, item)}>Remove</button>
        )}
      </Container>
    )
  }
}
