define( [], function(){
	"use strict";

	var TipovackaMatch = function( player, opponent, position, container ) {
		this.buffer = 0;
		this.container = container;
		this.checked = false;
		this.id = Math.floor( Math.random() * 100000 ).toString();
		this.match = $('<div class="match"/>');
		this.score = this.points = [ 0, 0 ];
		this.target = [ Ringier.Tipovacka.DataModel[ position ][ player ], 
						Ringier.Tipovacka.DataModel[ position ][ opponent ] ];

		this.init();
	};

	TipovackaMatch.prototype = {
		init: function() {
			this.buildControls();
			this.appendMatchToContainer();
			this.appendListener();
		},

		buildControls: function() {
			var sign;
			var score = $( '<span class="score">'+ this.score[0] + ' : ' + this.score[1] + '</span>' );
			var extension = $( '<label><input disabled type="checkbox" /> v prodlouzeni</label>' );

			this.match.append( score );

			for ( var i = 0; i < 4; i++ ) {
				this.match.append( '<button class="btn-'+ i +'">' + ( ( i % 2 ) ? '-' : '+' ) + '</span>' );
			}

			this.match.append( extension );
		},

		appendMatchToContainer: function() {
			this.match.prepend( '<div><span data-id="player"/>' + this.target[0].name + ' ' + this.target[1].name + '</div>' );
			this.container.append( this.match );
		},

		appendListener: function() {
			var that = this;

			this.match.on( 'click', function(e) {
				var el = e.target.nodeName.toLowerCase();

				if ( el === 'button' ) {
					that.activateMatch();
					that.adjustScore( e );
					that.sendMatch();
				}
				if ( el === 'input' ) {
					that.checked = !that.checked;
					that.sendMatch();
				}
			});
		},

		activateMatch: function() {
			$( '.active.match' ).removeClass( 'active' );
			this.match.addClass( 'active' );
		},

		toggleCheckbox: function( flag ) {
			this.checkbox = this.checkbox || this.match.find( 'input[ type="checkbox" ]' );
			this.checkbox.prop({ disabled: ( flag ) ? '': 'disabled' });

			if ( !flag ) {
				this.checked = false;
				this.checkbox.is( ':checked' ) && this.checkbox.prop( 'checked', '' );
			}
		},

		checkScore: function() {
			return ( Math.abs( this.score[0] - this.score[1] ) === 1 ) ? true : false;
		},

		adjustScore: function( event ) {
			var pos = 0;
			var target = $( event.target );
			var state = parseInt( target.attr( 'class' ).substr( 4, 5 ), 10 );

			for ( var i = 0; i < 4; i++ ) {
				if ( state === i ) {
					state > 1 && ( pos = 1 );

					if ( state % 2 ) {
						if ( this.score[ pos ] !== 0 ) this.score[ pos ] -= 1;
					} else {
						this.score[ pos ] += 1;
					}
				}
			}
			this.match.find( '.score' ).text( this.score[0] + ' : ' + this.score[1] );
			( this.checkScore() ) ? this.toggleCheckbox( true ) : this.toggleCheckbox();
		},

		awardScore: function( player, opponent ) {
			var j, k;

			for ( var i = 0; i < this.target.length; i++ ) {

				if ( i % 2 ) {
					j = 1; k = 0; // opponent, j give, k get
				} else {
					j = 0; k = 1; // player, j give, k get
				}
				
				console.log( this.target[i].name, 'obj:', this.target[i].score, 'score:', this.score[j], 'buffer:', this.buffer );

				if ( this.target[i].score.give > this.score[j] ) {

					//console.log('if');
					if ( this.score[j] === this.buffer ) {
						console.log( this.target[i].name, ' is the evil.');
						this.target[i].score.get += 1;
						continue;
					}
					this.buffer = this.score[j];
					this.target[i].score.give += 1;
				} else {
					//console.log('else');
					this.target[i].score.give = this.score[j];
					this.target[i].score.get = this.score[k];
				}

			}
			console.log('----');
		},

		sendMatch: function() {
			$.event.trigger({ type: 'modelUpdate', message: { id: this.id, target: this.target, score: this.score, chkbox: this.checked } });
		}
	};

	return TipovackaMatch;
});