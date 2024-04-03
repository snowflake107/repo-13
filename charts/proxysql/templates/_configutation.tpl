{{- define "proxysql.cnf" -}}
    admin_variables=
    {
      {{- if not .cluster.enabled }}
      admin_credentials="{{ .admin.user }}:{{ .admin.password }}"
      {{- else }}
      admin_credentials="{{ .admin.user }}:{{ .admin.password }};{{ .cluster.user }}:{{ .cluster.password }}"
      cluster_username="{{ .cluster.user }}"
      cluster_password="{{ .cluster.password }}"
      {{- end }}
      stats_credentials="{{ .web.user }}:{{ .web.password }}"
      mysql_ifaces="0.0.0.0:{{ .port }}"
      restapi_enabled=true
      web_enabled={{ .web.enabled }}
      web_port={{ .web.port }}
    }
    mysql_variables=
    {
      interfaces="0.0.0.0:{{ .mysql.port }}"
      connect_timeout_server=1500
      connect_timeout_server_max=10000
      connection_max_age_ms={{ .mysql.connectionMaxAgeMS }}
      default_max_latency_ms=1500
      default_query_timeout=86400000
      long_query_time=5000
      max_allowed_packet=1073741824
      max_connections={{ .mysql.maxConnections }}
      ping_timeout_server=500
      query_cache_size_MB={{ .mysql.queyCacheSizeMB }}
      query_retries_on_failure={{ .mysql.queryRetriesOnFailure }}
      server_version="{{ .mysql.version }}"
      shun_on_failures=5
      shun_recovery_time_sec=9
      stacksize=1048576
      threads=4
      threshold_query_length=524288
      threshold_resultset_size=4194304
      wait_timeout={{ int .mysql.waitTimeout }}
      monitor_enabled={{ .monitor.enabled }}
      {{- if .monitor.enabled }}
      monitor_connect_interval=120000
      monitor_connect_timeout=1000
      monitor_username="{{ required "monitor user name is required!" .monitor.user }}"
      monitor_password="{{ required "monitor password is required!" .monitor.password }}"
      monitor_ping_interval=8000
      monitor_ping_max_failures=3
      monitor_ping_timeout=1500
      monitor_query_interval=60000
      monitor_query_timeout=1500
      monitor_read_only_interval=1000
      monitor_read_only_max_timeout_count=3
      monitor_read_only_timeout=1500
      monitor_replication_lag_interval={{ .monitor.replicationLagInterval }}
      monitor_replication_lag_timeout={{ .monitor.replicationLagTimeout }}
      monitor_slave_lag_when_null={{ .monitor.slaveLagWhenNull }}
      monitor_threads_max=128
      monitor_threads_min=8
      monitor_threads_queue_maxsize=128
      monitor_timer_cached=true
      {{- if .mysql.galera.enabled }}
      monitor_writer_is_also_reader={{ .mysql.galera.writerAsReader }}
      {{- else }}
      monitor_writer_is_also_reader={{ .monitor.writerAsReader }}
      {{- end }}
      {{- if .mysql.galera.enabled }}
      {{- if not .mysql.slave.enabled }}
      monitor_galera_healthcheck_interval=5000
      monitor_galera_healthcheck_max_timeout_count=3
      monitor_galera_healthcheck_timeout=1500
      {{- end }}
      {{- end }}
      {{- end }}
    }
    {{- if .cluster.enabled }}
    proxysql_servers=
    (
      {{- $fullname := include "proxysql.fullname" . -}}
      {{- $namespace := .Release.Namespace -}}
      {{- $replicaCount := (int .Values.replicaCount) -}}
      {{- $proxysqlPort := .port -}}
      {{- range $index, $element := until $replicaCount }}
      {
        hostname="{{- $fullname -}}-{{- (toString $index) -}}.{{- $fullname -}}.{{- $namespace -}}"
        port={{ $proxysqlPort }}
      }{{- if lt (add1 $element) $replicaCount -}},{{- end -}}
      {{- end }}
    )
    {{- end }}
    {{- if .mysql.servers }}
    mysql_servers=
    (
      {{- $totalServers := (len .mysql.servers) -}}
      {{- range $index, $element := .mysql.servers }}
      {
        hostgroup_id={{- if or $element.isWriter (kindIs "invalid" $element.isWriter) }}1{{- else }}2{{- end }}
        hostname="{{ required "mysql server's hostname is required!" $element.hostname }}"
        port={{ $element.port | default 3306 }}
        weight={{ $element.weight | default 1000 }}
        compression={{ (int $element.compression) | default 0 }}
        max_connections={{ $element.maxConnections | default 1000 }}
        max_replication_lag={{ $element.maxReplicationLag | default 0 }}
        use_ssl=0
      }{{- if lt (add1 $index) $totalServers -}},{{- end -}}
      {{- end }}
    )
    {{- end }}
    {{- if .mysql.slave.enabled }}
    {{- if not .mysql.galera.enabled }}
    mysql_replication_hostgroups=
    (
      {
        writer_hostgroup=1
        reader_hostgroup=2
        check_type="{{ .mysql.slave.checkType }}"
      }
    )
    {{- end }}
    {{- end }}
    {{- if .mysql.galera.enabled }}
    {{- if not .mysql.slave.enabled }}
    mysql_galera_hostgroups=
    (
      {
        writer_hostgroup=1
        backup_writer_hostgroup=3
        reader_hostgroup=2
        offline_hostgroup=4
        active=1
        max_writers={{ .mysql.galera.maxWriters }}
        writer_is_also_reader={{ int .mysql.galera.writerAsReader }}
      }
    )
    {{- end }}
    {{- end }}
    {{- if .mysql.users }}
    mysql_users=
    (
      {{- $totalUsers := (len .mysql.users) -}}
      {{- range $index, $element := .mysql.users }}
      {
        username="{{ required "mysql username is required!" $element.username }}"
        password="{{ required "mysql passowrd is required!" $element.password }}"
        use_ssl=0
        default_hostgroup={{ (add1 (int $element.readOnly | default 0)) }}
        transaction_persistent=1
        active=1
        max_connections={{ $element.maxConnections | default 10000 }}
      }{{- if lt (add1 $index) $totalUsers -}},{{- end -}}
      {{- end }}
    )
    {{- end }}
    {{- if .mysql.readWriteSplit }}
    mysql_query_rules=
    (
      {
        rule_id=1
        active=1
        match_digest="^SELECT .* FOR UPDATE$"
        destination_hostgroup=1
        apply=1
      },
      {
        rule_id=2
        active=1
        match_digest="^SELECT"
        destination_hostgroup=2
        apply=1
      }
    )
    {{- end }}
{{- end }}
