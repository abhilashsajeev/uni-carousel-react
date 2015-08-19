var React = require('react');
var Carousel = require('uni-carousel-react');
var CarouselSlider = React.createClass({displayName: "CarouselSlider",
  render:function(){
    return (
    	React.createElement(Carousel, {slidesToShow: 3, cellAlign: "left", edgeEasing: "linear", 
			dragging: false, speed: 500, framePadding: "0px", cellSpacing: 20, 
			decorators: []}, 
			React.createElement("img", {src: "http://placehold.it/1000x400&text=slide1"}), 
	        React.createElement("img", {src: "http://placehold.it/1000x400&text=slide2"}), 
	        React.createElement("img", {src: "http://placehold.it/1000x400&text=slide3"}), 
	        React.createElement("img", {src: "http://placehold.it/1000x400&text=slide4"}), 
	        React.createElement("img", {src: "http://placehold.it/1000x400&text=slide5"}), 
	        React.createElement("img", {src: "http://placehold.it/1000x400&text=slide6"})
    	)
    	);
  }
});
React.render(React.createElement(CarouselSlider, null),document.getElementById('main'));
