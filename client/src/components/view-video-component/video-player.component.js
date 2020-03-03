import React, { Fragment, PureComponent } from "react"
import {
  Player,
  ControlBar,
  // ProgressControl 
} from 'video-react'
import axios from "axios"
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AddButton from './add-button.component';
import InfoButton from './info-button.component';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { Form } from 'react-bootstrap';
import $ from 'jquery';
window.$ = $;

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    width: 400 + theme.spacing(3) * 2
  },
  margin: {
    height: theme.spacing(3),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});


const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});


const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

function valuetext(value) {
  return value;
}


export default class VideoPlayer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      video_file: [{ videotitle: null, videourl: null }],
      open: false,
      currentTime: '00:00:00',
      start: '00:00:00',
      duration: '00:00:00',
      value: 0,
      share_checked: false,
      bookmark_checked: this.props.isBookmarked,
      startTime: 0,
      showInfo: false,
      loggedIn: false
    }
    this.handleAdd = this.handleAdd.bind(this);

  }

  componentDidMount() {

    if (this.props.videoname.charAt(32) === '&') {
      let tempStr = this.props.videoname.substring(33)
      let startTime = tempStr.substring(2)
      this.setState({ startTime: parseInt(startTime) })
    }

    this.setState({
      video_file: [{ videotitle: this.props.videoname, videourl: "http://localhost:8000/video/" + this.props.videoname }],
    })

  }

  componentDidUpdate() {
    this.player.subscribeToStateChange(this.handleStateChange.bind(this))

  }

  /*   Video Player Functions */

  handleStateChange(state, prevState) {


    //Update respective map direction vector according to video's current time
    if (parseInt(state.currentTime) > parseInt(prevState.currentTime) || (parseInt(state.currentTime) === 0 && state.hasStarted))
      this.props.directionIndexHandler(this.state.video_file[0].videotitle.substring(0, 32), parseInt(state.currentTime))

  }

  handleInfo = () => {
    $('#videoInfoModal').modal({
      show: true
    })
  }

  handleAdd = (d, ct) => {

    if (this.state.duration === '00:00:00') {
      this.setState({
        duration: d
      })
    }

    this.setState({
      open: true
    })

  }

  handleClose = () => {
    this.setState({ open: false })
  };

  handleChange = (event, newValue) => {

    var measuredStart = new Date(null);
    measuredStart.setSeconds(newValue); // specify value of SECONDS
    var MSHStart = measuredStart.toISOString().substr(11, 8);

    this.setState({
      value: newValue,
      start: MSHStart
    })
  };

  handleShareChecked = event => {
    if (!this.state.share_checked) {
      this.props.handleAddShare(this.props.videoname, this.state.value)

    } else {
      this.props.handleRemoveShare(this.props.videoname)
    }
    this.setState({ share_checked: event.target.checked })


  }


  handleBookmarkChecked = event => {

    //checked
    if (!this.state.bookmark_checked) {

      axios
        .post("http://localhost:8000/bookmarks", {
          email: this.props.email,
          filename: this.props.videoname
        })
        .then(res => {
          // then print response status
        })
        .catch(err => {
          // then print response status

        })

    } else {
      axios
        .delete("http://localhost:8000/bookmarks", {
          params:
          {
            email: this.props.email,
            filename: this.props.videoname
          }
        })
        .then(res => {
          // then print response status

        })
        .catch(err => {
          // then print response status

        })
    }

    this.setState({ bookmark_checked: event.target.checked })

  }

  renderDialog = () => {
    return (
      <Dialog value='dialog' aria-labelledby="customized-dialog-title" open={this.state.open}>
        <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
          Video Details
          </DialogTitle>
        <DialogContent dividers>

          <Typography gutterBottom>
            Start Time: {this.state.start}
          </Typography>

          <Typography gutterBottom>
            <Slider
              value={this.state.value}
              min={0}
              max={this.state.duration}
              onChange={this.handleChange}
              valueLabelDisplay="off"
              aria-labelledby="range-slider"
              getAriaValueText={valuetext}
            />
          </Typography>
        </DialogContent>

        <DialogActions>
          <Form>
            <Form.Check
              type="switch"
              id="bookmark-switch"
              label="Bookmark"
              checked={this.state.bookmark_checked}
              onChange={this.handleBookmarkChecked}
            />

          </Form>

          <Form>
            <Form.Check
              type="switch"
              id="share-switch"
              label="Share"
              checked={this.state.share_checked}
              onChange={this.handleShareChecked}
            />

          </Form>

        </DialogActions>
      </Dialog>)
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
            startTime={this.state.startTime}
            src={video.videourl}
          >
            <ControlBar handleInfo={this.handleInfo} handleAdd={this.handleAdd} autoHide={false} className="my-class" >
              <AddButton order={8} />
              <InfoButton order={7} />
            </ControlBar>
          </Player>
          {this.renderDialog()}
        </div>
      )
    })
    )

  }


  render() {
    return (
      <Fragment>


        <div className="modal fade" tabIndex="-1" id="videoInfoModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Video Details</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p ><strong>Start:</strong></p>
                <p>{this.props.dateFrom.toString()}</p>
                <p> {this.props.startAddress}</p>

                <p><strong>End:</strong></p>
                <p> {this.props.dateTo.toString()}</p>
                <p> {this.props.endAddress}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
        {this.renderVideoPlayer()}
      </Fragment>

    )
  }
}
