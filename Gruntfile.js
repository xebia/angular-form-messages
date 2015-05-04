module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    src: require('./bower.json').appPath || 'src',
    test: 'test',
    dist: 'dist'
  };

  grunt.option('verbose', true);
  grunt.initConfig({
    option: { verbose: true },
    bwr: grunt.file.readJSON('bower.json'),
    paths: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= paths.src %>/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= paths.src %>/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    jscs: {
      options: {
        config: './.jscsrc'
      },
      all: {
        files: {
          src: ['<%= paths.src %>/{,**/}*.js']
        }
      },
      test: {
        src: ['test/{,**/}*.js']
      }
    },

    lintspaces: {
      options: {
        newline: true,
        newlineMaximum: 2,
        trailingspaces: true
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= paths.src %>/{,**/}*.js'
        ]
      },
      test: {
        src: [
          'test/{,**/}*.js'
        ]
      }
    },

    jsonlint: {
      src: '<%= paths.test %>/mock/**/*.json'
    },

    coverage: {
      dist: {
        options: {
          thresholds: {
            statements: 98,
            branches: 98,
            functions: 98,
            lines: 98
          },
          dir: 'coverage',
          root: 'test'
        }
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    clean: {
      files: [{
        dot: true,
        src: [
          '.tmp',
          '<%= paths.dist %>/{,*/}*',
          '!<%= paths.dist %>/.git{,*/}*'
        ],
        coverage: 'test/coverage'
      }]
    },

    wiredep: {
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath: /\.\.\//,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      }
    },

    concat: {
      dist: {
        files: {
          '<%= paths.dist %>/<%= bwr.name %>.js': '<%= paths.src %>/*.js'
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= paths.dist %>/<%= bwr.name %>.js': [
            '<%= paths.dist %>/<%= bwr.name %>.js'
          ]
        }
      }
    },

    ngAnnotate: {
      dist: {
        files: { 'dist/<%= bwr.name %>.js': 'dist/<%= bwr.name %>.js' }
      }
    }

  });

  grunt.registerTask('test', [
    'wiredep',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean',
    'wiredep',
    'concat',
    'ngAnnotate',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'jscs',
    'lintspaces',
    'jsonlint',
    'test',
    'build'
  ]);
};
