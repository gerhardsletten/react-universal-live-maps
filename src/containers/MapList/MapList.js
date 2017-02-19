import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-connect'
import Helmet from 'react-helmet'
import styled from 'styled-components'

import {MapListItem} from '../../components'
import {isLoaded, load as loadMaps} from '../../redux/modules/maps'

const Container = styled.div`
  padding: 40px;
`

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = []
    if (!isLoaded(getState())) {
      promises.push(dispatch(loadMaps()))
    }
    return Promise.all(promises)
  }
}])
@connect(
  (state) => ({
    maps: state.maps.items
  })
)
export default class MapList extends Component {
  static propTypes = {
    maps: PropTypes.array
  }

  render () {
    const {maps} = this.props
    return (
      <Container>
        <Helmet title='Maps' />
        <h1>Maps</h1>
        {maps.map((item, i) => {
          return (
            <MapListItem key={i} item={item} />
          )
        })}
      </Container>
    )
  }
}
