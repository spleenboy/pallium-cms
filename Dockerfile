FROM node:0.10-onbuild
EXPOSE 4000

RUN apt-get -y update
RUN apt-get -y install ruby-full
RUN gem install sass
RUN npm install -g grunt-cli

VOLUME /usr/src/app/

# To set up your own Docker image for a project with the structure of 
# ./root
#   - content
#   - pallium-config
# FROM spleenboy/pallium
# COPY ["content", "/usr/src/app/"]
# COPY ["pallium-config", "/usr/src/app"]
# ENV PALLIUM_CONFIG "./pallium-config/"
