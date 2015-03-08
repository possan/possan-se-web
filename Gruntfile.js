module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.initConfig({

    sass: {
      template: {
        src: '_templates/possan/blocky.scss',
        dest: '_templates/possan/blocky.css'
      },
      template2: {
        src: '_templates/possan/unsemantic.scss',
        dest: '_templates/possan/unsemantic.css'
      }
    },

    exec: {
      build: {
        cmd: 'node bin/generate.js'
      }
    },

    watch: {
      sass: {
        files: [
          '_templates/possan/*.scss',
        ],
        tasks: [
          'sass',
          'exec:build',
        ]
      },
      content: {
        files: [
          'bin/**/*.js',
          'lib/**/*.js',
          '_sites/**',
          '_static/**',
          '_content/**',
          '_templates/**/*.html',
          '_templates/**/*.css',
        ],
        tasks: [
          'exec:build'
        ]
      },
      output: {
        files: ['output/**/*'],
        options: {
          livereload: true,
          spawn: false,
        },
      },
    },

  });

}