import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import config from 'config'
import moment from 'moment'
import style from './style.css'

export default class MapListItem extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    editAction: PropTypes.func,
    removeAction: PropTypes.func,
  }

  render () {
    const {item, editAction, removeAction} = this.props
    return (
      <div className={style.container}>
        <Link to={`/maps/${item._id}`}>{item.title}</Link>
        {moment(item.date).format(config.dateFormatUI)} -
        {moment(item.date_end).format(config.dateFormatUI)}
        {editAction && (
          <button onClick={editAction.bind(this, item)}>Edit</button>
        )}
        {removeAction && (
          <button onClick={removeAction.bind(this, item)}>Remove</button>
        )}
      </div>
    )
  }
}
