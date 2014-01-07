define( [ 'tipovacka-match' ], function( TipovackaMatch ) {
	"use strict";

	var TipovackaTables = function( position, wrapper, schedule ) {
		this.position = position;
		this.wrapper = wrapper;
		this.container = {};
		this.pool = [];
		this.matches = schedule || [];
		this.data = this.sortData( Ringier.Tipovacka.DataModel[ this.position ] );		

		this.init();
	};

	TipovackaTables.prototype = {
		init: function() {
			this.renderWrapper();
			this.renderTable();
			this.appendMatches();
			this.listenOnModelUpdate();
		},

		listenOnModelUpdate: function() {
			var matchCollection = this.table.parents('.data-container');
			var that = this;

			$(document).on( 'modelUpdate', function( e ) { 
				if ( matchCollection.find( '.active.match' ).length ) {
					that.insertMatchIntoPool( e );
					that.awardPoints( e.message );
					that.renderTable();
				}
			});

			$(document).on( 'extraTime', function( e ) {
				that.awardPoints( e.message );
			});
		},

		insertMatchIntoPool: function( e ) {
			for ( var i = 0; i < this.pool.length; i++ ) {
				if ( this.pool[i].id === e.message.id ) return false;
			}
			this.pool.push( e.message );
		},

		pointCount: function( id, points ) {
			var that = this;

			for ( var i = 0; i < this.pool.length; i++ ) {
				if ( this.pool[i].id === id ) {
					return ( typeof points == 'object' ) ? this.pool[i].points = points : (function() {
						if ( !that.pool[i].points ) that.pool[i].points = [ 0, 0 ];

						for ( var j = 0; j < that.pool[i].points.length; j++ ) {
							if ( j === points ) return that.pool[i].points[j];
						}
					})();
				}
			}
		},

		calculatePoints: function( player, opponent, chkbox ) {
			var points;
			var basePoint = ( chkbox ) ? 2 : 3;

			if ( player > opponent ) {
				points = [ basePoint, 0 ];
			} else if ( player < opponent ) {
				points = [ 0, basePoint ];
			} else if ( player === opponent ) {
				points = [ 0, 0 ];
			}

			return points;
		},

		awardPoints: function( origin ) {
			var points, savedPoints, target;
			var that = this;
			var chkbox = origin.chkbox;
			var player = origin.score[0];
			var opponent = origin.score[1];

			console.log( origin );

			return ( null === 0 ) ? false : (function() {
				points = that.calculatePoints( player, opponent, chkbox );

				for ( var i = 0; i < points.length; i++ ) {
					savedPoints = that.pointCount( origin.id, i );
					target = origin.target[i].points;

					console.log(that.calculatePoints( player, opponent, chkbox ), savedPoints);

					if ( points[i] === 2 ) {
						origin.target[i].points -= 1;
					} else if ( points[i] === 3 && savedPoints === 2 ) {
						origin.target[i].points += 1;
					} else {
						if ( points[i] > savedPoints ) {
							origin.target[i].points += points[i];
						}
						if ( points[i] < savedPoints ) {
							origin.target[i].points -= savedPoints;
						}
					}
				}
				that.pointCount( origin.id, points );
				//that.awardScore( player, opponent );
			})();
		},

		renderTable: function() {
			this.sortData( this.data );
			this.table = $('<table/>');
			this.appendValues( this.table );
			this.container.find( 'table' ).remove();
			this.container.prepend( this.table );
		},

		renderWrapper: function() {
			this.container = $('<div class="data-container"/>');
			this.wrapper.append( this.container );
		},

		sortData: function( data ) {
			return data.sort( function( a, b ) {
				if ( a.points == b.points ) {
					var x = parseInt( a.score.give, 10 ) - parseInt( a.score.get, 10 );
					var y = parseInt( b.score.give, 10 ) - parseInt( b.score.get, 10 );

					if ( x == y ) {
						return a.iihf > b.iihf ? 1 : -1;
					}
					return x < y ? 1 : -1;
				}
				return a.points < b.points ? 1 : -1;
			});
		},

		appendValues: function( table ) {
			var _l = this.data.length;
			var theader = $( '<tr> <th>nazev</th> <th>v</th> <th>vp</th> <th>p</th> <th>pp</th> <th>skore</th>  <th>b</th> <th>iihf</th> </tr>' );

			for ( var i = 0; i < _l; i++ ) {
				var o = this.data[i];
				var row = $('<tr/>');

				for ( var prop in o ) {
					if ( o.hasOwnProperty( prop ) ) {
						if ( prop === 'code' ) {
							row.addClass( o[ prop ] );
							continue;
						}
						var value;
						var property = o[ prop ];

						if ( typeof property == 'object' ) {
							value = $('<td>'+ property.give +':'+ property.get +'</td>');
						} else {
							value = $('<td>'+ property +'</td>');
						}
						row.append( value );
					}
				}
				table.prepend( theader ).append( row );
			}
		},

		appendMatches: function() {
			for ( var i = 0; i < this.data.length; i++ ) {
				var player = this.data[i];
				var name = this.data[i].name;

				for ( var j = 0; j < this.data.length; j++ ) {
					if ( this.data[j].name != name ) {
						var opponent = this.data[j];
						var a, b;

						if ( j % 2 ) {
							a = i; b = j;
						} else {
							a = j; b = i;
						}

						if ( this.checkForDuplicateMatches( this.data[i].name, this.data[j].name ) ) {
							continue;	
						} else {
							this.matches.push([ this.data[i].name, this.data[j].name ]);
							new TipovackaMatch( a, b, this.position, this.container );
						}
					}
				}
			}
		},

		checkForDuplicateMatches: function( player, opponent ) {
			for ( var i = 0; i < this.matches.length; i++ ) {
				var a = this.matches[i][0];
				var b = this.matches[i][1];

				if ( a == player && b == opponent || a == opponent && b == player ) return true;
			}
		}
	};

	return TipovackaTables;
});