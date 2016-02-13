module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var paths = {
    src: 'src',
    test: 'test',
    dist: 'dist'
  };

  //grunt.option('verbose', true);
  grunt.initConfig({
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        commitMessage: 'Bump version to v%VERSION%',
        push: false
      }
    },
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
      all: {
        src: [
          'Gruntfile.js',
          paths.src + '/**/!(templateCache)*.js'
        ]
      },
      test: {
        src: ['test/spec/{,**/}*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          paths.src + '/**/!(templateCache)*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },
    jsonlint: {
      src: paths.test + '/mock/**/*.json'
    },
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
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
    'jsonlint',
    'test',
    'build'
  ]);
};
