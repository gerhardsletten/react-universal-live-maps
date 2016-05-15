import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {asyncConnect} from 'redux-async-connect'
import Helmet from 'react-helmet'
import {Link} from 'react-router'
import {isLoaded, load as loadMaps, add as addMap, edit as editMap, remove} from 'redux/modules/maps'
import omit from 'object.omit'
import moment from 'moment'
import DateTime from 'react-datetime'
import featureDefault from './featureDefault.json'
import style from './style.css'

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
      item.date = moment(item.date).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
    }
    if (item.date_end) {
      item.date_end = moment(item.date_end).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
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
        url: 'http://bikemaster.no/kmlDownload.asp?r=46',
        date: m.toDate(),
        date_end: moment(m).add(4, 'hour').toDate(),
        features: JSON.stringify(featureDefault)
      }
    })
  }

  handleRemove = (id) => {
    this.props.remove(id)
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
        <div className={style.block}>
          <label>Title</label>
          <input type='text' value={item.title} onChange={this.handleChange.bind(this, 'title')} placeholder='Map title' />
        </div>
        <div className={style.block}>
          <label>Event start</label>
          <DateTime value={item.date} dateFormat='DD. MMM YYYY' timeFormat='HH:mm:ss' onChange={this.handleChangeDate.bind(this, 'date')} />
        </div>
        <div className={style.block}>
          <label>Event end</label>
          <DateTime value={item.date_end} dateFormat='DD. MMM YYYY' timeFormat='HH:mm:ss' onChange={this.handleChangeDate.bind(this, 'date_end')} />
        </div>
        <div className={style.block}>
          <label>GeoJSON feature collection</label>
          <textarea value={item.features} onChange={this.handleChange.bind(this, 'features')} placeholder={JSON.stringify(featureDefault)} />
        </div>
        <div className={style.block}>
          <label>KML Url</label>
          <input type='text' value={item.url} onChange={this.handleChange.bind(this, 'url')} placeholder='KML url' />
          <button type='submit'>Save</button>
          <span onClick={this.handleCancel.bind(this)}>Cancel</span>
        </div>
      </form>
    )
  }

  render () {
    const {maps, error, loading} = this.props
    const {showForm} = this.state
    return (
      <div className={style.container}>
        <Helmet title='Admin'/>
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
            <ul>
              {maps.map((item, i) => {
                return (
                  <li key={i}>
                    <Link to={`/maps/${item._id}`}>{item.title}</Link> {moment(item.date).format('DD. MMM HH:mm')}
                    <button onClick={this.handleEdit.bind(this, item)}>Edit</button>
                    <button onClick={this.handleRemove.bind(this, item._id)}>Remove</button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {showForm && this.renderForm()}
      </div>
    )
  }
}
