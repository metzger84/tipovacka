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
		},

		updateChkboxStateInPool: function( e ) {

		},

		insertMatchIntoPool: function( e ) {
			var poolChkbox, msgChkbox;

			for ( var i = 0; i < this.pool.length; i++ ) {
				if ( this.pool[i].id === e.message.id ) {
					if ( this.pool[i].chkbox !== e.message.chkbox ) this.pool[i].chkbox = !this.pool[i].chkbox;
					return false;
				}
			}
			this.pool.push( e.message );
		},

		poolPointCount: function( id, points ) {
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
			var basePoint = ( chkbox ) ? [ 2, 1 ] : [ 3, 0 ];

			if ( player < opponent ) {
				basePoint.reverse();
			} else if ( player === opponent ) {
				basePoint = [ 0, 0 ];
			}

			return basePoint;
		},

		awardPoints: function( teams ) {
			var points, savedPoints, target;
			var that = this;
			var chkbox = teams.chkbox;
			var player = teams.score[0];
			var opponent = teams.score[1];

			return ( null === 0 ) ? false : (function() {
				points = that.calculatePoints( player, opponent, chkbox );

				for ( var i = 0; i < points.length; i++ ) {
					savedPoints = that.poolPointCount( teams.id, i );
					target = teams.target[i].points;

					if ( points[i] === 2 ) {
						teams.target[i].points -= 1;
					} else if ( points[i] === 3 && savedPoints === 2 ) {
						teams.target[i].points += 1;
					} else {
						if ( points[i] > savedPoints ) {
							teams.target[i].points += points[i];
						}
						if ( points[i] < savedPoints ) {
							teams.target[i].points -= savedPoints;
						}
					}
				}
				that.poolPointCount( teams.id, points );
				that.awardScore( teams );
			})();
		},

		awardScore: function( teams ) {
			var give, get;
			this.teamsId = this.teamsId || teams.id;
			this.cache = {};

			for ( var i = 0; i < this.pool.length; i++ ) {
				for ( var j = 0; j < 2; j++ ) {
					if ( j % 2 ) {
						give = 1; get = 0;
					} else {
						give = 0; get = 1;
					}
					this.addScoreToCache( this.pool[i].target[j].code, this.pool[i].score[give], this.pool[i].score[get], this.pool[i].chkbox );
				}
			}
			this.updateScoreFromCache();
		},

		addScoreToCache: function( target, give, get, chkbox ) {
			var win, loss, winstime, losstime;
			win = loss = winstime = losstime = 0;

			if ( chkbox ) {
				winstime = ( give > get ) ? 1 : 0;
				losstime = ( give < get ) ? 1 : 0;
			} else {
				win = ( give > get ) ? 1 : 0;
				loss = ( give < get ) ? 1 : 0;
			} 

			if ( !this.cache[ target ] ) {
				this.cache[ target ] = [ give, get, win, loss, winstime, losstime ];
			} else {
				this.cache[ target ][0] += give;
				this.cache[ target ][1] += get;
				this.cache[ target ][2] += win;
				this.cache[ target ][3] += loss;
				this.cache[ target ][4] += winstime;
				this.cache[ target ][5] += losstime;
			}
		},

		updateScoreFromCache: function() {
			for ( var prop in this.cache ) {
				for ( var i = 0; i < this.data.length; i++ ) {
					if ( this.data[i].code == prop ) {
						this.data[i].score.give = this.cache[ prop ][0];
						this.data[i].score.get = this.cache[ prop ][1];
						this.data[i].wins = this.cache[ prop ][2];
						this.data[i].loss = this.cache[ prop ][3];
						this.data[i].winstime = this.cache[ prop ][4];
						this.data[i].losstime = this.cache[ prop ][5];
					}
				}
			}
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