'use strict';

import Carousel from '../src/carousel';
import React from 'react';
import ReactDom from 'react-dom';

window.React = React;



const content = document.getElementById('main');


var CarouselSlider = React.createClass({
  render:function(){
    return (
      <Carousel slidesToShow={3} cellAlign="left"  edgeEasing="linear"
      dragging = {true} speed={500}  framePadding="0px" cellSpacing={0}
      decorators={[]}>
          <img src="http://lorempixel.com/500/500/nature/1/"/>
          <img src="http://lorempixel.com/500/500/nature/2/"/>
          <img src="http://lorempixel.com/500/500/nature/3/"/>
          <img src="http://lorempixel.com/500/500/nature/4/"/>
          <img src="http://lorempixel.com/500/500/nature/5/"/>
          <img src="http://lorempixel.com/500/500/nature/6/"/>
          <img src="http://lorempixel.com/500/500/nature/7/"/>
          <img src="http://lorempixel.com/500/500/nature/8/"/>
          <img src="http://lorempixel.com/500/500/city/9/"/>
          <img src="http://lorempixel.com/500/500/sports/1/"/>
          <img src="http://lorempixel.com/500/500/sports/2/"/>
          <img src="http://lorempixel.com/500/500/sports/3/"/>
      </Carousel>
      );
  }
});

ReactDom.render(<CarouselSlider/>, content)
