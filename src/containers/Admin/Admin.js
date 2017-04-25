import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-connect'
import Helmet from 'react-helmet'
import omit from 'object.omit'
import moment from 'moment'
import DateTime from 'react-datetime'
import styled from 'styled-components'

import {isLoaded, load as loadMaps, add as addMap, edit as editMap, remove} from '../../redux/modules/maps'
import config from '../../config'
import {MapListItem} from '../../components'
import featureDefault from './featureDefault.json'

const Container = styled.div`
  padding: 40px;
`

const Input = styled.input`
  display: block;
  margin: 3px;
  padding: 5px;
  width: 100%;
`

const TextArea = styled.textarea`
  display: block;
  margin: 3px;
  padding: 5px;
  width: 100%;
  min-height: 400px;
`

const Button = styled.button`
  display: inline-block;
  margin: 3px;
`

const Block = styled.div`
  margin-bottom: 1em;
  max-width: 600px;
`

const Label = styled.label`
  display: block;
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
    maps: state.maps.items,
    error: state.maps.error,
    loading: state.maps.loading
  }),
  {addMap, editMap, remove}
)
export default class Admin extends Component {
  static propTypes = {
    maps: PropTypes.array
  }

  state = {
    item: {},
    showForm: false,
    error: null
  }

  handleChange = (name, event) => {
    this.setState({item: {...this.state.item, [name]: event.target.value}})
  }

  handleChangeDate = (name, value) => {
    if (value.toDate) {
      this.setState({item: {...this.state.item, [name]: value.toDate()}})
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
    let {item} = this.state
    if (item.date) {
      item.date = moment(item.date).format(config.dateFormatAPI)
    }
    if (item.date_end) {
      item.date_end = moment(item.date_end).format(config.dateFormatAPI)
    }
    const action = (item._id) ? this.props.editMap(item._id, item) : this.props.addMap(item)
    action.then(() => {
      this.setState({
        showForm: false,
        item: {}
      })
    })
    .catch((err) => {
      this.setState({
        error: err
      })
    })
  }

  handleNew = () => {
    const m = moment().add(2, 'day').hour(12).minute(0).seconds(0).millisecond(0)
    this.setState({
      showForm: true,
      item: {
        title: 'New map',
        url: 'https://bikemaster.no/kmlDownload.asp?r=46',
        date: m.toDate(),
        date_end: moment(m).add(4, 'hour').toDate(),
        features: ''
      }
    })
  }

  handleRemove = (item) => {
    this.props.remove(item._id)
  }

  handleEdit = (item) => {
    this.setState({
      showForm: true,
      item: Object.assign({}, omit(item, 'course'), {
        date: moment(item.date).toDate(),
        date_end: moment(item.date_end).toDate(),
        features: item.features ? JSON.stringify(item.features) : ''
      })
    })
  }

  handleCancel = () => {
    this.setState({
      showForm: false,
      item: {}
    })
  }

  renderForm () {
    const {item, error} = this.state
    return (
      <form onSubmit={this.handleSubmit}>
        {error && (
          <p style={{color: 'red'}}>{error}</p>
        )}
        <Block>
          <Label>Title</Label>
          <Input type='text' value={item.title} onChange={this.handleChange.bind(this, 'title')} placeholder='Map title' />
        </Block>
        <Block>
          <Label>Event start</Label>
          <DateTime value={item.date} dateFormat='DD. MMM YYYY' timeFormat='HH:mm:ss' onChange={this.handleChangeDate.bind(this, 'date')} />
        </Block>
        <Block>
          <Label>Event end</Label>
          <DateTime value={item.date_end} dateFormat='DD. MMM YYYY' timeFormat='HH:mm:ss' onChange={this.handleChangeDate.bind(this, 'date_end')} />
        </Block>
        <Block>
          <Label>GeoJSON feature collection</Label>
          <TextArea value={item.features} onChange={this.handleChange.bind(this, 'features')} placeholder={JSON.stringify(featureDefault)} />
        </Block>
        <Block>
          <Label>KML Url</Label>
          <Input type='text' value={item.url} onChange={this.handleChange.bind(this, 'url')} placeholder='KML url' />
          <Button type='submit'>Save</Button>
          <span onClick={this.handleCancel.bind(this)}>Cancel</span>
        </Block>
      </form>
    )
  }

  render () {
    const {maps, error, loading} = this.props
    const {showForm} = this.state
    return (
      <Container>
        <Helmet title='Admin' />
        <h1>Admin {this.state.other}</h1>
        {error && (
          <p style={{color: 'red'}}>{error}</p>
        )}
        {loading && (
          <p style={{color: 'green'}}>Loading</p>
        )}
        {!showForm && (
          <div>
            <p>
              <button onClick={this.handleNew.bind(this)}>New map</button>
            </p>
            {maps.map((item, i) => {
              return (
                <MapListItem key={i} item={item} editAction={this.handleEdit} removeAction={this.handleRemove} />
              )
            })}
          </div>
        )}
        {showForm && this.renderForm()}
      </Container>
    )
  }
}
