var React = require('react');
var Carousel = require('uni-carousel-react');
var CarouselSlider = React.createClass({displayName: "CarouselSlider",
  mixins:[Carousel.ControllerMixin],
  render:function(){
    return (
    	React.createElement(Carousel, {slidesToShow: 3, cellAlign: "left", edgeEasing: "linear", 
			dragging: true, speed: 500, framePadding: "0px", cellSpacing: 20, decorators:[]
			}, 
			React.createElement("img", {src: "http://lorempixel.com/500/500/nature/1/"}), 
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/2/"}), 
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/3/"}), 
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/4/"}), 
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/5/"}), 
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/6/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/7/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/nature/8/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/city/9/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/sports/1/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/sports/2/"}),
	        React.createElement("img", {src: "http://lorempixel.com/500/500/sports/3/"})
    	)
    	);
  }
});
React.render(React.createElement(CarouselSlider, null),document.getElementById('main'));
