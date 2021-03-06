'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _abTweenState = require('ab-tween-state');

var _abTweenState2 = _interopRequireDefault(_abTweenState);

var _decorators = require('./decorators');

var _decorators2 = _interopRequireDefault(_decorators);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _exenv = require('exenv');

var _exenv2 = _interopRequireDefault(_exenv);

var addEvent = function addEvent(elem, type, eventHandle) {
  if (elem === null || typeof elem === 'undefined') {
    return;
  }
  if (elem.addEventListener) {
    elem.addEventListener(type, eventHandle, false);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + type, eventHandle);
  } else {
    elem['on' + type] = eventHandle;
  }
};

var removeEvent = function removeEvent(elem, type, eventHandle) {
  if (elem === null || typeof elem === 'undefined') {
    return;
  }
  if (elem.removeEventListener) {
    elem.removeEventListener(type, eventHandle, false);
  } else if (elem.detachEvent) {
    elem.detachEvent('on' + type, eventHandle);
  } else {
    elem['on' + type] = null;
  }
};

var Carousel = _react2['default'].createClass({
  displayName: 'Carousel',

  mixins: [_abTweenState2['default'].Mixin],

  propTypes: {
    afterSlide: _react2['default'].PropTypes.func,
    beforeSlide: _react2['default'].PropTypes.func,
    cellAlign: _react2['default'].PropTypes.oneOf(['left', 'center', 'right']),
    cellSpacing: _react2['default'].PropTypes.number,
    data: _react2['default'].PropTypes.func,
    decorators: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.shape({
      component: _react2['default'].PropTypes.func,
      position: _react2['default'].PropTypes.oneOf(['TopLeft', 'TopCenter', 'TopRight', 'CenterLeft', 'CenterCenter', 'CenterRight', 'BottomLeft', 'BottomCenter', 'BottomRight']),
      style: _react2['default'].PropTypes.object
    })),
    dragging: _react2['default'].PropTypes.bool,
    easing: _react2['default'].PropTypes.string,
    edgeEasing: _react2['default'].PropTypes.string,
    framePadding: _react2['default'].PropTypes.string,
    initialSlideHeight: _react2['default'].PropTypes.number,
    initialSlideWidth: _react2['default'].PropTypes.number,
    slideIndex: _react2['default'].PropTypes.number,
    slidesToShow: _react2['default'].PropTypes.number,
    slidesToScroll: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.number, _react2['default'].PropTypes.oneOf(['auto'])]),
    slideWidth: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.string, _react2['default'].PropTypes.number]),
    speed: _react2['default'].PropTypes.number,
    vertical: _react2['default'].PropTypes.bool,
    width: _react2['default'].PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      afterSlide: function afterSlide() {},
      beforeSlide: function beforeSlide() {},
      cellAlign: 'left',
      cellSpacing: 0,
      data: function data() {},
      decorators: _decorators2['default'],
      dragging: true,
      easing: 'easeOutCirc',
      edgeEasing: 'easeOutElastic',
      framePadding: '0px',
      slideIndex: 0,
      slidesToScroll: 1,
      slideWidth: 1,
      speed: 500,
      vertical: false,
      width: '100%'
    };
  },

  getInitialState: function getInitialState() {
    return {
      currentSlide: this.props.slideIndex,
      dragging: false,
      frameWidth: 0,
      left: 0,
      slideCount: 0,
      slidesToScroll: this.props.slidesToScroll,
      slideWidth: 0,
      top: 0
    };
  },

  componentWillMount: function componentWillMount() {
    this.setInitialDimensions();
  },

  componentDidMount: function componentDidMount() {
    var self = this;
    this.setDimensions();
    this.bindEvents();
    this.setExternalData();
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setDimensions();
    if (nextProps.slideIndex !== this.state.currentSlide) {
      // this.goToSlide(nextProps.slideIndex);
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    this.unbindEvents();
  },

  render: function render() {
    var self = this;
    var children = _react2['default'].Children.count(self.props.children) > 1 ? self.formatChildren(self.props.children) : self.props.children;
    return _react2['default'].createElement(
      'div',
      { className: ['slider', self.props.className || ''].join(' '), ref: 'slider', style: (0, _objectAssign2['default'])(self.getSliderStyles(), self.props.style || {}) },
      _react2['default'].createElement(
        'div',
        _extends({ className: 'slider-frame',
          ref: 'frame',
          style: self.getFrameStyles()
        }, self.getTouchEvents(), self.getMouseEvents(), {
          onClick: self.handleClick }),
        _react2['default'].createElement(
          'ul',
          { className: 'slider-list', ref: 'list', style: self.getListStyles() },
          children
        )
      ),
      self.props.decorators ? self.props.decorators.map(function (Decorator, index) {
        return _react2['default'].createElement(
          'div',
          {
            style: (0, _objectAssign2['default'])(self.getDecoratorStyles(Decorator.position), Decorator.style || {}),
            className: 'slider-decorator-' + index,
            key: index },
          _react2['default'].createElement(Decorator.component, {
            currentSlide: self.state.currentSlide,
            slideCount: self.state.slideCount,
            frameWidth: self.state.frameWidth,
            slideWidth: self.state.slideWidth,
            slidesToScroll: self.state.slidesToScroll,
            cellSpacing: self.props.cellSpacing,
            slidesToShow: self.props.slidesToShow,
            nextSlide: self.nextSlide,
            previousSlide: self.previousSlide,
            goToSlide: self.goToSlide })
        );
      }) : null,
      _react2['default'].createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: self.getStyleTagStyles() } })
    );
  },

  // Touch Events

  touchObject: {},

  getTouchEvents: function getTouchEvents() {
    var self = this;

    return {
      onTouchStart: function onTouchStart(e) {
        var start = +new Date();
        self.touchObject = {
          startX: e.touches[0].pageX,
          startY: e.touches[0].pageY,
          time: start
        };
      },
      onTouchMove: function onTouchMove(e) {
        var direction = self.swipeDirection(self.touchObject.startX, e.touches[0].pageX, self.touchObject.startY, e.touches[0].pageY);

        if (direction !== 0) {
          e.preventDefault();
        }
        var rightEndLimit = _react2['default'].Children.count(self.props.children) - self.props.slidesToShow;
        var leftEndLimit = 0;
        var length = 0;
        if (_react2['default'].Children.count(self.props.children) > self.props.slidesToShow) {
          if (direction === 1 && self.state.currentSlide >= rightEndLimit) {
            length = 10;
          } else if (direction === -1 && self.state.currentSlide <= leftEndLimit) {
            length = 10;
          } else if (direction === 1 && self.state.currentSlide === rightEndLimit - 1) {
            var temp = Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));
            length = temp > Math.round(window.innerWidth / self.props.slidesToShow) ? Math.round(window.innerWidth / 3) + 10 : temp;
          } else if (direction === -1 && self.state.currentSlide === 1) {
            var temp = Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));
            length = temp > Math.round(window.innerWidth / self.props.slidesToShow) ? Math.round(window.innerWidth / 3) + 10 : temp;
          } else {
            length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.touches[0].pageY - self.touchObject.startY, 2))) : Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));
          }
        }
        self.touchObject = {
          startX: self.touchObject.startX,
          startY: self.touchObject.startY,
          endX: e.touches[0].pageX,
          endY: e.touches[0].pageY,
          length: length,
          direction: direction,
          time: self.touchObject.time
        };

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onTouchEnd: function onTouchEnd(e) {
        var distance = Math.abs(self.touchObject.startX - self.touchObject.endX);
        var end = +new Date();
        var time = end - self.touchObject.time;
        var velocity = Math.abs(Math.round(distance / time));
        self.handleSwipe(e, velocity);
      },
      onTouchCancel: function onTouchCancel(e) {
        self.handleSwipe(e);
      }
    };
  },

  clickSafe: true,

  getMouseEvents: function getMouseEvents() {
    var self = this;

    if (this.props.dragging === false) {
      return null;
    }

    return {
      onMouseDown: function onMouseDown(e) {
        var start = +new Date();
        self.touchObject = {
          startX: e.clientX,
          startY: e.clientY,
          time: start
        };

        self.setState({
          dragging: true
        });
      },
      onMouseMove: function onMouseMove(e) {
        if (!self.state.dragging) {
          return;
        }

        var direction = self.swipeDirection(self.touchObject.startX, e.clientX, self.touchObject.startY, e.clientY);

        if (direction !== 0) {
          e.preventDefault();
        }
        var rightEndLimit = _react2['default'].Children.count(self.props.children) - self.props.slidesToShow;
        var leftEndLimit = 0;
        var length = 0;
        if (_react2['default'].Children.count(self.props.children) > self.props.slidesToShow) {
          if (direction === 1 && self.state.currentSlide >= rightEndLimit) {
            length = 10;
          } else if (direction === -1 && self.state.currentSlide <= leftEndLimit) {
            length = 10;
          } else if (direction === 1 && self.state.currentSlide === rightEndLimit - 1) {
            var temp = Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));
            length = temp > Math.round(window.innerWidth / self.props.slidesToShow) ? Math.round(window.innerWidth / 3) + 10 : temp;
          } else if (direction === -1 && self.state.currentSlide === 1) {
            var temp = Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));
            length = temp > Math.round(window.innerWidth / self.props.slidesToShow) ? Math.round(window.innerWidth / 3) + 10 : temp;
          } else {
            length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.clientY - self.touchObject.startY, 2))) : Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));
          }
        }

        self.touchObject = {
          startX: self.touchObject.startX,
          startY: self.touchObject.startY,
          endX: e.clientX,
          endY: e.clientY,
          length: length,
          direction: direction,
          time: self.touchObject.time
        };

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onMouseUp: function onMouseUp(e) {
        if (!self.state.dragging) {
          return;
        }
        var distance = Math.abs(self.touchObject.startX - self.touchObject.endX);
        var end = +new Date();
        var time = end - self.touchObject.time;
        var velocity = Math.abs(Math.round(distance / time));
        self.handleSwipe(e, velocity, distance);
      },
      onMouseLeave: function onMouseLeave(e) {
        if (!self.state.dragging) {
          return;
        }

        self.handleSwipe(e);
      }
    };
  },

  handleClick: function handleClick(e) {
    if (this.clickSafe === true) {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  },

  handleSwipe: function handleSwipe(e, velocity, distance) {
    var self = this;
    var velocity = velocity || 0;
    var distance = distance || 0;
    if (typeof this.touchObject.length !== 'undefined' && this.touchObject.length > 44) {
      this.clickSafe = true;
    } else {
      this.clickSafe = false;
    }

    if (this.touchObject.length > this.state.slideWidth / this.props.slidesToShow / 5) {
      if (this.touchObject.direction === 1) {
        if (this.state.currentSlide >= _react2['default'].Children.count(self.props.children) - this.props.slidesToScroll) {
          this.animateSlide(_abTweenState2['default'].easingTypes[this.props.edgeEasing]);
        } else {
          this.nextSlide(velocity, distance);
        }
      } else if (this.touchObject.direction === -1) {
        if (this.state.currentSlide <= 0) {
          this.animateSlide(_abTweenState2['default'].easingTypes[this.props.edgeEasing]);
        } else {
          this.previousSlide(velocity, distance);
        }
      }
    } else {
      this.goToSlide(this.state.currentSlide);
    }

    this.touchObject = {};
    this.setState({
      dragging: false
    });
  },

  swipeDirection: function swipeDirection(x1, x2, y1, y2) {

    var xDist, yDist, r, swipeAngle;

    xDist = x1 - x2;
    yDist = y1 - y2;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return 1;
    }
    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return 1;
    }
    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return -1;
    }
    if (this.props.vertical === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;
  },

  // Action Methods

  goToSlide: function goToSlide(index) {
    var self = this;
    if (index >= _react2['default'].Children.count(self.props.children) || index < 0) {
      return;
    }

    this.props.beforeSlide(this.state.currentSlide, index);

    this.setState({
      currentSlide: index
    }, function () {
      self.animateSlide();
      this.props.afterSlide(index);
      self.setExternalData();
    });
  },

  nextSlide: function nextSlide(velocity, distance) {
    var self = this;
    if (this.state.currentSlide + this.props.slidesToScroll >= _react2['default'].Children.count(self.props.children)) {
      return;
    }

    var sum = this.state.currentSlide + this.props.slidesToScroll;
    var adj = this.props.slidesToShow - this.props.slidesToScroll;
    if (_react2['default'].Children.count(self.props.children) - sum < this.props.slidesToShow) {
      var diff = _react2['default'].Children.count(self.props.children) - sum - adj;
      sum = this.state.currentSlide + diff;
    } else {
      var endLimit = _react2['default'].Children.count(self.props.children) - this.props.slidesToShow;
      if (velocity >= 3) {
        // console.log("velocity 3");
        if (distance > window.innerWidth * 0.35) sum = endLimit;else sum = sum + 4 > endLimit ? endLimit : sum + 4;
      } else if (velocity === 2) {
        if (distance > window.innerWidth * 0.65) {
          if (sum + 3 <= endLimit) {
            sum += 3;
          } else if (sum + 2 <= endLimit) {
            sum += 2;
          }
        } else {
          sum = sum + 2 <= endLimit ? sum + 2 : endLimit;
        }
      } else if (velocity === 1) {
        if (distance > window.innerWidth * 0.60) sum = sum + 2 <= endLimit ? sum + 2 : endLimit;else sum = sum + 1 <= endLimit ? sum + 1 : endLimit;
      } else if (velocity === 0 && distance > window.innerWidth * 0.60) {
        sum = sum + 1 <= endLimit ? sum + 1 : endLimit;
      } else {
        // console.log("do nothing special");
      }
    }
    this.setState({
      currentSlide: sum
    }, function () {
      self.animateSlide();
      this.props.afterSlide(sum);
      self.setExternalData();
    });
  },

  previousSlide: function previousSlide(velocity, distance) {
    var self = this;
    var difference = this.state.currentSlide - this.props.slidesToScroll;
    if (difference < 0) {
      return;
    }
    var padding = 0;
    var slide = difference < this.props.slidesToScroll ? difference + 1 : difference;
    if (difference === 0) {
      slide = 0;
    } else {
      if (velocity >= 3) {
        if (distance > window.innerWidth * 0.35) {
          slide = 0;
        } else {
          slide = slide - 4 < 0 ? 0 : slide - 4;
        }
      } else if (velocity === 2) {
        if (distance > window.innerWidth * 0.65) slide = slide - 3 < 0 ? 0 : slide - 3;else slide = slide - 2 < 0 ? 0 : slide - 1;
      } else if (velocity === 1) {
        if (distance > window.innerWidth * .35) slide = slide - 2 < 0 ? 0 : slide - 2;else slide = slide - 1 < 0 ? 0 : slide - 1;
      } else if (velocity === 0) {
        if (distance > window.innerWidth * .60) {
          slide = slide - 1 < 0 ? 0 : slide - 1;
        }
      }
    }

    this.setState({
      currentSlide: slide
    }, function () {
      self.animateSlide();
      self.setExternalData();
    });
  },

  // Animation

  animateSlide: function animateSlide(easing, duration, endValue) {
    this.tweenState(this.props.vertical ? 'top' : 'left', {
      easing: easing || _abTweenState2['default'].easingTypes[this.props.easing],
      duration: duration || this.props.speed,
      endValue: endValue || this.getTargetLeft()
    });
  },

  getTargetLeft: function getTargetLeft(touchOffset) {
    var offset;
    switch (this.props.cellAlign) {
      case 'left':
        {
          offset = 0;
          offset -= this.props.cellSpacing * this.state.currentSlide;
          break;
        }
      case 'center':
        {
          offset = (this.state.frameWidth - this.state.slideWidth) / 2;
          offset -= this.props.cellSpacing * this.state.currentSlide;
          break;
        }
      case 'right':
        {
          offset = this.state.frameWidth - this.state.slideWidth;
          offset -= this.props.cellSpacing * this.state.currentSlide;
          break;
        }
    }

    if (this.props.vertical) {
      offset = offset / 2;
    }

    offset -= touchOffset || 0;

    return (this.state.slideWidth * this.state.currentSlide - offset) * -1;
  },

  // Bootstrapping

  bindEvents: function bindEvents() {
    var self = this;
    if (_exenv2['default'].canUseDOM) {
      addEvent(window, 'resize', self.onResize);
      addEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  onResize: function onResize() {
    this.setDimensions();
  },

  onReadyStateChange: function onReadyStateChange(event) {
    this.setDimensions();
  },

  unbindEvents: function unbindEvents() {
    var self = this;
    if (_exenv2['default'].canUseDOM) {
      removeEvent(window, 'resize', self.onResize);
      removeEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  formatChildren: function formatChildren(children) {
    var self = this;
    return children.map(function (child, index) {
      return _react2['default'].createElement(
        'li',
        { className: 'slider-slide', style: self.getSlideStyles(), key: index },
        child
      );
    });
  },

  setInitialDimensions: function setInitialDimensions() {
    var self = this,
        slideWidth,
        frameWidth,
        frameHeight,
        slideHeight;

    slideWidth = this.props.vertical ? this.props.initialSlideHeight || 0 : this.props.initialSlideWidth || 0;
    slideHeight = this.props.initialSlideHeight ? this.props.initialSlideHeight * this.props.slidesToShow : 0;

    frameHeight = slideHeight + this.props.cellSpacing / 2 * (this.props.slidesToShow - 1);

    this.setState({
      frameWidth: this.props.vertical ? frameHeight : '100%',
      slideCount: _react2['default'].Children.count(self.props.children),
      slideWidth: slideWidth
    }, function () {
      self.setLeft();
      self.setExternalData();
    });
  },

  setDimensions: function setDimensions() {
    var self = this,
        slideWidth,
        slidesToScroll,
        firstSlide,
        frame,
        frameWidth,
        frameHeight,
        slideHeight;

    slidesToScroll = this.props.slidesToScroll;
    frame = _reactDom2['default'].findDOMNode(this.refs.frame);
    firstSlide = frame.childNodes[0].childNodes[0];
    if (firstSlide) {
      firstSlide.style.height = 'auto';
      slideHeight = firstSlide.offsetHeight * this.props.slidesToShow;
    } else {
      slideHeight = 100;
    }

    if (typeof this.props.slideWidth !== 'number') {
      slideWidth = parseInt(this.props.slideWidth);
    } else {
      if (this.props.vertical) {
        slideWidth = slideHeight / this.props.slidesToShow * this.props.slideWidth;
      } else {
        slideWidth = frame.offsetWidth / this.props.slidesToShow * this.props.slideWidth;
      }
    }

    if (!this.props.vertical) {
      slideWidth -= this.props.cellSpacing * ((100 - 100 / this.props.slidesToShow) / 100);
    }

    frameHeight = slideHeight + this.props.cellSpacing / 2 * (this.props.slidesToShow - 1);
    frameWidth = this.props.vertical ? frameHeight : frame.offsetWidth;

    if (this.props.slidesToScroll === 'auto') {
      slidesToScroll = Math.floor(frameWidth / (slideWidth + this.props.cellSpacing));
    }

    this.setState({
      frameWidth: frameWidth,
      slideCount: _react2['default'].Children.count(self.props.children),
      slideWidth: slideWidth,
      slidesToScroll: slidesToScroll,
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    }, function () {
      self.setLeft();
    });
  },

  setLeft: function setLeft() {
    this.setState({
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    });
  },

  // Data

  setExternalData: function setExternalData() {
    if (this.props.data) {
      this.props.data();
    }
  },

  // Styles

  getListStyles: function getListStyles() {
    var self = this;
    var listWidth = this.state.slideWidth * _react2['default'].Children.count(self.props.children);
    var spacingOffset = this.props.cellSpacing * _react2['default'].Children.count(self.props.children);
    return {
      position: 'relative',
      display: 'block',
      top: this.getTweeningValue('top'),
      left: this.getTweeningValue('left') || 0,
      margin: this.props.vertical ? this.props.cellSpacing / 2 * -1 + 'px 0px' : '0px ' + this.props.cellSpacing / 2 * -1 + 'px',
      padding: 0,
      height: this.props.vertical ? listWidth + spacingOffset : 'auto',
      width: this.props.vertical ? 'auto' : listWidth + spacingOffset,
      cursor: this.state.dragging === true ? 'pointer' : 'inherit',
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    };
  },

  getFrameStyles: function getFrameStyles() {
    return {
      position: 'relative',
      display: 'block',
      overflow: 'hidden',
      height: this.props.vertical ? this.state.frameWidth || 'initial' : 'auto',
      margin: this.props.framePadding,
      padding: 0,
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    };
  },

  getSlideStyles: function getSlideStyles() {
    return {
      display: this.props.vertical ? 'block' : 'inline-block',
      listStyleType: 'none',
      verticalAlign: 'top',
      width: this.props.vertical ? '100%' : this.state.slideWidth,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      marginLeft: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginRight: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginTop: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
      marginBottom: this.props.vertical ? this.props.cellSpacing / 2 : 'auto'
    };
  },

  getSliderStyles: function getSliderStyles() {
    return {
      position: 'relative',
      display: 'block',
      width: this.props.width,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      visibility: this.state.slideWidth ? 'visible' : 'hidden'
    };
  },

  getStyleTagStyles: function getStyleTagStyles() {
    return '.slider-slide > img {width: 100%; display: block;}';
  },

  getDecoratorStyles: function getDecoratorStyles(position) {
    switch (position) {
      case 'TopLeft':
        {
          return {
            position: 'absolute',
            top: 0,
            left: 0
          };
        }
      case 'TopCenter':
        {
          return {
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            WebkitTransform: 'translateX(-50%)'
          };
        }
      case 'TopRight':
        {
          return {
            position: 'absolute',
            top: 0,
            right: 0
          };
        }
      case 'CenterLeft':
        {
          return {
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            WebkitTransform: 'translateY(-50%)'
          };
        }
      case 'CenterCenter':
        {
          return {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            WebkitTransform: 'translate(-50%, -50%)'
          };
        }
      case 'CenterRight':
        {
          return {
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            WebkitTransform: 'translateY(-50%)'
          };
        }
      case 'BottomLeft':
        {
          return {
            position: 'absolute',
            bottom: 0,
            left: 0
          };
        }
      case 'BottomCenter':
        {
          return {
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            WebkitTransform: 'translateX(-50%)'
          };
        }
      case 'BottomRight':
        {
          return {
            position: 'absolute',
            bottom: 0,
            right: 0
          };
        }
      default:
        {
          return {
            position: 'absolute',
            top: 0,
            left: 0
          };
        }
    }
  }

});

Carousel.ControllerMixin = {
  getInitialState: function getInitialState() {
    return {
      carousels: {}
    };
  },
  setCarouselData: function setCarouselData(carousel) {
    var data = this.state.carousels;
    data[carousel] = this.refs[carousel];
    this.setState({
      carousels: data
    });
  }
};

exports['default'] = Carousel;
module.exports = exports['default'];