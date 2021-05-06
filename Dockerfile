FROM alpine:latest

ENV RSYSLOG_PORT=601 RSYSLOG_PROTOCOL=tcp RSYSLOG_TARGET=syslog

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 && \
    chmod +x /usr/local/bin/dumb-init

#RUN curl -s -L -o /etc/yum.repos.d/rsyslog.repo http://rpms.adiscon.com/v8-stable/rsyslog.repo
#RUN yum -y install rsyslog gettext && yum clean all

RUN apk add --no-cache rsyslog bash gettext

COPY rsyslog.conf.template /etc/rsyslog.conf.template
COPY start.sh /start.sh

RUN chmod +x /start.sh

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD /start.sh
