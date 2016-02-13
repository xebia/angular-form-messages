module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var appConfig = {
    src: 'src',
    tmp: '.tmp',
    test: 'test',
    dist: 'dist'
  };

  //grunt.option('verbose', true);
  grunt.initConfig({
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
        tasks: ['newer:jshint:all']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      build: {
        files: ['<%= paths.src %>/{,*/}*.js'],
        tasks: ['default']
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
          '<%= paths.src %>/**/!(templateCache)*.js'
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
          src: ['<%= paths.src %>/**/!(templateCache)*.js']
        }
      },
      test: {
        src: ['test/spec/{,**/}*.js']
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

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '<%= paths.dist %>/**/*'
            ]
          }
        ]
      },
      coverage: 'test/coverage'
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

    ngtemplates: {
      options: {
        module: 'angularFormMessages'
      },
      bootstrap: {
        src: 'templates/bootstrap/*.html',
        dest: '<%= paths.src %>/bootstrap/templateCache.js'
      }
    },

    concat: {
      options: {
        sourceMap: true
      },
      dist: {
        src: [
          '<%= paths.src %>/afModule.js',
          '<%= paths.src %>/*.js'
        ],
        dest: '<%= paths.dist %>/<%= bwr.name %>.js'
      },
      bootstrap: {
        src: [
          '<%= paths.src %>/bootstrap/afModule.js',
          '<%= paths.src %>/bootstrap/*.js'
        ],
        dest: '<%= paths.dist %>/<%= bwr.name %>-bootstrap.js'
      }
    },

    uglify: {
      dist: {
        expand: true,
        cwd: 'dist/', // 'dist' when using concat, else 'src/'
        src: '<%= bwr.name %>.js',
        dest: 'dist',
        ext: '.min.js'
      },
      bootstrap: {
        expand: true,
        cwd: 'dist/', // 'dist' when using concat, else 'src/'
        src: '<%= bwr.name %>-bootstrap.js',
        dest: 'dist',
        ext: '.min.js'
      }
    },

    ngAnnotate: {
      dist: {
        files: {
          'dist/<%= bwr.name %>.js': 'dist/<%= bwr.name %>.js',
          'dist/<%= bwr.name %>-bootstrap.js': 'dist/<%= bwr.name %>-bootstrap.js'
        }
      }
    },

    githooks: {
      all: {
        'pre-commit': 'default'
      }
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        commitMessage: 'Bump version to v%VERSION%',
        push: false
      }
    }

  });

  grunt.registerTask('test', [
    'wiredep',
    'karma',
    'coverage'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'ngtemplates',
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
