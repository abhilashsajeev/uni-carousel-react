var React = require('react');
var Carousel = require('uni-carousel-react');
var CarouselSlider = React.createClass({
  render:function(){
    return (
    	<Carousel slidesToShow={3} cellAlign="left"  edgeEasing="linear"
			dragging = {false} speed={500}  framePadding="0px" cellSpacing={0}
			decorators={[]}>
			<img src="http://placehold.it/1000x400&text=slide1"/>
	        <img src="http://placehold.it/1000x400&text=slide2"/>
	        <img src="http://placehold.it/1000x400&text=slide3"/>
	        <img src="http://placehold.it/1000x400&text=slide4"/>
	        <img src="http://placehold.it/1000x400&text=slide5"/>
	        <img src="http://placehold.it/1000x400&text=slide6"/>
    	</Carousel>
    	);
  }
});
React.render(<CarouselSlider/>,document.getElementById('main'));
