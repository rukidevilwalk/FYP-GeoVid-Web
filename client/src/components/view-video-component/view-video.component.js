import React, { Fragment, PureComponent } from "react"
import VideoPlayer from "./video-player.component"
import VideoMap from "./video-map.component"
import { Button } from 'reactstrap'
import axios from "axios"
import randomColor from 'randomcolor'
import ShareIcon from '@material-ui/icons/Share';
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
import { convertStringToDate, createPath, convertSubSearch, convertSub } from "../helper"

const CancelToken = axios.CancelToken
let source

export default class ViewVideo extends PureComponent {
  constructor(props) {
    super(props)

    let urlString = this.props.match.params.id.split('?')
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
      })
    }

  }

  refsCollection = {}


  componentDidMount() {

    console.log('videoplayer: ' + this.props.match.params.id)

    let urlString = this.props.match.params.id.split('?')
    let selectedVideos = []
    let tempArr = []
    urlString.forEach(videotitle => {
      tempArr.push({ videotitle: videotitle, directionIndex: 0 })
    })
    this.setState({ directionIndex: tempArr })

    if (source) {
      source.cancel('Operation canceled by the user.')
    }
    source = CancelToken.source()
    axios.get("http://localhost:8000/search/", {
      cancelToken: source.token
    }).then(response => {

      let tempVidDetails = convertSubSearch(response.data)
      tempVidDetails.forEach((data) => {

        urlString.forEach((filename) => {
          if (data[0].filename == filename) {
            let dateFrom = convertStringToDate(data[0].date)
            let dateTo = convertStringToDate(data[data.length - 1].date)
            selectedVideos.push({ filename: filename, dateFrom: dateFrom, dateTo: dateTo })
          }
        })
        this.setState({ videoInfo: selectedVideos })
        this.getTimeStamps()


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

    let indexFound = this.findIndexOfVideo(videotitle)

    if (indexFound !== -1) {
      let tempArr = [...this.state.directionIndex]
      tempArr[indexFound].directionIndex = newIndex
      this.setState({ directionIndex: tempArr })
    }

  }

  findIndexOfVideo = (val) => {
    let index = -1
    this.state.directionIndex.find(function (item, i) {
      if (item.videotitle === val) {
        index = i
        return i
      }
    })
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

      if (parseInt(event.target.value) == this.state.duration) {

        this.refsCollection[tempArr[key].filename].player.seek(this.refsCollection[tempArr[key].filename].player.getState().player.duration)
        this.refsCollection[tempArr[key].filename].player.pause()

      } else if (tempTime.getTime() >= tempStart.getTime() && tempEnd.getTime() >= tempTime.getTime()) {

        let durationInSeconds = ((tempTime) - (tempStart)) / 1000
        this.refsCollection[tempArr[key].filename].player.seek(durationInSeconds)
        this.refsCollection[tempArr[key].filename].player.play()

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

    // this.state.videoArr.forEach(video => {
    //   this.refsCollection[video].player.seek(parseInt(event.target.value))
    // })
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
            Load
      </Button>

        </div>
        <div> <label> </label></div>
        {this.renderSeekBar()}
        <div> <label> </label></div>

        {/* <button type="button" className="btn btn-email" onClick={this.handleShare}><i class="fas fa-envelope"></i></button>
        <ShareIcon/> */}

        <div className="Demo__some-network">
          <EmailShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <EmailIcon size={32} round />
          </EmailShareButton>


          <TwitterShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <FacebookShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <LineShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <LineIcon size={32} round />
          </LineShareButton>


          <RedditShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <RedditIcon size={32} round />
          </RedditShareButton>

          <TelegramShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <TelegramIcon size={32} round />
          </TelegramShareButton>



          <WhatsappShareButton
            url={"http://localhost:8000/watch/asdsadasdsadas"}
            title={'Details of selected videos'}
            className="Demo__some-network__share-button"
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>

      </div>)
    }

  }

  handleShare = () => {
    console.log('hi')

  }

  render() {

    return (
      <Fragment>

        <div className="row col-11 mx-auto">

          <div className="ml-0 pl-0 col-9 justify-content-left align-items-left embed-responsive embed-responsive-21by9">
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
          {this.state.videoArr.map((video, index) => {

            return this.state.mapIsRendered && <div className="pr-2 pl-0 pb-1 col-5 align-items-left" key={index}>
              <VideoPlayer
                key={index}
                videoname={(video)}
                color={this.state.colorArr[index]}
                directionIndexHandler={this.directionIndexHandler}
                ref={instance => this.refsCollection[video] = instance}
              />
            </div>
          })}
        </div>

      </Fragment>
    )
  }
}
