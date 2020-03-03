import React, { Fragment, PureComponent } from "react"
import VideoPlayer from "./video-player.component"
import VideoMap from "./video-map.component"
import { Button } from 'reactstrap'
import PropTypes from "prop-types";
import axios from "axios"
import randomColor from 'randomcolor'
import { connect } from "react-redux";
import {
  EmailShareButton,
  FacebookShareButton,
  LineShareButton,
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  LineIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon
} from "react-share";
import { convertStringToDate, convertSubSearch, } from "../helper"
import Geocode from "react-geocode"

const CancelToken = axios.CancelToken
let source

class ViewVideo extends PureComponent {
  constructor(props) {
    super(props)

    let urlString = '' + this.props.location.pathname + this.props.location.search
    urlString = urlString.substring(7).split('?')
    this.state = {
      mapIsRendered: false,
      latestEndDate: "",
      videolist: [],
      videoInfo: [],
      duration: "",
      earliestStart: '',
      latestEnd: '',
      currentTiming: 0,
      defaultValue: "0",
      videoArr: urlString,
      directionIndex: [],
      colorArr: randomColor({
        count: urlString.length,
        luminosity: "bright"
      }),
      shared: [],
      url: '',
      errors: {},
      bookmarked: []
    }

  }

  refsCollection = {}


  UNSAFE_componentWillReceiveProps(nextProps) {

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  componentDidMount() {
    let urlString = '' + this.props.location.pathname + this.props.location.search
    this.setState({ url: "http://localhost:3000" + urlString })
    urlString = urlString.substring(7).split('?')
    let selectedVideos = []
    let tempArr = []
    urlString.forEach(videotitle => {
      tempArr.push({ videotitle: videotitle.substring(0, 32), directionIndex: 0 })
    })
    this.setState({
      directionIndex: tempArr
    })


    if (source) {
      source.cancel('Operation canceled by the user.')
    }
    source = CancelToken.source()
    axios.get("http://localhost:8000/search/", {
      cancelToken: source.token
    }).then(response => {

      let tempVidDetails = convertSubSearch(response.data)
      tempVidDetails.forEach((data) => {

        let startAddress = ''
        let endAddress = ''
        Geocode.fromLatLng(data[0].lat, data[0].lon).then(
          response => {
            startAddress = response.results[0].formatted_address

            Geocode.fromLatLng(data[data.length - 1].lat, data[data.length - 1].lon).then(
              response => {
                endAddress = response.results[0].formatted_address

                urlString.forEach((filename) => {

                  if (data[0].filename.substring(0, 32) === filename.substring(0, 32)) {
                    let dateFrom = convertStringToDate(data[0].date)
                    let dateTo = convertStringToDate(data[data.length - 1].date)
                    selectedVideos.push({ filename: filename, dateFrom: dateFrom, dateTo: dateTo, startAddress: startAddress, endAddress: endAddress })
                  }
                })
                axios.get("http://localhost:8000/bookmarks" + this.props.auth.user.email).then(response => {
                  this.setState({ bookmarked: response.data })
                  this.setState({ videoInfo: selectedVideos })
                  this.getTimeStamps()
                })
            

              
              })
          })
      })

    }).catch(function (thrown) {
      if (axios.isCancel(thrown)) {
        console.log('Request canceled', thrown.message)
      } else {
        console.log(thrown)
      }
    })

  }

  getTimeStamps = () => {
    //Get the earliest start timestamp and the latest end timestamp for all videos, then get the duratiuon between the two
    let earliestStartDate = ''
    let latestEndDate = ''
    let tempArr = this.state.videoInfo
    Object.keys(tempArr).map(key => {
      let tempStart = (tempArr[key].dateFrom)
      let tempEnd = (tempArr[key].dateTo)

      if (earliestStartDate === "")
        earliestStartDate = tempStart

      if (latestEndDate === "")
        latestEndDate = tempEnd

      if (earliestStartDate !== "" && (tempStart.getTime() < earliestStartDate.getTime()))
        earliestStartDate = tempStart

      if (latestEndDate !== "" && tempEnd.getTime() > latestEndDate.getTime())
        latestEndDate = tempEnd
      return true

    })

    let durationInSeconds = ((latestEndDate) - (earliestStartDate)) / 1000

    let tempTime = new Date(earliestStartDate.valueOf())

    this.setState({
      currentTiming: tempTime,
      duration: durationInSeconds.toString(),
      earliestStart: earliestStartDate,
      latestEnd: latestEndDate
    })

  }

  // Controls all videos
  playAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.play()
    })
  }

  pauseAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.pause()
    })
  }

  muteAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.volume = 0
    })
  }

  unmuteAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.volume = 1
    })
  }

  stopAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.seek(0)
      this.refsCollection[video].player.pause()
    })
  }

  load = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.load()
    })
  }

  // Set the directionIndex of a video based on filename
  directionIndexHandler = (videotitle, newIndex) => {

    let indexFound = this.findIndexOfVideo(videotitle, 1)

    if (indexFound !== -1) {
      let tempArr = [...this.state.directionIndex]
      tempArr[indexFound].directionIndex = newIndex
      this.setState({ directionIndex: tempArr })
    }

  }

  // Set the directionIndex of a video based on filename
  handleAddShare = (videotitle, start) => {

    let indexFound = this.findIndexOfVideo(videotitle, 2)
    let tempArr = []

    if (indexFound !== -1) {

      tempArr = [...this.state.shared]
      tempArr[indexFound].start = start

    } else {

      tempArr = [...this.state.shared]
      tempArr.push({ videotitle: videotitle, start: start })

    }

    let tempUrl = ''

    tempArr.forEach((video, index) => {

      tempUrl = tempUrl + video.videotitle + '&s=' + video.start

      if (tempArr.length - 1 !== index) {
        tempUrl = tempUrl + '?'
      }

    })

    tempUrl = "http://localhost:3000/watch/" + tempUrl
    this.setState({ shared: tempArr })
    this.setState({ url: tempUrl })

  }

  handleRemoveShare = (videotitle) => {

    let indexFound = this.findIndexOfVideo(videotitle, 2)
    let tempArr = []
    let tempUrl = ''

    if (indexFound !== -1) {

      tempArr = [...this.state.shared]

      tempArr = tempArr.filter(function (obj) {
        return obj.videotitle !== videotitle
      })

      if (tempArr.length !== 0) {

        tempArr.forEach((video, index) => {

          tempUrl = tempUrl + video.videotitle + '&s=' + video.start

          if (tempArr.length - 1 !== index) {
            tempUrl = tempUrl + '?'
          }

        })

        tempUrl = "http://localhost:3000/watch/" + tempUrl

      } else {

        tempUrl = "http://localhost:3000" + this.props.location.pathname + this.props.location.search

      }
      this.setState({ shared: tempArr })
      this.setState({ url: tempUrl })

    }

  }

  findIndexOfVideo = (val, type) => {

    let index = -1

    if (type === 1) {

      this.state.directionIndex.find(function (item, i) {
        if (item.videotitle === val) {
          index = i
          return i
        }
      })

    } else if (type === 2) {

      this.state.shared.find(function (item, i) {

        if (item.videotitle === val) {
          index = i
          return i
        }
      })

    } else {
      this.state.bookmarked.find(function (item, i) {

        if (item.filename === val) {
          index = i
          return i
        }
      })
    }

    return index
  }

  mapRenderedHandler = isRendered => {
    this.setState({ mapIsRendered: isRendered })
  }

  handleSeekSlider = (event) => {

    this.setState({ defaultValue: (event.target.value) })
    let tempArr = this.state.videoInfo
    let tempTime = new Date(this.state.earliestStart.valueOf())
    tempTime.setSeconds(tempTime.getSeconds() + parseInt(event.target.value))
    this.setState({ currentTiming: tempTime })


    Object.keys(tempArr).map(key => {

      let tempStart = (tempArr[key].dateFrom)
      let tempEnd = (tempArr[key].dateTo)

      if (parseInt(event.target.value) === this.state.duration) {
        this.refsCollection[tempArr[key].filename].player.seek(this.refsCollection[tempArr[key].filename].player.getState().player.duration)
        this.refsCollection[tempArr[key].filename].player.pause()

      } else if (tempTime.getTime() >= tempStart.getTime() && tempEnd.getTime() >= tempTime.getTime()) {
        let durationInSeconds = (tempTime - tempStart) / 1000
        if (durationInSeconds <= this.refsCollection[tempArr[key].filename].player.getState().player.duration) {
          this.refsCollection[tempArr[key].filename].player.seek(durationInSeconds)
          this.refsCollection[tempArr[key].filename].player.play()
        } else {
          this.refsCollection[tempArr[key].filename].player.seek(this.refsCollection[tempArr[key].filename].player.getState().player.duration - 0.1)
          this.refsCollection[tempArr[key].filename].player.play()
        }

      } else if (tempTime.getTime() >= tempStart.getTime() && tempTime.getTime() >= tempEnd.getTime()) {
        if (this.refsCollection[tempArr[key].filename].player.getState().player.currentTime !== this.refsCollection[tempArr[key].filename].player.getState().player.duration) {
          this.refsCollection[tempArr[key].filename].player.seek(this.refsCollection[tempArr[key].filename].player.getState().player.duration)
          this.refsCollection[tempArr[key].filename].player.pause()
        }

      } else if (tempTime.getTime() <= tempStart.getTime() && tempTime.getTime() <= tempEnd.getTime()) {
        if (this.refsCollection[tempArr[key].filename].player.getState().player.currentTime !== 0) {
          this.refsCollection[tempArr[key].filename].player.seek(0)
          this.refsCollection[tempArr[key].filename].player.pause()
        }

      }

    })

  }

  renderSeekBar = () => {

    return (

      <div>
        <label>Current Timing: {this.state.currentTiming.toString()}</label>
        <input type="range" className="custom-range" id="customRange1" value={this.state.defaultValue} onChange={e => { this.handleSeekSlider(e) }} min="0" max={this.state.duration} />
      </div>)

  }

  renderVideoControls = () => {

    if (this.state.mapIsRendered) {
      return (<div className="col-2">
        <div> <label>Controls </label></div>
        <div className="pb-2  btn-group" role="group">
          <button type="button" className="btn btn-secondary" onClick={this.playAll} >
            Play
      </button>
          <Button className="btn btn-secondary" onClick={this.pauseAll} >
            Pause
      </Button>
          <Button className="btn btn-secondary" onClick={this.stopAll} >
            Stop
      </Button>
        </div>
        <div className="btn-group" role="group">
          <Button className="btn btn-secondary" onClick={this.muteAll} >
            Mute
      </Button>
          <Button className="btn btn-secondary" onClick={this.unmuteAll} >
            Unmute
      </Button>
          <Button className="btn btn-secondary" onClick={this.load} >
            Reload
      </Button>

        </div>
        <div> <label> </label></div>
        {this.renderSeekBar()}
        <div> <label> </label></div>

        {/* <button type="button" className="btn btn-email" onClick={this.handleShare}><i class="fas fa-envelope"></i></button>
        <ShareIcon/> */}

        <div className="Demo__some-network">
          <EmailShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <EmailIcon size={32} round />
          </EmailShareButton>


          <TwitterShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <FacebookShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <LineShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <LineIcon size={32} round />
          </LineShareButton>


          <RedditShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <RedditIcon size={32} round />
          </RedditShareButton>

          <TelegramShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <TelegramIcon size={32} round />
          </TelegramShareButton>



          <WhatsappShareButton
            url={this.state.url}
            title={'URL: '}
            className="Demo__some-network__share-button"
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>

      </div>)
    }

  }

  render() {

    return (
      <Fragment>

        <div className="row col-11 mx-auto">

          <div className="ml-0 pl-0 col-10 justify-content-left align-items-left embed-responsive embed-responsive-21by9">
            <VideoMap
              videos={this.state.videoArr}
              colorArr={this.state.colorArr}
              directionIndex={this.state.directionIndex}
              mapRenderedHandler={this.mapRenderedHandler}
              findIndexOfVideo={this.findIndexOfVideo}
              mapIsRendered={(this.state.mapIsRendered)}
            />

          </div>
          {this.renderVideoControls()}
        </div>

        <div className="row col-11 pt-2 mx-auto justify-content-left align-items-left">
          {this.state.videoInfo.map((video, index) => {
            let isBookmarked = this.findIndexOfVideo(video.filename, 3)
            return this.state.mapIsRendered && <div className="pr-2 pl-0 pb-1 col-5 align-items-left" key={index}>

              <VideoPlayer
                key={index}
                dateTo={video.dateTo}
                dateFrom={video.dateFrom}
                startAddress={video.startAddress}
                endAddress={video.endAddress}
                videoname={(video.filename)}
                color={this.state.colorArr[index]}
                handleAddShare={this.handleAddShare}
                isBookmarked={isBookmarked !== -1}
                email={this.props.auth.user.email}
                handleRemoveShare={this.handleRemoveShare}
                directionIndexHandler={this.directionIndexHandler}
                ref={instance => this.refsCollection[video.filename] = instance}
              />
            </div>
          })}
        </div>

      </Fragment>
    )
  }
}
ViewVideo.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps
)(ViewVideo);