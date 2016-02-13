module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var
    _ = require('lodash'),
    paths = {
      src: 'src',
      test: 'test',
      dist: 'dist'
    },
    uglifyConf = {
      expand: true,
      cwd: paths.dist, // 'dist' when using concat, else 'src/'
      dest: paths.dist,
      ext: '.min.js'
    };

  //grunt.option('verbose', true);
  grunt.initConfig({
    bwr: grunt.file.readJSON('bower.json'),
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              paths.dist + '/**/*'
            ]
          }
        ]
      },
      coverage: 'test/coverage'
    },
    concat: {
      options: {
        sourceMap: true
      },
      dist: {
        src: [
          paths.src + '/afModule.js',
          paths.src + '/*.js'
        ],
        dest: paths.dist + '/<%= bwr.name %>.js'
      },
      bootstrap: {
        src: [
          paths.src + '/bootstrap/afModule.js',
          paths.src + '/bootstrap/*.js'
        ],
        dest: paths.dist + '/<%= bwr.name %>-bootstrap.js'
      }
    },
    coverage: {
      dist: {
        options: {
          thresholds: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
          },
          dir: 'coverage',
          root: 'test'
        }
      }
    },
    githooks: {
      all: {
        'pre-commit': 'default'
      }
    },
    jscs: {
      options: {
        config: './.jscsrc'
      },
      src: {
        src: paths.src + '/**/!(templateCache)*.js'
      },
      test: {
        src: paths.test + '/spec/{,**/}*.js'
      },
      config: {
        src: ['*.js', paths.test + '/{,!(spec)}/*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      src: {
        src: paths.src + '/**/!(templateCache)*.js'
      },
      test: {
        options: {
          jshintrc: paths.test + '/.jshintrc'
        },
        src: paths.test + '/spec/{,*/}*.js'
      },
      config: {
        src: ['*.js', paths.test + '/{,!(spec)}/*.js']
      }
    },
    karma: {
      unit: {
        configFile: paths.test + '/karma.conf.js',
        singleRun: true
      }
    },
    ngAnnotate: {
      dist: {
        files: {
          'dist/<%= bwr.name %>.js': paths.dist + '/<%= bwr.name %>.js',
          'dist/<%= bwr.name %>-bootstrap.js': paths.dist + '/<%= bwr.name %>-bootstrap.js'
        }
      }
    },
    ngtemplates: {
      options: {
        module: 'angularFormMessages'
      },
      bootstrap: {
        src: 'templates/bootstrap/*.html',
        dest: paths.src + '/bootstrap/templateCache.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true
      },
      dist: _.extend({
        src: '<%= bwr.name %>.js'
      }, uglifyConf),
      bootstrap: _.extend({
        src: '<%= bwr.name %>-bootstrap.js'
      }, uglifyConf)
    }
  });

  grunt.registerTask('test', [
    'karma',
    'coverage'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'jscs',
    'test',
    'build'
  ]);
};
