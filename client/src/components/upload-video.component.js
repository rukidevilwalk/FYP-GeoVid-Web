import React, { Component } from "react"
import axios from "axios"
import { Progress } from "reactstrap"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import PropTypes from "prop-types";
import { connect } from "react-redux";

class UploadVideo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFile: null,
      loaded: 0,
      errors: {}
    }
  }

  componentDidMount() {
    // If not logged in,  redirect them to login
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }
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

  checkMimeType = event => {
    //getting file object
    let files = event.target.files
    //define message container
    let err = []
    // list allow mime type
    const types = ["video/mp4", "text/plain", "image/gif"]
    // loop access array
    for (let y = 0; y < files.length; y++) {
      // compare file type find doesn't matach
      if (types.every(type => files[y].type !== type)) {
        // create error message and assign to container
        err[y] = files[y].type + " is not a supported format\n"
      }
    }
    for (let z = 0; z < err.length; z++) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(err[z])
      event.target.value = null
    }
    return true
  }
  maxSelectFile = event => {
    let files = event.target.files
    if (files.length > 2) {
      const msg = "Only 2 images can be uploaded at a time"
      event.target.value = null
      toast.warn(msg)
      return false
    }
    return true
  }
  checkFileSize = event => {
    let files = event.target.files
    let size = 2000000
    let err = []
    for (let x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err[x] = files[x].type + " is too large, please pick a smaller file\n"
      }
    }
    for (let z = 0; z < err.length; z++) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(err[z])
      event.target.value = null
    }
    return true
  }
  onChangeHandler = event => {
    let value = event.target.value
    let files = event.target.files
    if (this.maxSelectFile(event)) {
      // if return true allow to setState
      this.setState({
        selectedFile: files,
        loaded: 0,
        fileValue: value
      })
    }
  }

  checkMimeType = event => {
    //getting file object
    let files = event.target.files
    //define message container
    let err = ""
    // list allow mime type
    const types = ["video/mp4"]
    // loop access array
    for (let x = 0; x < files.length; x++) {
      if (types.every(type => files[x].type !== type)) {
        err += files[x].type + " is not a supported format\n"
      }
    }

    if (err !== "") {
      // if message not same old that mean has error
      event.target.value = null // discard selected file
      console.log(err)
      return false
    }
    return true
  }

  onClickHandler = () => {
    const data = new FormData()

    for (let x = 0; x < this.state.selectedFile.length; x++) {
      let len = this.state.selectedFile.length
      if (this.state.selectedFile[x].name.substr(len - 3, len) === ".srt") {
        if (x === 0) data.append("file", this.state.selectedFile[x + 1])
      } else {
        data.append("file", this.state.selectedFile[x])
      }
 
     // data.set("filename",this.props.auth.user.email)
    }
    let config = { headers: { "Content-Type": "multipart/form-data" } }
    axios
      .post("http://localhost:8000/upload"+this.props.auth.user.email, data, config, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          })
        }
        // config: { headers: { 'Content-Type': 'multipart/form-data' } }
      })
      .then(res => {
        // then print response status
        toast.success("upload success")
        //this.props.history.push('/')
      })
      .catch(err => {
        // then print response status
        toast.error("upload fail")
      })
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="offset-md-3 col-md-6">
            <div className="form-group files">
              <label>Upload Your File </label>
              <input
                type="file"
                className="form-control"
                multiple
                onChange={this.onChangeHandler}
              />
            </div>
            <div className="form-group">
              <ToastContainer />
              <Progress max="100" color="success" value={this.state.loaded}>
                {Math.round(this.state.loaded, 2)}%
              </Progress>
            </div>

            <button
              type="button"
              className="btn btn-success btn-block"
              onClick={this.onClickHandler}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    )
  }
}

UploadVideo.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps
)(UploadVideo);
