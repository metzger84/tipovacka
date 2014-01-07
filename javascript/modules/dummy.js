define( [], function(){
	"use strict";

	var F = function(){
		this.v = 'foobar';
	};

	F.prototype = {
		foo: function() {
			console.log( this, 'bar' );
		},

		bar: function() {
			console.log( this, 'foo' );
		}
	};

	return F;
});