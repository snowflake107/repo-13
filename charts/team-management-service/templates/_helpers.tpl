{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "team-management-service.hostname" -}}
{{- if .Values.ingress.hostnameOverride -}}
{{- .Values.ingress.hostnameOverride | trimSuffix "-" -}}
{{- else -}}
{{- printf "api-%s.dev.frontegg.com" .Release.Name | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Expand the name of the chart.
*/}}
{{- define "team-management-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "team-management-service.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "team-management-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels includes selectorLabels
*/}}
{{- define "team-management-service.labels" -}}
helm.sh/chart: {{ include "team-management-service.chart" . }}
{{ include "team-management-service.selectorLabels" . }}
app.frontegg.io/version: {{ .Chart.Version | quote }}
app.frontegg.io/managed-by: {{ .Release.Service }}
app.frontegg.com/appVersion: {{ .Values.appVersion | quote }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "team-management-service.selectorLabels" -}}
app.frontegg.com/name: {{ include "team-management-service.name" . }}
app.frontegg.com/instance: {{ .Release.Name }}
{{- end -}}
