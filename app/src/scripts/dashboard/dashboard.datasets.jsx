// dependencies ------------------------------------------------------------------------------

import React from 'react'
import Reflux from 'reflux'
import Actions from './dashboard.datasets.actions.js'
import DatasetsStore from './dashboard.datasets.store.js'
import { State, Link } from 'react-router'
import moment from 'moment'
import { PanelGroup } from 'react-bootstrap'
import Paginator from '../common/partials/paginator.jsx'
import Spinner from '../common/partials/spinner.jsx'
import Statuses from '../dataset/dataset.statuses.jsx'
import Filters from './dashboard.filters.jsx'
import Sort from './dashboard.sort.jsx'
import Summary from '../dataset/dataset.summary.jsx'

// component setup ---------------------------------------------------------------------------

let Datasets = React.createClass({
  mixins: [State, Reflux.connect(DatasetsStore)],

  // life cycle events -------------------------------------------------------------------------

  componentWillUnmount() {
    Actions.update({ datasets: [] })
  },

  componentDidMount() {
    let isPublic = this.getPath().indexOf('dashboard') === -1
    let isAdmin = this.getPath().indexOf('admin') !== -1
    Actions.update({ isPublic, isAdmin })
    Actions.getDatasets(isPublic, isAdmin)
  },

  componentWillReceiveProps() {
    let isPublic = this.getPath().indexOf('dashboard') === -1
    let isAdmin = this.getPath().indexOf('admin') !== -1
    Actions.update({ isPublic, isAdmin })
    Actions.getDatasets(isPublic, isAdmin)
  },

  render() {
    let datasets = this.state.datasets
    let visibleDatasets = this.state.visibleDatasets
    let isPublic = this.state.isPublic
    let isAdmin = this.state.isAdmin
    let results
    if (datasets.length === 0 && isPublic) {
      let noDatasets = 'There are no public datasets.'
      results = <p className="no-datasets">{noDatasets}</p>
    } else if (datasets.length === 0) {
      let noDatasets = "You don't have any datasets."
      results = <p className="no-datasets">{noDatasets}</p>
    } else if (visibleDatasets.length === 0) {
      let noDatasets =
        "You don't have any datasets that match the selected filters."
      results = <p className="no-datasets">{noDatasets}</p>
    } else {
      var pagesTotal = Math.ceil(
        visibleDatasets.length / this.state.resultsPerPage,
      )
      let paginatedResults = this._paginate(
        visibleDatasets,
        this.state.resultsPerPage,
        this.state.page,
      )

      // map results
      results = this._datasets(paginatedResults, isPublic)
    }

    let title
    if (isAdmin) {
      title = 'All Datasets'
    } else if (isPublic) {
      title = 'Public Datasets'
    } else {
      title = 'My Datasets'
    }

    let datasetsDash = (
      <div>
        <div className="dashboard-dataset-teasers datasets datasets-private">
          <div className="header-filter-sort clearfix">
            <div className="header-wrap clearfix">
              <h2>{title}</h2>
            </div>
            <div className="filters-sort-wrap clearfix">
              <Sort
                options={this.state.sortOptions}
                sort={this.state.sort}
                sortFunc={Actions.sort}
              />
              {!isPublic ? <Filters filters={this.state.filters} /> : null}
            </div>
          </div>
          <PanelGroup>
            {this.state.loading ? <Spinner active={true} /> : results}
          </PanelGroup>
        </div>
        <div className="pager-wrapper">
          <Paginator
            page={this.state.page}
            pagesTotal={pagesTotal}
            pageRangeDisplayed={5}
            onPageSelect={this._onPageSelect}
          />
        </div>
      </div>
    )
    let datasetsDashPublic = (
      <div className="fade-in clearfix">{datasetsDash}</div>
    )

    return <span>{!isPublic ? datasetsDash : datasetsDashPublic}</span>
  },

  // template methods --------------------------------------------------------------------------

  _datasets(paginatedResults, isPublic) {
    return paginatedResults.map(dataset => {
      let user = dataset.user
      let fullname = user ? user.firstname + ' ' + user.lastname : ''
      let dateAdded = moment(dataset.created).format('L')
      let timeago = moment(dataset.created).fromNow(true)
      let statusContainer = (
        <div className="status-container">
          <Statuses dataset={dataset} minimal={true} />
        </div>
      )
      let linkProps = this._linkTo(dataset)
      return (
        <div className="fade-in  panel panel-default" key={dataset._id}>
          <div className="panel-heading">
            <div className="header clearfix">
              <Link {...linkProps}>
                <h4 className="dataset-name">{dataset.label}</h4>
                <div className="meta-container">
                  <p className="date">
                    uploaded {user ? 'by ' : ''}
                    <span className="name">{fullname}</span> on{' '}
                    <span className="time-ago">
                      {dateAdded} - {timeago} ago
                    </span>
                  </p>
                </div>
              </Link>
              {!isPublic ? statusContainer : null}
            </div>
            <Summary summary={dataset.summary} minimal={true} />
          </div>
        </div>
      )
    })
  },

  _linkTo(dataset) {
    const isSnapshot = dataset.hasOwnProperty('original')
    if (isSnapshot) {
      return {
        to: 'snapshot',
        params: { datasetId: dataset.linkOriginal, snapshotId: dataset.linkID },
      }
    } else {
      return {
        to: 'dataset',
        params: { datasetId: dataset.linkID },
      }
    }
  },

  // custom methods ----------------------------------------------------------------------------

  _paginate(data, perPage, page) {
    if (data.length < 1) return null
    page ? page : this.state.page
    let start = page * perPage
    let end = start + perPage
    var retArr = data.slice(start, end)
    return retArr
  },

  _onPageSelect(page) {
    let pageNumber = Number(page)
    this.setState({ page: pageNumber })
  },

  _sort(value, direction) {
    Actions.sort(value, direction)
  },
})

export default Datasets
