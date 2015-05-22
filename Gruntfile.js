var config = {};

config.browserify = {
    dist: {
        files: {
            'public/assets/js/bundle.js': ['app/views/assets/js/**/*.js']
        }
    }
}

config.copy = {
    images: {
        files: [{
            expand: true, 
            src: ['app/views/assets/img/**'], 
            dest: 'public/assets/img/', 
            filter: 'isFile'
        }]
     },
     fonts: {
        files: [{
            expand: true, 
            flatten: true,
            src: [
                'app/views/assets/fonts/**/*.*'
            ],
            dest: 'public/assets/fonts/',
            filter: 'isFile'
        }]
     },
     styles: {
        files: [{
            expand: true, 
            flatten: true,
            src: [
                'app/views/assets/css/*.css',
                'node_modules/catdown/styles/dist/catdown.css',
                'node_modules/purecss/build/pure-min.css'
            ],
            dest: 'public/assets/css/',
            filter: 'isFile'
        }]
     }
};

config.clean = {
    assets: ['public/assets/*/']
}

config.sass = {
    dist: {
        options: {
            trace: true
        },
        files: {
            'public/assets/css/main.css': 'app/views/assets/css/main.scss'
        }
    }
};

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(config);

    grunt.registerTask('default', ['clean', 'copy', 'browserify', 'sass']);
};
