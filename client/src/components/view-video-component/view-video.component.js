import React, { Fragment, PureComponent } from "react"
import VideoPlayer from "./video-player.component"
import VideoMap from "./video-map.component"
import { Button } from 'reactstrap'
import randomColor from 'randomcolor'

export default class ViewVideo extends PureComponent {
  constructor(props) {
    super(props)

    let urlString = this.props.match.params.id.split('?')

    let tempArr = []
    urlString.forEach(videotitle => {
      tempArr.push({ videotitle: videotitle, directionIndex: 0 })
    })

    this.state = {
      mapIsRendered: false,
      earliestStartDate: "",
      latestEndDate: "",
      duration: "",
      currentTiming: 0,
      videoArr: urlString,
      directionIndex: tempArr,
      colorArr: randomColor({
        count: urlString.length,
        luminosity: "bright"
      })
    }

  }

  refsCollection = {}

  componentDidMount() {
    this.setState({ currentTiming: this.props.location.state.earliestStart })
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
    let tempArr = this.props.location.state.videoInfo
    let tempTime = new Date(this.props.location.state.earliestStart.valueOf())
    tempTime.setSeconds(tempTime.getSeconds() + parseInt(event.target.value))
    this.setState({ currentTiming: tempTime })
    Object.keys(tempArr).map(key => {
      //console.log(tempArr[key])
      let tempStart = (tempArr[key].dateFrom)
      let tempEnd = (tempArr[key].dateTo)

      if (tempTime.getTime() >= tempStart.getTime() && tempEnd.getTime() >= tempTime.getTime()) {
        let durationInSeconds = ((tempTime) - (tempStart)) / 1000
        // console.log(this.props.location.state.earliestStart)
        // console.log('seeking to:' + tempTime)
        // console.log(tempEnd)
        // console.log(durationInSeconds)
        this.refsCollection[tempArr[key].filename].player.seek(durationInSeconds)
        this.refsCollection[tempArr[key].filename].player.play()

      } else if (tempTime.getTime() >= tempStart.getTime() && tempTime.getTime() >= tempEnd.getTime()) {

        if (this.refsCollection[tempArr[key].filename].player.currentTime !== this.refsCollection[tempArr[key].filename].player.duration)
          this.refsCollection[tempArr[key].filename].player.seek(this.refsCollection[tempArr[key].filename].player.duration)
        this.refsCollection[tempArr[key].filename].player.pause()

      } else if (tempTime.getTime() <= tempStart.getTime() && tempTime.getTime() <= tempEnd.getTime()) {

        if (this.refsCollection[tempArr[key].filename].player.currentTime !== 0) {
          this.refsCollection[tempArr[key].filename].player.seek(0)
          this.refsCollection[tempArr[key].filename].player.pause()
        }

      }






    })

    // this.state.videoArr.forEach(video => {
    //   this.refsCollection[video].player.seek(parseInt(event.target.value))
    // })

    // console.log(this.props.location.state.videoInfo)
  }

  renderSeekBar = () => {

    return (
      <div>
        <label>Current Timing: {this.state.currentTiming.toString()}</label>


        <input type="range" className="custom-range" id="customRange1" onChange={e => { this.handleSeekSlider(e) }} min="0" max={this.props.location.state.duration} />
      </div>)

  }

  renderVideoControls = () => {

    if (this.state.mapIsRendered) {
      return (<div className="col-2">
        <label>Controls </label>
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
        {this.renderSeekBar()}


      </div>)
    }

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
