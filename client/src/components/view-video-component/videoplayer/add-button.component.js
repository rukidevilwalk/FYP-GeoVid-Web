import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';


const propTypes = {
  player: PropTypes.object,
  className: PropTypes.string
};


export default class AddButton extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      open: false
    }
  }

  handleClick(e) {

    e.preventDefault();

    if (e.target.getAttribute('value') === 'addbutton') {
      this.props.handleAdd(this.props.player.duration, this.props.player.currentTime)
    } else {
      this.setState({ open: false })
    }

  }



  render() {
    const { player, className } = this.props;
    const { currentSrc } = player;

    return (

      <a
        ref={c => {
          this.button = c;
        }}
        className={classNames(className, {
          'video-react-control': true,
          'video-react-button': true
        })}
        href={currentSrc}
        value='addbutton'
        style={{
          backgroundImage:
            'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAALBJREFUKM+NksENgzAQBCkBCRt6iEgPLgJEG3xGQCsoQvQWSBHOw3k4BhuZBO3rdCPtafcSkv8KR0nDwECDiEMFM2/MV5qJ/AjdeW2A00rpQ0UEMRgW5A7N3qKl9aaHg6R3i0GhvEkjLNQEFiFkqC00bEYKRUqKQm2m/RWou2JXWUigfxyeuQim0wjGPaecNRrm03boailZIsjtWLDk4d2mGfdPCF9FUNPTUZGd/9OJPjQeL7UxxHrMAAAAAElFTkSuQmCC)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
        tabIndex="0"
        onClick={e => this.handleClick(e)}
      >

      </a>

    )
  }
}

AddButton.propTypes = propTypes;