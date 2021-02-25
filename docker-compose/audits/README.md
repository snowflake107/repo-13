# Frontegg Audits hybrid docker compose

### Getting started
* Most of the configuration is already ready to go
Usually there is no need to change `.common.env`. All you have to do is enter the relevant params under `.env` file
* Note that the *docker-compose* file doesn't include infra requirements. You need to add *MySQL* & *Kafka* in order to make everything work. We assume that you already have an infra ready to go!
* Don't forget to link the networks
* `docker-compose up -d`

