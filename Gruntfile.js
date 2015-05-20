var config = {};

config.copy = {
    images: {
        files: [{
            expand: true, 
            src: ['app/views/assets/img/**'], 
            dest: 'public/assets/img/', 
            filter: 'isFile'
        }]
     },
     styles: {
        files: [{
            expand: true, 
            flatten: true,
            src: [
                'app/views/assets/css/*.css',
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
    files: [{
        expand: true,
        src: 'app/views/assets/css/*.scss',
        dest: 'public/assets/css/',
        ext: '.css'
    }]
};

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(config);

    grunt.registerTask('default', ['clean', 'copy', 'sass']);
};
