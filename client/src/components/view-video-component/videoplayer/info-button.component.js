import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';


const propTypes = {
  player: PropTypes.object,
  className: PropTypes.string
};


export default class InfoButton extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      open: false
    }
  }

  handleClick(e) {

    e.preventDefault();

    if (e.target.getAttribute('value') === 'infobutton') {
      this.props.handleInfo()
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
        value='infobutton'
        style={{
          backgroundImage:
            'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA9ElEQVQ4jaWTvUpDQRCFP5dbpPYZJIUEKwsLH8LKF7DyFXwBCcHCQkSsra2sgmnFKoWVVoKCaKUEK38+C6/mus4qlxwYWJhzzu4eZiCD2lUH6lh9qutC3VUXc35TWKl99cUy3tQ9tROJj/8Q5hj+MFG3A9JEXVV76k3QP/gSLxSefd644KjwnaUK2ACqIJZldQt4BNaCfgI259QzYCUgvAIP9Xke6AScK9T7QlCXjS+cFDjPKXBthQRcz6C/TcBoBoNRAg75DKwt3oHvWegHAd2p63WNi4NUG7Qd5VML+zDw/2Xa/yXOjLrqjtN1njhd517O/wAMwOiK4RrGMQAAAABJRU5ErkJggg==)',
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

InfoButton.propTypes = propTypes;