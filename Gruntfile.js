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
      },
      template3: {
        src: 'testbed/blocky.scss',
        dest: 'testbed/blocky.css'
      }
    },

    exec: {
      load: { cmd: 'node possan-load.js' },
      build: { cmd: 'node possan-build.js' },
      save: { cmd: 'node possan-save.js' }
    },

    watch: {
      sass2: {
        files: [
          'testbed/*.scss',
        ],
        tasks: [
          'sass',
        ]
      },
      sass: {
        files: [
          '_templates/possan/*.scss',
        ],
        tasks: [
          'sass',
          'exec:build',
          'exec:save'
        ]
      },
      contentfiles: {
        files: [
          '*.js',
          'tool/**/*.js',
          'tool/**/*.js',
          '_content/**',
        ],
        tasks: [
          'exec:load'
        ]
      },
      contentindex: {
        files: [
          '*.js',
          'tool/**/*.js',
          'tool/**/*.js',
          '_temp/content.json',
        ],
        tasks: [
          'exec:build'
        ]
      },
      outputindex: {
        files: [
          '*.js',
          'tool/**/*.js',
          'tool/**/*.js',
          '_static/**',
          '_temp/output.json'
        ],
        tasks: [
          'exec:save'
        ]
      },
      template: {
        files: [
          '*.js',
          '*.json',
          'tool/**/*.js',
          'tool/**/*.js',
          '_templates/**',
        ],
        tasks: [
          'exec:build',
          'exec:save'
        ]
      },
      outputfiles: {
        files: ['output/**/*'],
        options: {
          livereload: true,
          spawn: false,
        },
      },
    },

  });

}