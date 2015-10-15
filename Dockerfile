FROM node:0.10-onbuild
EXPOSE 4000

RUN apt-get -y update
RUN apt-get -y install ruby-full
RUN gem install sass
RUN npm install -g grunt-cli
