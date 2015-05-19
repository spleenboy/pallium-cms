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
            src: ['app/views/assets/css/*.css', 'node_modules/skeleton/css/*.css'],
            dest: 'public/assets/css/',
            filter: 'isFile'
        }]
     }
};

config.clean = {
    assets: ['public/assets/*/']
}

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(config);

    grunt.registerTask('default', ['clean', 'copy']);
};
