import React, { Fragment, PureComponent } from "react"
import {
  Player,
  ControlBar,
  // ProgressControl 
} from 'video-react'
import AddButton from './add-button.component';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';


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
      currentTime: 0,
      duration: 0,
      value: [0, 0],
      checked: false
    }
    this.handleAdd = this.handleAdd.bind(this);
  }

  componentDidMount() {

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
      this.props.directionIndexHandler(this.state.video_file[0].videotitle, parseInt(state.currentTime))

  }

  handleAdd = (d, ct) => {

    this.setState({
      open: true,
      currentTime: ct,
      duration: d,
      value: [ct, d]
    })
  }

  handleClose = () => {
    this.setState({ open: false })
  };

  handleChange = (event, newValue) => {
    this.setState({ value: newValue })
  };

  handleChecked = event => {
    console.log(event.target.checked)
    this.setState({ checked: event.target.checked })
  }

  renderDialog = () => {
    return (
      <Dialog value='dialog' aria-labelledby="customized-dialog-title" open={this.state.open}>
        <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
          Video Details
</DialogTitle>
        <DialogContent dividers>


          <Typography gutterBottom>
            Current Time: {this.state.value[0, 0]}

          </Typography>
          <Typography gutterBottom>

            Duration: {this.state.value[0, 1]}
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
          <Typography gutterBottom>
            Bookmark Video
</Typography>
          <Checkbox
            checked={this.state.checked}
            onChange={event => this.handleChecked(event)}
            value="primary"
            inputProps={{ 'aria-label': 'Add Video' }}
          />
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
            src={video.videourl}
          >
            <ControlBar handleAdd={this.handleAdd} autoHide={false} className="my-class" ><AddButton order={7} /></ControlBar>
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
        {this.renderVideoPlayer()}
      </Fragment>

    )
  }
}
