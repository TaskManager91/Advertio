module.exports = function(grunt) {

  var modRewrite = require('connect-modrewrite');

  //Grunt init
  grunt.initConfig({
    concat: {
      appjs: {
        src: ['js/*.js'],
        dest: 'dist/js/app.js',
      },
      libjs: {
        src: ['js/libs/angular.js', 'js/libs/angular-cookies.js', 'js/libs/angular-route.js', 'js/libs/angular-resource.js', 'js/libs/leaflet.js', 'js/libs/ui-bootstrap-tpls-1.3.3.js'],
        dest: 'dist/js/libs.js',
      },
      css: {
        src: ['css/leaflet.css','css/bootstrap.css','css/font-awesome.css','css/rdash.css'],
        dest: 'dist/css/styles.css',
      },
    },
    uglify: {
      appjs: {
        files: {
          'dist/js/app.min.js': ['dist/js/app.js']
        }
      },
      libjs: {
        files: {
          'dist/js/libs.min.js': ['dist/js/libs.js']
        }
      },
    },
    cssmin: {
      target: {
        files: {
          'dist/css/styles.min.css': ['dist/css/styles.css']
        }
      },
    },
    watch: {
      appjs: {
        files: ['js/*.js'],
        tasks: ['concat:appjs'],
      },
      css: {
        files: ['css/*.css'],
        tasks: ['concat:css'],
      },
    },
    connect: {
      server: {
        options: {
          port: 1234,
          base: './',
          open: true,
          middleware: function(connect, options, middlewares) {
            // enable Angular's HTML5 mode
            middlewares.unshift(modRewrite(['^[^\\.]*$ /index.html [L]']));
            return middlewares;
          }
        }
      },
    },
  });

  //Check grunt
  grunt.registerTask('test', function(){
    console.log("Grunt installed");
  });


  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
 // grunt.loadNpmTasks('grunt-connect-proxy');

  grunt.registerTask('default', ['test','concat','watch']);
  grunt.registerTask('minify', ['test','uglify:appjs','uglify:libjs','cssmin']);
  grunt.registerTask('server', ['test','connect:server', 'concat','watch']);

};