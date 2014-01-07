define( [ 'data-tymy', 'data-matches', 'tipovacka-tables' ], function( dataTymy, dataMatches, TipovackaTables ) {
	"use strict";

	window.Ringier.Tipovacka = window.Ringier.Tipovacka || {};

	var Tipovacka = function() {
		Ringier.Tipovacka.DataModel = [];
		this.data = dataTymy;
		this.matches = dataMatches;
		this.tip = $( '<div id="tipovacka"/>' );

		console.log(this.matches);
		this.init();
	};

	Tipovacka.prototype = {
		init: function() {
			this.appendWrapper();
			this.distribute();
		},

		appendWrapper: function() {
			$( 'body' ).append( this.tip );
		},

		jsonToArray: function( json ) {
			var arr = [];

			for ( var prop in json ) {
				if ( json.hasOwnProperty( prop ) ) {
					var o = json[ prop ];

					for ( var item in o ) {
						if ( !isNaN( o[ item ] ) ) {
							o[ item ] = parseInt( o[ item ], 10 );
						}
						if ( typeof o[ item ] == 'object' ) {
							for ( var property in o[ item ] ) {
								o[ item ][ property ] = parseInt( o[ item ][ property ], 10 );
							}
						}
					} 
					arr.push( json[ prop ] );
				}
			}
			return arr;
		},

		distribute: function() {
			var i = 0;

			for ( var prop in this.data ) {
				Ringier.Tipovacka.DataModel.push( this.jsonToArray( this.data[ prop ] ) );
				new TipovackaTables( i, this.tip, this.matches[i] );

				i++;
			}
		}
	};

	return Tipovacka;
});