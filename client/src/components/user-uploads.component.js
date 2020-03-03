import React, { Fragment, PureComponent } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios"
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  Player,
  ControlBar
} from 'video-react'
import { convertSubSearch, convertStringToDate } from "./helper"
import Geocode from "react-geocode"

const CancelToken = axios.CancelToken;
let source;

const VideoList = props => (
  <div className="row col-11 mx-auto justify-content-left align-items-left">

    <div className="col-6" key={props.index + 1}>
      <Player
        videoId={"video"}
        preload={"metadata"}
        isActive={true}
        muted={true}
        fluid={false}
        width={"auto"}
        height={250}
        src={props.video.videourl}
      >
        <ControlBar autoHide={false} className="my-class" />
      </Player>
    </div>

    <div className="col-3" key={props.index}>
      <p><strong>Details</strong></p>
      <p>Start Date: {'' + props.video.startDate}</p>
      <p>End Date: {'' + props.video.endDate}</p>
      <p>Start Address: {props.video.startAddress}</p>
      <p>End Address: {props.video.endAddress}</p>
    </div>

    <div className="col-1 justify-content-center align-self-center" key={props.index + 3}>
    <form action="#">
    <p>
    <label>
        <input type="checkbox" name={props.name}  onChange={props.handleChecked} />
        <span></span>
      </label>
      </p>
      </form>
    </div>

  </div>
)

class UserUploads extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
      videolist: [],
      video_file: [],
      subtitle_file: [],
      selected_videos:[],
      url:''
    }
    this.handleChecked = this.handleChecked.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!nextProps.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  componentDidMount() {

    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    axios
      .get("http://localhost:8000/uploads" + this.props.auth.user.email)
      .then(res => {
        let tempArr = []
        let subtitleStr = ""

        res.data.forEach(data => {
          subtitleStr += (data.filename + ',')
        })

        subtitleStr = subtitleStr.substring(0, subtitleStr.length - 1)
        if (source) {
          source.cancel('Operation canceled by the user.');
        }

        source = CancelToken.source();

        axios.get("http://localhost:8000/subtitle/" + subtitleStr, {
          cancelToken: source.token
        })
          .then(response => {

            this.setState({ subtitle_file: convertSubSearch(response.data) });

            res.data.forEach(data => {
              let startAddress = ''
              let endAddress = ''

              convertSubSearch(response.data).forEach(element => {

                if (data.filename === element[0].filename) {

                  Geocode.fromLatLng(element[0].lat, element[0].lon).then(
                    response => {
                      startAddress = response.results[0].formatted_address

                      Geocode.fromLatLng(element[element.length - 1].lat, element[element.length - 1].lon).then(
                        response => {
                          endAddress = response.results[0].formatted_address

                          tempArr.push({ videotitle: data.filename, videourl: "http://localhost:8000/video/" + data.filename, startDate: convertStringToDate(element[0].date), endDate: convertStringToDate(element[element.length - 1].date), startAddress: startAddress, endAddress: endAddress })

                          if (tempArr.length === res.data.length) {
                            this.setState({
                              video_file: tempArr,
                            })
                          }

                        })

                    })

                }
              })

            })

          }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {
              console.log('Request canceled', thrown.message);
            } else {
              console.log(thrown);
            }
          })
        // toast.success("upload success")
      }).catch(err => {
        // then print response status
        toast.error("upload fail")
      })
  }

  renderRedirect = () => {

    if (this.state.redirect) {
      return <Redirect push to={{
        pathname: this.state.url,
      }} />
    }
  }

  handleChecked = (e) => {
    const item = e.target.name;

let indexFound = this.findIndexOfVideo(item)
    let tempArr = []
    let tempUrl = ''

    if (indexFound !== -1) {

      tempArr = [...this.state.selected_videos]

      tempArr = tempArr.filter(function (obj) {
        return obj.videotitle !== item
      })

  


    } else {
      tempArr = [...this.state.selected_videos]
      tempArr.push({ videotitle: item})

    }

    if (tempArr.length !== 0) {

      tempArr.forEach((video, index) => {

        tempUrl = tempUrl + video.videotitle

        if (tempArr.length - 1 !== index) {
          tempUrl = tempUrl + '?'
        }

      })

      tempUrl = "/watch/" + tempUrl

    } else {
tempUrl = ''
    }
    this.setState({ selected_videos: tempArr })
    this.setState({ url: tempUrl })
  }

  findIndexOfVideo = (val) => {

    let index = -1

      this.state.selected_videos.find(function (item, i) {
        if (item.videotitle === val) {
          index = i
          return i
        }
      })

    return index
  }

  videoList = () => {

    return this.state.video_file.map((video, i) => {
      return <VideoList handleChecked={this.handleChecked} name={video.videotitle} index={i} video={video}  key={i} />;
    });
  }

  checkSelectedVideos = () => {
    if (this.state.url !== '') {
      this.setState({ redirect: true })
    }
  }

  render() {
    return (
      <Fragment>
        <div className="row col-11 mx-auto">
        <div className="col-8 py-auto my-auto">
        <h3>Uploads</h3>
        </div>
        <div className="col-2  py-auto my-auto">
          {this.renderRedirect()}
          <button type="button" className="btn btn-success" onClick={this.checkSelectedVideos}>Watch</button>
        </div>
        </div>
        {this.videoList()}
  
      </Fragment>

    )
  }
}
UserUploads.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps
)(UserUploads);