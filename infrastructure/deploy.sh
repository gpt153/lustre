#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="lustre-prod"

echo "Deploying Lustre to k3s cluster..."

kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/cluster-issuer.yaml

helm upgrade --install lustre-api infrastructure/helm/api \
  --namespace "$NAMESPACE" \
  --wait --timeout 5m

helm upgrade --install lustre-web infrastructure/helm/web \
  --namespace "$NAMESPACE" \
  --wait --timeout 5m

echo "Deploy complete. Checking status..."
kubectl get pods -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"
