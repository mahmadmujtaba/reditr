import React from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import Observable from '../../utilities/Observable'
import history from '../../utilities/History'
import AccountHeader from '../AccountHeader'
import logo from '../../images/logo.png'
import style from '../../utilities/Style'

class Logo extends React.Component {
  render() {
    return <Link to="/"><img className="logo" src={logo} /></Link>
  }
}

const HeaderView = style(class extends React.Component {

  constructor(props) {
    super(props)
    this.state = { history: [], future: [] }
    this.didComponentMount = false
    this.waitedForMount = []
    Observable.global.on(this, 'pushNav', this.onPushNav)
    Observable.global.on(this, 'offerBreadcrumb', this.onOfferBreadcrumb)
  }

  onOfferBreadcrumb(data) {
    if (this.state.history.length == 0) {
      this.onPushNav(data)
    }
  }

  onPushNav(data) {
    var history = this.state.history
    var future = this.state.future
    // queue up nav tasks until component is mounted
    if (!this.didComponentMount) {
      this.waitedForMount.push(['onPushNav', data])
      // go forward
    } else if (
      future.length > 0 &&
      future[future.length - 1].href == data.href
    ) {
      history.push(future.pop())
      // go backward
    } else if (
      history.length > 1 &&
      history[history.length - 2].href == data.href
    ) {
      future.push(history.pop())
      // go to new page
    } else if (
      history.length == 0 ||
      history[history.length - 1].href != data.href
    ) {
      history.push(data)
      this.state.future = []
    }
    this.setState({})
  }

  componentDidMount() {
    this.didComponentMount = true
    this.waitedForMount.forEach(data => this[data[0]](data[1]))
    delete this.waitedForMount
    Observable.global.on(this, 'pushNav', this.onPushNav)
    Observable.global.on(this, 'offerBreadcrumb', this.onOfferBreadcrumb)
  }

  componentWillUnmount() {
    Observable.global.removeAll(this)
  }

  truncateTitle(title) {
    var words = (title || '').split(' ')
    if (words.length <= 5) return title
    var newTitle = []
    for (var i = 0; i < 5; i++) newTitle.push(words[i])
    return newTitle.join(' ') + '...'
  }

  render() {
    var text
    var history = this.state.history

    //    var right = this.future[this.future.length-1];
    var rightObj = <AccountHeader userManager={this.props.userManager} user={this.props.user} />
    // if(right) {
    //   text = this.truncateTitle(right.text || right.href) + ' »';
    //   rightObj = <Link className="header-view-text" to={right.href}>{text}</Link>;
    // }
    //
    var center = history[history.length - 1]
    var centerObj = false
    var subPicker = () => Observable.global.trigger('requestQuickSwitcher')
    if (center) {
      text = this.truncateTitle(center.text)
      centerObj = (
        <Link className="header-view-text" to={center.href} onClick={subPicker}>
          {text}
        </Link>
      )
    }

    //    var left = this.history[this.history.length-2] || false;
    var leftObj = <Logo />
    // if(left) {
    //   text = '« ' + this.truncateTitle(left.text || left.href);
    //   leftObj = <Link className="header-view-text" to={left.href}>{text}</Link>;
    // }

    return (
      <div id="HeaderView">
        <div className="header-view-left">
          <div className={this.props.classes.menu} onClick={this.props.menuPressed} />
          {leftObj}
        </div>
        <div className="header-view-center">{centerObj}</div>
        <div className="header-view-right">{rightObj}</div>
      </div>
    )
  }


  static style() {
    return {
      menu: {
        width: '50px',
        height: '100%',
        backgroundImage: 'url(hamburger.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '45% auto',
        display: 'inline-block',
        float: 'left',
        marginRight: '5px',
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      }
    }
  }

})

export default HeaderView
