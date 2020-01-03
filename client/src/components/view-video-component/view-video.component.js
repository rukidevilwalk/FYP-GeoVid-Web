import React, { Fragment, PureComponent } from "react";
import VideoPlayer from "./video-player.component";
import VideoMap from "./video-map.component";
import { Button } from 'reactstrap';
import randomColor from 'randomcolor'
import { convertStringToDate } from "../helper"

export default class ViewVideo extends PureComponent {
  constructor(props) {
    super(props);

    let urlString = this.props.match.params.id.split('?')

    let tempArr = []
    urlString.forEach(videotitle => {
      tempArr.push({ videotitle: videotitle, directionIndex: 0 })
    });

    this.state = {
      mapIsRendered: false,
      earliestStartDate: "",
      latestEndDate: "",
      duration: "",
      videoArr: urlString,
      directionIndex: tempArr,
      colorArr: randomColor({
        count: urlString.length,
        luminosity: "bright"
      })
    }

  }

  refsCollection = {};

  // componentDidMount() {
  //   let earliestStartDate = ""
  //   let latestEndDate = ""
  //   this.props.location.state.videoArr.forEach(videotitle => {
  //     let tempStart = convertStringToDate(videotitle.startDate)
  //     let tempEnd = convertStringToDate(videotitle.endDate)

  //     if (earliestStartDate === "")
  //       earliestStartDate = videotitle.startDate

  //     if (latestEndDate === "")
  //       latestEndDate = videotitle.endDate

  //     if (earliestStartDate !== "" && convertStringToDate(earliestStartDate) > tempStart)
  //       earliestStartDate = videotitle.startDate

  //     if (latestEndDate !== "" && convertStringToDate(latestEndDate) < tempEnd)
  //       latestEndDate = videotitle.endDate

  //   })
  //   let durationInSeconds = (convertStringToDate(latestEndDate) - convertStringToDate(earliestStartDate)) / 1000
  //   this.setState({ duration: durationInSeconds.toString() })
  //   this.setState({ earliestStartDate: earliestStartDate })
  //   this.setState({ latestEndDate: latestEndDate })

  // }

  // Controls all videos
  playAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.play();
    });
  }

  pauseAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.pause();
    });
  }

  muteAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.volume = 0;
    });
  }

  unmuteAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.volume = 1;
    });
  }

  stopAll = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.seek(0);
      this.refsCollection[video].player.pause();
    });
  }
  load = () => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.load();

    });
  }

  // Set the directionIndex of a video based on filename
  directionIndexHandler = (videotitle, newIndex) => {

    let indexFound = this.findIndexOfVideo(videotitle)

    if (indexFound !== -1) {
      let tempArr = [...this.state.directionIndex]
      tempArr[indexFound].directionIndex = newIndex
      this.setState({ directionIndex: tempArr });
    }

  };

  findIndexOfVideo = (val) => {
    let index = -1;
    let filteredObj = (this.state.directionIndex).find(function (item, i) {
      if (item.videotitle === val) {
        index = i;
        return i;
      }
    })
    return index
  }

  mapRenderedHandler = isRendered => {
    this.setState({ mapIsRendered: isRendered });
  };

  handleSeekSlider = (event) => {
    this.state.videoArr.forEach(video => {
      this.refsCollection[video].player.seek(parseInt(event.target.value));
    });
  }
  renderSeekBar = () => {
    return (
      <div>
        <label>Start: {this.state.earliestStartDate} </label>
        <label>End: {this.state.latestEndDate} </label>
        <label>Duration (in seconds): {this.state.duration}</label>
        <input type="range" className="custom-range" id="customRange1" onChange={e => { this.handleSeekSlider(e) }} min="0" max={this.state.duration} />
      </div>)

  }

  renderVideoControls = () => {

    if (this.state.mapIsRendered) {
      return (<div className="col-2">
        <label>Controls </label>
        <div className="pb-1  btn-group" role="group">
          <Button className="btn btn-secondary" onClick={this.playAll} >
            Play All
      </Button>
          <Button className="btn btn-secondary" onClick={this.pauseAll} >
            Pause All
      </Button>
          <Button className="btn btn-secondary" onClick={this.stopAll} >
            Stop All
      </Button>
        </div>
        <div className="btn-group" role="group">
          <Button className="btn btn-secondary" onClick={this.muteAll} >
            Mute All
      </Button>
          <Button className="btn btn-secondary" onClick={this.unmuteAll} >
            Unmute All
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

            let styles = {
              backgroundColor: this.state.colorArr[index]
            };
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
