{{- define "lustre-umami.fullname" -}}
lustre-umami
{{- end }}

{{- define "lustre-umami.labels" -}}
app.kubernetes.io/name: umami
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
