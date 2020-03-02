import React, { Fragment, PureComponent } from "react";
import { Redirect } from "react-router-dom";

const Checkbox = props => <input type="checkbox" {...props} />

const VideoList = props => (
  <table className="table-sm">
    <tbody>
      <tr>

        <td>
          <Checkbox
            checked={props.checked}
            onChange={props.handleCheckboxChange}
            value={props.index}

          />
        </td>

        <td>
          <table className="table-sm">
            <tbody>
              <tr>
                <th scope="row">Address:</th>
                <td> {props.video.address}</td>
              </tr>
              <tr>
                <th scope="row">Start Date:</th>
                <td> {props.video.startDate}</td>
              </tr>
              <tr>
                <th scope="row">End Date:</th>
                <td> {props.video.endDate}</td>
              </tr>
              <tr>
                <th scope="row">Distance Away:</th>
                <td> {props.video.distance}</td>
              </tr>
            </tbody>
          </table>
        </td>

      </tr>
    </tbody>
  </table>

)

export default class SearchVideo extends PureComponent {
  constructor(props) {
    super(props);
    let tempArr = []
    this.props.location.state.videoArr.forEach(video => {
      tempArr.push({ filename: video[0], address: video[1], startDate: video[2], endDate: video[3], distance: video[4] })
    });


    this.state = {
      redirect: false,
      videolist: tempArr,
      checked: false,
      selectedVideos: []
    }

  }

  renderRedirect = () => {

    if (this.state.redirect) {
      return <Redirect to={{
        pathname: '/viewvideo',
        state: { videoArr: this.state.selectedVideos }
      }} />
    }
  }

  videoList() {
    let handleCheckboxChange = this.handleCheckboxChange
    return this.state.videolist.map(function (video, i) {
      return <VideoList handleCheckboxChange={handleCheckboxChange.bind(this)} index={i} video={video} key={i} />;
    });
  }

  handleCheckboxChange = event => {
    this.setState({ checked: event.target.checked });

    let selectedVideo = this.state.videolist[event.target.value]
    let tempArr = this.state.selectedVideos;

    //console.log(this.state.videolist[event.target.value])

    if (event.target.checked) {
      if (!tempArr.some(row => row.filename.includes(selectedVideo.filename)))
        tempArr.push({ filename: selectedVideo.filename, startDate: selectedVideo.startDate, endDate: selectedVideo.endDate })
    } else {
      tempArr = tempArr.filter(a => a.filename !== selectedVideo.filename)
    }
    this.setState({ selectedVideos: tempArr })

  }
  checkSelectedVideos = () => {
    if (this.state.selectedVideos.length > 0) {
      this.setState({ redirect: true })
    }
  }

  render() {
    return (
      <Fragment>

        <div className="mx-auto col-xl-10 justify-content-left align-items-left">
          <h3>Video List</h3>
          {this.videoList()}


          <div className="viewVideos">
            {this.renderRedirect()}
            <button type="button" className="btn btn-success" onClick={this.checkSelectedVideos}>Search</button>
          </div>
        </div>

      </Fragment>

    )
  }
}
