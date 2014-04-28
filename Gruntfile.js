(function() {

    'use strict';
  var accessAllow, livereload_port, lrSnippet, mountFolder;

  livereload_port = 35729;

  lrSnippet = require('connect-livereload')({
    port: livereload_port
  });

  accessAllow = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    return next();
  };

  mountFolder = function(connect, dir) {
    return connect["static"](require('path').resolve(dir));
  };


module.exports = function (grunt) {
  var  yeomanConfig;
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  yeomanConfig = {
      app: 'app',
      dist: 'dist'
    };

    // Define the configuration for all the tasks
  grunt.initConfig({
      less: {
        development: {
          files: {
            '.tmp/styles/hiin.css': '<%= yeoman.app %>/styles/hiin.less'
          }
        }
      },
    // Project settings
    yeoman: yeomanConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
        coffee: {
          files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
          tasks: ['coffee:dist', 'concat:server'],
          options: {
            livereload: false
          }
        },
        less: {
          files: ['<%= yeoman.app %>/styles/**/*.less'],
          tasks: 'less',
          options: {
            livereload: false
          }
        },
        scripts: {
          files: '.tmp/scripts/all.js'
        },
        imgs: {
          files: '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        },
        styles: {
          files: ['{.tmp,<%= yeoman.app %>}/styles/**/*.css']
        },
        html: {
          files: ['{<%= yeoman.app %>,.tmp}/views/*.html', '{<%= yeoman.app %>,.tmp}/index.html']
        },
        jade: {
          files: ['<%= yeoman.app %>/views/**/*.jade', '<%= yeoman.app %>/index.jade'],
          tasks: 'jade',
          options: {
            livereload: false
          }
        },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
        options: {
          livereload: true
        },
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: '*',
        bast: 'dist'
      },
      livereload: {
        options: {
            middleware: function(connect) {
              return [lrSnippet, mountFolder(connect, '.tmp'), mountFolder(connect, yeomanConfig.app)];
            }
        }
      }
    },
    autoprefixer: {
        options: {
          browsers: ['last 1 version']
        },
        dist: {
          files: [
            {
              expand: true,
              cwd: '.tmp/styles/',
              src: '**/*.css',
              dest: '.tmp/styles/'
            }
          ]
        }
      },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    coffee: {
        dist: {
          files: [
            {
              '.tmp/scripts/app.js': '<%= yeoman.app %>/scripts/app.coffee',
              '.tmp/scripts/controllers.js': '<%= yeoman.app %>/scripts/controllers/*.coffee',
              '.tmp/scripts/directives.js': '<%= yeoman.app %>/scripts/directives/*.coffee',
              '.tmp/scripts/kbd_event.js': '<%=yeoman.app%>/scripts/kbd_event.coffee'
            }, {
              expand: true,
              cwd: '<%= yeoman.app %>/scripts/services',
              src: '**/*.coffee',
              dest: '.tmp/scripts/services',
              ext: '.js'
            }
          ]
        }
      },
    concat: {
        server: {
          files: [
            {
              ".tmp/scripts/services.js": ['app/scripts/services/services.js', '.tmp/scripts/services/*.js'],
              ".tmp/scripts/all.js": ['.tmp/scripts/services.js', '.tmp/scripts/app.js', '.tmp/scripts/directives.js', '.tmp/scripts/controllers.js', '<%= yeoman.app %>/scripts/bootstrap.js']
            }
          ]
        }
      },
      jade: {
        compile: {
          files: [
            {
              expand: true,
              cwd: '<%= yeoman.app %>/views/',
              src: '**/*.jade',
              dest: '.tmp/views/',
              ext: '.html'
            }, {
              '.tmp/index.html': '<%= yeoman.app %>/index.jade'
            }
          ]
        }
      },
    'bower-install': {
      app: {
        html: '<%= yeoman.app %>/index.html',
        ignorePath: '<%= yeoman.app %>/'
      }
    },
    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
          files: [
            {
              expand: true,
              cwd: '.tmp',
              src: '**',
              dest: '<%= yeoman.dist %>'
            }, {
              expand: true,
              cwd: '<%= yeoman.app %>/',
              src: '{,**/}*.{html,css,js}',
              dest: '<%= yeoman.dist %>/'
            }, {
              expand: true,
              cwd: '<%= yeoman.app %>/',
              src: 'images/**',
              dest: '<%= yeoman.dist %>/'
            }, {
              expand: true,
              cwd: '<%= yeoman.app %>/',
              src: 'bower_components/**',
              dest: '<%= yeoman.dist %>/'
            }, {
              expand: true,
              cwd: '<%= yeoman.app %>/',
              src: 'res/**',
              dest: '<%= yeoman.dist %>/'
            }, {
              expand: true,
              cwd: "<%= yeoman.app %>/",
              src: "scripts/l10n/*.json",
              dest: "phonegap/platforms/ios/www"
            }
          ]
      },
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
        server: ['coffee:dist', 'less','jade'],
        dist: ['coffee', 'less','jade']
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bower-install',
      'concurrent:server',
      'concat',
        'connect:livereload',
      'watch'
    ]);
  });
    grunt.registerTask('server', ['clean:server', 'concurrent:server', 'concat', 'connect:livereload', 'watch']);
    grunt.registerTask('build', ['clean:dist', 'concurrent:dist', 'concat', 'autoprefixer', 'copy:dist']);
  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
}).call(this);
