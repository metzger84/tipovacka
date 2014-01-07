/**
  * @desc individual grunt plugin configurations.
*/

module.exports = function( grunt ) {
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),

		watch: {
			options: {
				livereload: true
			},

			js: {
				files: [ 'javascript/*.js', 'javascript/modules/*.js' ],
				tasks: 'jshint'
			},

			css: {
				files: 'css/less/*.less',
				tasks: 'less:development'
			},

			html: {
				files: 'index.html'
			}
		},

		jshint: {
			files: 'javascript/**/*.js',
			options: {
				expr: true,
				ignores: 'javascript/lib/*.js',
				loopfunc: true
			}
		},

		less: {
			development: {
				options: {
					paths: 'css'
				},

				files: {
					'css/main.css': 'css/less/main.less'
				}
			},

			production: {
				options: {
					paths: 'css',
					cleancss: true
				},

				files: {
					'css/main.css': 'css/less/main.less'
				}
			}
		}
	});

	grunt.registerTask( 'default', [ 'watch' ] );
}