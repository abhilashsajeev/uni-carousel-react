'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import tweenState from 'ab-tween-state';
import decorators from './decorators';
import assign from 'object-assign';
import ExecutionEnvironment from 'exenv';


const addEvent = function(elem, type, eventHandle) {
  if (elem === null || typeof (elem) === 'undefined') {
    return;
  }
  if (elem.addEventListener) {
    elem.addEventListener(type, eventHandle, false);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + type, eventHandle);
  } else {
    elem['on'+type] = eventHandle;
  }
};

const removeEvent = function(elem, type, eventHandle) {
  if (elem === null || typeof (elem) === 'undefined') {
    return;
  }
  if (elem.removeEventListener) {
    elem.removeEventListener(type, eventHandle, false);
  } else if (elem.detachEvent) {
    elem.detachEvent('on' + type, eventHandle);
  } else {
    elem['on'+type] = null;
  }
};

var Carousel = React.createClass({
  displayName: 'Carousel',

  mixins: [tweenState.Mixin],

  propTypes: {
    afterSlide: React.PropTypes.func,
    beforeSlide: React.PropTypes.func,
    cellAlign: React.PropTypes.oneOf(['left', 'center', 'right']),
    cellSpacing: React.PropTypes.number,
    data: React.PropTypes.func,
    decorators: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        component: React.PropTypes.func,
        position: React.PropTypes.oneOf([
          'TopLeft',
          'TopCenter',
          'TopRight',
          'CenterLeft',
          'CenterCenter',
          'CenterRight',
          'BottomLeft',
          'BottomCenter',
          'BottomRight'
        ]),
        style: React.PropTypes.object
      })
    ),
    dragging: React.PropTypes.bool,
    easing: React.PropTypes.string,
    edgeEasing: React.PropTypes.string,
    framePadding: React.PropTypes.string,
    initialSlideHeight: React.PropTypes.number,
    initialSlideWidth: React.PropTypes.number,
    slideIndex: React.PropTypes.number,
    slidesToShow: React.PropTypes.number,
    slidesToScroll: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.oneOf(['auto'])
    ]),
    slideWidth: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    speed: React.PropTypes.number,
    vertical: React.PropTypes.bool,
    width: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      afterSlide: function(){},
      beforeSlide: function(){},
      cellAlign: 'left',
      cellSpacing: 0,
      data: function() {},
      decorators: decorators,
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
    }
  },

  getInitialState() {
    return {
      currentSlide: this.props.slideIndex,
      dragging: false,
      frameWidth: 0,
      left: 0,
      slideCount: 0,
      slidesToScroll: this.props.slidesToScroll,
      slideWidth: 0,
      top: 0
    }
  },

  componentWillMount() {
    this.setInitialDimensions();
  },

  componentDidMount() {
    var self = this;
    this.setDimensions();
    this.bindEvents();
    this.setExternalData();
  },

  componentWillReceiveProps(nextProps) {
    this.setDimensions();
    if (nextProps.slideIndex !== this.state.currentSlide) {
        // this.goToSlide(nextProps.slideIndex);
    }
  },

  componentWillUnmount() {
    this.unbindEvents();
  },

  render() {
    var self = this;
    var children = React.Children.count(self.props.children) > 1 ? self.formatChildren(self.props.children) : self.props.children;
    return (
      <div className={['slider', self.props.className || ''].join(' ')} ref="slider" style={assign(self.getSliderStyles(), self.props.style || {})}>
        <div className="slider-frame"
          ref="frame"
          style={self.getFrameStyles()}
          {...self.getTouchEvents()}
          {...self.getMouseEvents()}
          onClick={self.handleClick}>
          <ul className="slider-list" ref="list" style={self.getListStyles()}>
            {children}
          </ul>
        </div>
        {self.props.decorators ?
          self.props.decorators.map(function(Decorator, index) {
            return (
              <div
                style={assign(self.getDecoratorStyles(Decorator.position), Decorator.style || {})}
                className={'slider-decorator-' + index}
                key={index}>
                <Decorator.component
                  currentSlide={self.state.currentSlide}
                  slideCount={self.state.slideCount}
                  frameWidth={self.state.frameWidth}
                  slideWidth={self.state.slideWidth}
                  slidesToScroll={self.state.slidesToScroll}
                  cellSpacing={self.props.cellSpacing}
                  slidesToShow={self.props.slidesToShow}
                  nextSlide={self.nextSlide}
                  previousSlide={self.previousSlide}
                  goToSlide={self.goToSlide} />
              </div>
            )
          })
        : null}
        <style type="text/css" dangerouslySetInnerHTML={{__html: self.getStyleTagStyles()}}/>
      </div>
    )
  },

  // Touch Events

  touchObject: {},

  getTouchEvents() {
    var self = this;

    return {
      onTouchStart(e) {
        var start = +new Date();
        self.touchObject = {
          startX: e.touches[0].pageX,
          startY: e.touches[0].pageY,
          time: start
        }
      },
      onTouchMove(e) {
        var direction = self.swipeDirection(
          self.touchObject.startX,
          e.touches[0].pageX,
          self.touchObject.startY,
          e.touches[0].pageY
        );

        if (direction !== 0) {
          e.preventDefault();
        }
        var rightEndLimit = React.Children.count(self.props.children) - self.props.slidesToShow;
        var leftEndLimit = 0;
        var length = 0;
        if(React.Children.count(self.props.children) > self.props.slidesToShow)  {
          if(direction ===1 && self.state.currentSlide>= rightEndLimit){
            length = 10;
          }else if(direction === -1 && self.state.currentSlide<= leftEndLimit){
            length = 10;
          }else if(direction ===1 && self.state.currentSlide === rightEndLimit-1){
            var temp = Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));
            length = temp>Math.round(window.innerWidth/self.props.slidesToShow)?Math.round(window.innerWidth/3)+10:temp;
          }else if(direction === -1 && self.state.currentSlide === 1){
            var temp = Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)));
            length = temp>Math.round(window.innerWidth/self.props.slidesToShow)?Math.round(window.innerWidth/3)+10:temp;
          }else{
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
          time : self.touchObject.time
        };

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onTouchEnd(e) {
        var distance = Math.abs(self.touchObject.startX - self.touchObject.endX);
        var end = +new Date();
        var time = end - self.touchObject.time;
        var velocity = Math.abs(Math.round(distance/time));
        self.handleSwipe(e,velocity);
      },
      onTouchCancel(e) {
        self.handleSwipe(e);
      }
    }
  },

  clickSafe: true,

  getMouseEvents() {
    var self = this;

    if (this.props.dragging === false) {
      return null;
    }

    return {
      onMouseDown(e) {
        var start = +new Date();
        self.touchObject = {
          startX: e.clientX,
          startY: e.clientY,
          time:start
        };

        self.setState({
          dragging: true
        });
      },
      onMouseMove(e) {
        if (!self.state.dragging) {
          return;
        }

        var direction = self.swipeDirection(
          self.touchObject.startX,
          e.clientX,
          self.touchObject.startY,
          e.clientY
        );

        if (direction !== 0) {
          e.preventDefault();
        }
        var rightEndLimit = React.Children.count(self.props.children) - self.props.slidesToShow;
        var leftEndLimit = 0;
        var length = 0;
        if(React.Children.count(self.props.children) > self.props.slidesToShow)  {
          if(direction ===1 && self.state.currentSlide>= rightEndLimit){
            length = 10;
          }else if(direction === -1 && self.state.currentSlide<= leftEndLimit){
            length = 10;
          }else if(direction ===1 && self.state.currentSlide === rightEndLimit-1){
            var temp = Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));
            length = temp>Math.round(window.innerWidth/self.props.slidesToShow)?Math.round(window.innerWidth/3)+10:temp;
          }else if(direction === -1 && self.state.currentSlide === 1){
            var temp = Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)));
            length = temp>Math.round(window.innerWidth/self.props.slidesToShow)?Math.round(window.innerWidth/3)+10:temp;
          }else{
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
          time:self.touchObject.time
        };

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onMouseUp(e) {
        if (!self.state.dragging) {
          return;
        }
        var distance = Math.abs(self.touchObject.startX - self.touchObject.endX);
        var end = +new Date();
        var time = end - self.touchObject.time;
        var velocity = Math.abs(Math.round(distance/time));
        self.handleSwipe(e,velocity,distance);
      },
      onMouseLeave(e) {
        if (!self.state.dragging) {
          return;
        }

        self.handleSwipe(e);
      }
    }
  },

  handleClick(e) {
    if (this.clickSafe === true) {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  },

  handleSwipe(e,velocity,distance) {
    var self = this;
    var velocity = velocity ||0;
    var distance = distance ||0;
    if (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44) {
      this.clickSafe = true;
    } else {
      this.clickSafe = false;
    }

    if (this.touchObject.length > (this.state.slideWidth / this.props.slidesToShow) / 5) {
      if (this.touchObject.direction === 1) {
        if (this.state.currentSlide >= React.Children.count(self.props.children) - this.props.slidesToScroll) {
          this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
        } else {
          this.nextSlide(velocity,distance);
        }
      } else if (this.touchObject.direction === -1) {
        if (this.state.currentSlide <= 0) {
          this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
        } else {
          this.previousSlide(velocity,distance);
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

  swipeDirection(x1, x2, y1, y2) {

    var xDist, yDist, r, swipeAngle;

    xDist = x1 - x2;
    yDist = y1 - y2;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
      return 1;
    }
    if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
      return 1;
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
      return -1;
    }
    if (this.props.vertical === true) {
      if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;

  },

  // Action Methods

  goToSlide(index) {
    var self = this;
    if (index >= React.Children.count(self.props.children) || index < 0) {
      return;
    }

    this.props.beforeSlide(this.state.currentSlide, index);

    this.setState({
      currentSlide: index
    }, function() {
      self.animateSlide();
      this.props.afterSlide(index);
      self.setExternalData();
    });
  },

  nextSlide(velocity,distance) {
    var self = this;
    if (this.state.currentSlide + this.props.slidesToScroll >= React.Children.count(self.props.children)) {
      return;
    }

    var sum = this.state.currentSlide + this.props.slidesToScroll;
    var adj = this.props.slidesToShow - this.props.slidesToScroll;
    if((React.Children.count(self.props.children) - sum)<this.props.slidesToShow){
      var diff = React.Children.count(self.props.children) - sum - adj;
      sum = this.state.currentSlide + diff;
    }else{
      var endLimit = React.Children.count(self.props.children) - this.props.slidesToShow;
      if(velocity>=3){
        // console.log("velocity 3");
        if(distance > window.innerWidth*0.35)
          sum = endLimit;  
        else
          sum = (sum + 4)>(endLimit)?endLimit:sum+4;
      }else if(velocity === 2){
        if(distance > window.innerWidth*0.65){
          if((sum + 3)<=(endLimit)){
            sum +=3;           
          }else if((sum + 2)<=(endLimit)){
            sum +=2;
          }
        }else{
          sum = (sum + 2)<=(endLimit)?sum+2:endLimit;  
        }
      }else if(velocity === 1){
          if(distance > window.innerWidth * 0.60)
            sum = (sum + 2)<=(endLimit)?sum+2:endLimit; 
          else
            sum = (sum + 1)<=(endLimit)?sum+1:endLimit; 
      }else if(velocity === 0 && distance > window.innerWidth * 0.60) {
        sum = (sum + 1)<=(endLimit)?sum+1:endLimit; 
      }else{
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

  previousSlide(velocity,distance) {
    var self = this;
    var difference = this.state.currentSlide - this.props.slidesToScroll;
    if (difference < 0) {
      return;
    }
    var padding = 0;
    var slide = (difference< this.props.slidesToScroll)?difference+1:difference;
    if(difference === 0){
      slide  = 0;
    }else{
      if(velocity>=3){
        if(distance > window.innerWidth*0.35){
          slide = 0;  
        }else{
          slide = (slide-4)<0?0:slide-4;  
        }
        
      }else if(velocity === 2){
        if(distance > window.innerWidth*0.65)
          slide = (slide-3)<0?0:slide-3;
        else
          slide = (slide-2)<0?0:slide-1;

      }else if(velocity === 1){
        if(distance > window.innerWidth*.35)
          slide = (slide-2)<0?0:slide-2;
        else
          slide = (slide-1)<0?0:slide-1;
      }else if(velocity === 0){
        if(distance > window.innerWidth*.60){
          slide = (slide-1)<0?0:slide-1;
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

  animateSlide(easing, duration, endValue) {
    this.tweenState(this.props.vertical ? 'top' : 'left', {
      easing: easing || tweenState.easingTypes[this.props.easing],
      duration: duration || this.props.speed,
      endValue: endValue || this.getTargetLeft()
    });
  },

  getTargetLeft(touchOffset) {
    var offset;
    switch (this.props.cellAlign) {
      case 'left': {
        offset = 0;
        offset -= this.props.cellSpacing * (this.state.currentSlide);
        break;
      }
      case 'center': {
        offset = (this.state.frameWidth - this.state.slideWidth) / 2;
        offset -= this.props.cellSpacing * (this.state.currentSlide);
        break;
      }
      case 'right': {
        offset = this.state.frameWidth - this.state.slideWidth;
        offset -= this.props.cellSpacing * (this.state.currentSlide);
        break;
      }
    }

    if (this.props.vertical) {
      offset = offset / 2;
    }

    offset -= touchOffset || 0;

    return ((this.state.slideWidth * this.state.currentSlide) - offset) * -1;
  },

  // Bootstrapping

  bindEvents() {
    var self = this;
    if (ExecutionEnvironment.canUseDOM) {
      addEvent(window, 'resize', self.onResize);
      addEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  onResize() {
    this.setDimensions();
  },

  onReadyStateChange(event) {
    this.setDimensions();
  },

  unbindEvents() {
    var self = this;
    if (ExecutionEnvironment.canUseDOM) {
      removeEvent(window, 'resize', self.onResize);
      removeEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  formatChildren(children) {
    var self = this;
    return children.map(function(child, index) {
      return <li className="slider-slide" style={self.getSlideStyles()} key={index}>{child}</li>
    });
  },

  setInitialDimensions() {
    var self = this, slideWidth, frameWidth, frameHeight, slideHeight;

    slideWidth = this.props.vertical ? (this.props.initialSlideHeight || 0) : (this.props.initialSlideWidth || 0);
    slideHeight = this.props.initialSlideHeight ? this.props.initialSlideHeight * this.props.slidesToShow : 0;

    frameHeight = slideHeight + ((this.props.cellSpacing / 2) * (this.props.slidesToShow - 1));

    this.setState({
      frameWidth: this.props.vertical ? frameHeight : '100%',
      slideCount: React.Children.count(self.props.children),
      slideWidth: slideWidth
    }, function() {
      self.setLeft();
      self.setExternalData();
    });
  },

  setDimensions() {
    var self = this,
      slideWidth,
      slidesToScroll,
      firstSlide,
      frame,
      frameWidth,
      frameHeight,
      slideHeight;

    slidesToScroll = this.props.slidesToScroll;
    frame = ReactDom.findDOMNode(this.refs.frame);
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
        slideWidth = (slideHeight / this.props.slidesToShow) * this.props.slideWidth;
      } else {
        slideWidth = (frame.offsetWidth / this.props.slidesToShow) * this.props.slideWidth;
      }
    }

    if (!this.props.vertical) {
      slideWidth -= this.props.cellSpacing * ((100 - (100 / this.props.slidesToShow)) / 100);
    }

    frameHeight = slideHeight + ((this.props.cellSpacing / 2) * (this.props.slidesToShow - 1));
    frameWidth = this.props.vertical ? frameHeight : frame.offsetWidth;

    if (this.props.slidesToScroll === 'auto') {
      slidesToScroll = Math.floor(frameWidth / (slideWidth + this.props.cellSpacing));
    }

    this.setState({
      frameWidth: frameWidth,
      slideCount: React.Children.count(self.props.children),
      slideWidth: slideWidth,
      slidesToScroll: slidesToScroll,
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    }, function() {
      self.setLeft()
    });
  },

  setLeft() {
    this.setState({
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    })
  },

  // Data

  setExternalData() {
    if (this.props.data) {
      this.props.data();
    }
  },

  // Styles

  getListStyles() {
    var self = this;
    var listWidth = this.state.slideWidth * React.Children.count(self.props.children);
    var spacingOffset = this.props.cellSpacing * React.Children.count(self.props.children);
    return {
      position: 'relative',
      display: 'block',
      top: this.getTweeningValue('top'),
      left: this.getTweeningValue('left') || 0,
      margin: this.props.vertical ? (this.props.cellSpacing / 2) * -1 + 'px 0px'
                                  : '0px ' + (this.props.cellSpacing / 2) * -1 + 'px',
      padding: 0,
      height: this.props.vertical ? listWidth + spacingOffset : 'auto',
      width: this.props.vertical ? 'auto' : listWidth + spacingOffset,
      cursor: this.state.dragging === true ? 'pointer' : 'inherit',
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    }
  },

  getFrameStyles() {
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
    }
  },

  getSlideStyles() {
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
    }
  },

  getSliderStyles() {
    return {
      position: 'relative',
      display: 'block',
      width: this.props.width,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      visibility: this.state.slideWidth ? 'visible' : 'hidden'
    }
  },

  getStyleTagStyles() {
    return '.slider-slide > img {width: 100%; display: block;}'
  },

  getDecoratorStyles(position) {
    switch (position) {
      case 'TopLeft': {
        return {
          position: 'absolute',
          top: 0,
          left: 0
        }
      }
      case 'TopCenter': {
        return {
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          WebkitTransform: 'translateX(-50%)'
        }
      }
      case 'TopRight': {
        return {
          position: 'absolute',
          top: 0,
          right: 0
        }
      }
      case 'CenterLeft': {
        return {
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          WebkitTransform: 'translateY(-50%)'
        }
      }
      case 'CenterCenter': {
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          WebkitTransform: 'translate(-50%, -50%)'
        }
      }
      case 'CenterRight': {
        return {
          position: 'absolute',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          WebkitTransform: 'translateY(-50%)'
        }
      }
      case 'BottomLeft': {
        return {
          position: 'absolute',
          bottom: 0,
          left: 0
        }
      }
      case 'BottomCenter': {
        return {
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          WebkitTransform: 'translateX(-50%)'
        }
      }
      case 'BottomRight': {
        return {
          position: 'absolute',
          bottom: 0,
          right: 0
        }
      }
      default: {
        return {
          position: 'absolute',
          top: 0,
          left: 0
        }
      }
    }
  }

});

Carousel.ControllerMixin = {
  getInitialState() {
    return {
      carousels: {}
    }
  },
  setCarouselData(carousel) {
    var data = this.state.carousels;
    data[carousel] = this.refs[carousel];
    this.setState({
      carousels: data
    });
  }
}

export default Carousel;
