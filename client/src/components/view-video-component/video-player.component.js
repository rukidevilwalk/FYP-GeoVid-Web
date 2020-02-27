import React, { Fragment, PureComponent } from "react"
import {
  Player,
  ControlBar,
  // ProgressControl 
} from 'video-react'
import DownloadButton from './download-button.component';
export default class VideoPlayer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      video_file: [{ videotitle: null, videourl: null }]
    }

  }

  componentDidMount() {

    this.setState({
      video_file: [{ videotitle: this.props.videoname, videourl: "http://localhost:8000/video/" + this.props.videoname }]
    })
  }

  componentDidUpdate() {
    this.player.subscribeToStateChange(this.handleStateChange.bind(this))

  }

  /*   Video Player Functions */

  handleStateChange(state, prevState) {


    //Update respective map direction vector according to video's current time
    if (parseInt(state.currentTime) > parseInt(prevState.currentTime) || (parseInt(state.currentTime) === 0 && state.hasStarted))
      this.props.directionIndexHandler(this.state.video_file[0].videotitle, parseInt(state.currentTime))

  }

  renderVideoPlayer = () => {
    return (this.state.video_file.map((video, index) => {
      let styles = {
        backgroundColor: this.props.color
      }
      return (
        <div style={styles} className="pl-2 pr-0 mr-0" key={index}>
          <Player
            videoId={"video"}
            preload={"auto"}
            ref={player => {
              this.player = player
            }}
            isActive={true}
            muted={true}
            fluid={false}
            width={"auto"}
            height={250}
            src={video.videourl}
          >
            <ControlBar autoHide={false} className="my-class" ><DownloadButton order={7} /></ControlBar>
          </Player>
        </div>
      )
    })
    )

  }


  render() {
    return (
      <Fragment>
        {this.renderVideoPlayer()}
      </Fragment>

    )
  }
}
