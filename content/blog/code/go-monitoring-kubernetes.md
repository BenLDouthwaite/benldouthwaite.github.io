---
title: Go monitoring in Kubernetes.
date: "2022-02-14"
description: ""
---

Good monitoring is critical for managing resilient apps. I like the standarised approach to monitoring provided by Prometheus, this tutorial walks through setting up a simple Go app in Kubernetes, and iteratively adding monitoring with Prometheus and Grafana.

To follow along, you should make sure you already have [Go](https://go.dev/), [Docker](https://www.docker.com/), [Kubernetes](https://kubernetes.io/) and [Minikube](https://minikube.sigs.k8s.io) installed, and ideally have some base knowledge of the Go language, but this is not strictly required. I won't go into detail for every change, but will provide links to additional resources where appropriate.

Disclaimer: This post is intended as a learning exercise to better understand the moving parts, and is not production ready, nor do I claim any of the methods are best practice!

## Contents

- Setting up a Go "Hello, World!" app.
- Setting up a Prometheus server.
- Summary

## Setting up a Go "Hello, World!" app.

### Go App Server

We'll setup a Go server to monitor. For simplicity I will avoid using any additional libraries such as mux.

Create our new module

```shellsession
$ go mod init example.com/gomonitoring
```

And create our 'main.go'.

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", helloHandler)
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}
```

This is all we need for a functional server. We can run our code with

```shellsession
$ go run main.go
```

and verify the response with

```shellsession
$ curl localhost:8080
Hello, World!
```

### Prometheus Instrumentation

Similar to the official docs, [Instrumenting a Go application for Prometheus](https://prometheus.io/docs/guides/go-application/), we will setup a new handler to expose the metrics on a "/metrics" endpoint.

```go
package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	http.HandleFunc("/", helloHandler)
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}
```

will then import the prometheus dependency.

```shellsession
$ go mod tidy
```

Restart our app, and we can view our metrics

```shellsession
$ curl localhost:8080/metrics
TODO SHOW SNIPPET
```

### Dockerise the application.

Create a standard [Go Dockerfile](https://docs.docker.com/language/golang/build-images/)

```Dockerfile
FROM golang:1.16-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY *.go .

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
```

Build our image:

```shellsession
$ docker build -t go-hello .
```

Run our built image:

```shellsession
$ docker run -d -p 8080:8080 --name go-hello-container go-hello
```

Verify our metrics are being exported

```shellsession
$ curl localhost:8080/metrics
TODO SHOW SNIPPET
```

### Deploy to Kubernetes (minikube)

Start minikube

```shellsession
$ minikube start
```

Push our image to a docker repository (DockerHub).
You may need to login to allow pushing the image.

```shellsession
$ docker build -t benldouthwaite/go-hello .
...
Successfully tagged benldouthwaite/go-hello:latest

$ docker push benldouthwaite/go-hello
```

Now we can create our manifest files.

'deploy/app/deployment.yaml'

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-go-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: go-app
  template:
    metadata:
      labels:
        app: go-app
    spec:
      containers:
        - name: go-app-container
          image: benldouthwaite/go-hello
          resources:
            limits:
              memory: "128Mi"
              cpu: "500m"
          ports:
            - containerPort: 8080
```

'deploy/app/service.yaml'

```yaml
apiVersion: v1
kind: Service
metadata:
  name: go-hello-service
spec:
  selector:
    app: go-app
  ports:
    - port: 8080
      targetPort: 8080
  type: NodePort
```

Lets also create a Makefile, that will simplify our deployment scripts as the project grows.

```makefile
# Application
.PHONY: kubectl-deploy
kubectl-deploy:
	kubectl apply -f deploy/app/deployment.yaml
	kubectl apply -f deploy/app/service.yaml

# Docker
.PHONY: docker-push
docker-push:
	docker build -t benldouthwaite/go-hello:latest -f Dockerfile .
	docker push benldouthwaite/go-hello:latest
	docker rmi benldouthwaite/go-hello:latest
	docker system prune --volumes --force
```

And lets try deploying our app.

```
$ make deploy-application
```

Once the manifest changes have been applied, we can extract the local app url using minikube. Note, this can be different every time you run the app on minikube.

```shellsession
$ minikube service go-hello-service --url
http://192.168.49.2:30020
```

Opening the provided URL, we should be able to see our "Hello, World!" message, from our Go app running in Kubernetes. We can also view some application metrics being exposed at the {url}/metrics endpoint.

By now our file structure is as follows

```
.
├── deploy
│   └── app
│       ├── deployment.yaml
│       └── service.yaml
├── Dockerfile
├── go.mod
├── go.sum
├── main.go
└── Makefile
```

## Setting up a Prometheus Server

Prometheus used a pull model to scrape metrics from applications that expose data in the correct format. We can now setup a prometheus server in kubernetes to scrape the metrics being exposed by our Go app.

### Configure service accounts and roles

'deploy/monitor/service-account.yaml'

```yaml
apiVersion: v1
kind: ServiceAccount

metadata:
  name: monitor-service-account
  namespace: default
```

'deploy/monitor/cluster-role.yaml'

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole

metadata:
  name: monitor-cluster-role

rules:
  - apiGroups: [""]
    resources: ["services", "pods", "endpoints"]
    verbs: ["get", "watch", "list"]
  - nonResourceURLs: ["/metrics"]
    verbs: ["get"]
```

'deploy/monitor/cluster-role.binding.yaml'

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding

metadata:
  name: monitor-cluster-role-binding

roleRef:
  kind: ClusterRole
  name: monitor-cluster-role
  apiGroup: rbac.authorization.k8s.io

subjects:
  - kind: ServiceAccount
    name: monitor-service-account
    namespace: default
```

And lets update our Makefile to include a deploy command for the roles

```makefile
# Application
...

# Roles
.PHONY: deploy-roles
deploy-roles:
	kubectl apply -f deploy/monitor/service-account.yaml
	kubectl apply -f deploy/monitor/cluster-role.yaml
	kubectl apply -f deploy/monitor/cluster-role-binding.yaml
```

```shellsession
$ make deploy-roles
```

### Configure the Prometheus server deployment

'deploy/prometheus/config-map.yaml'

```yaml
apiVersion: v1
kind: ConfigMap

metadata:
  name: prometheus-config-map
  namespace: default

data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      scrape_timeout: 15s
    scrape_configs:
      - job_name: application-metrics
        metrics_path: /metrics
        kubernetes_sd_configs:
        - role: endpoints
        relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: namespace
        - source_labels: [__meta_kubernetes_service_name]
          action: replace
          target_label: service
```

'deploy/prometheus/deployment.yaml'

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: prometheus-deployment

spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: monitor-service-account
      containers:
        - name: prometheus
          image: prom/prometheus:latest
          resources:
            limits:
              cpu: "1000m" # 1 core
              memory: "1024Mi" # 1 GB
            requests:
              cpu: "500m"
              memory: "512Mi"
          ports:
            - name: http
              protocol: TCP
              containerPort: 9090
          volumeMounts:
            - name: config
              mountPath: /etc/prometheus/
            - name: storage
              mountPath: /prometheus/
      volumes:
        - name: config
          configMap:
            name: prometheus-config-map
        - name: storage
          emptyDir: {}
```

'deploy/prometheus/service.yaml'

```yaml
apiVersion: v1
kind: Service

metadata:
  name: prometheus-service
  namespace: default

spec:
  type: NodePort
  selector:
    app: prometheus
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 9090
```

Again, lets update out Makefile to include a deploy command for the prometheus server

```makefile
# Application
...

# Roles
.PHONY: deploy-roles
deploy-roles:
	kubectl apply -f deploy/monitor/service-account.yaml
	kubectl apply -f deploy/monitor/cluster-role.yaml
	kubectl apply -f deploy/monitor/cluster-role-binding.yaml
```

We can now get the URL for the prometheus server from minikube

```shellsession
$ minikube service prometheus-service --url
http://192.168.49.2:32543
```

and we can now query for the scraped data e.g. Querying 'go_info' to get assorted data on both our Go app and the prometheus service.

At this point, we have a Go app exposing some metrics that are being scraped into a prometheus server we can query.

Our file structure looks as follows

```
.
├── deploy
│   ├── app
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── monitor
│   │   ├── cluster-role-binding.yaml
│   │   ├── cluster-role.yaml
│   │   └── service-account.yaml
│   └── prometheus
│       ├── config-map.yaml
│       ├── deployment.yaml
│       └── service.yaml
├── Dockerfile
├── go.mod
├── go.sum
├── main.go
└── Makefile
```

## Exposing custom prometheus metrics

Prometheus gives us a lot of metrics by default, but we're specifically interested in our endpoint.

We will now add a custom 'totalRequests' [Counter](https://prometheus.io/docs/concepts/metric_types/#counter) to track the number of requests we receive. To trigger our counter's increment, we will create a Prometheus Middleware layer for requests. If you are unfamilar with middleware in Go, I recommend [Alex Edwards' Tutorial](https://www.alexedwards.net/blog/making-and-using-middleware)

After making all the required changes, our 'main.go' will looks as follows

```go
package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// 1. Create our Counter
var totalRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Number of get requests",
	},
	[]string{"path"},
)

// 2. Create an init block to be run at startup, and register our counter
func init() {
	prometheus.Register(totalRequests)
}

// 3. Define our prometheus middleware to delegate to the wrapper function, and increment our counter
func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		totalRequests.WithLabelValues(r.URL.Path).Inc()
	})
}

func main() {

    // 4. Extract our hello handler, and wrap in our newly defined middleware
	hello := http.HandlerFunc(helloHandler)
	http.Handle("/", prometheusMiddleware(hello))

	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}
```

Lets test the change is exporting data as expected locally

```shellsession
$ go run main.go
```

```shellsession
$ curl -s localhost:8080/metrics | grep http_requests_total
$ curl -s localhost:8080
Hello, World!
$ curl -s localhost:8080/metrics | grep http_requests_total
# HELP http_requests_total Number of get requests
# TYPE http_requests_total counter
http_requests_total{path="/"} 1
```

The request is successfully recognised and increments out counter.

## Measuring Latency and Errors

The above shows a base foundation for getting metrics from a Go server into a queryable prometheus instance, but total requests alone is not a particularly interesting metric. Lets see if we can also collect information on the errors and latency of our requests to cover some of the [Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals)

### Introducing Variability

Right now our Hello endpoint is simply returning a string, so won't produce very interesting metrics. Lets include a random delay and chance to fail to simiulate a more complex endpoint, and allow us to test our latency and error monitoring.

Our updated hello handler will look as follows

```go
func helloHandler(w http.ResponseWriter, r *http.Request) {

	// Mock performing work, delay up to 1 second
	delay := time.Duration(rand.Intn(1000)) * time.Millisecond
	time.Sleep(delay)

	// Mock failure chance
	if failureChance := rand.Intn(10); failureChance < 2 {
		http.Error(w, "Error", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Hello, World!")
}
```

and be sure to add "math/rand" and "time" to our imports.

There's an additional consideration, based on the way the rand library works in Go, we also want to seed our randomness, so lets update our 'init' method

```go
func init() {
    // Ensure the random values are different on each run.
	rand.Seed(time.Now().UnixNano())
	prometheus.Register(totalRequests)
}
```

Testing the above changes, we can now see the endpoint takes up to a second to respond, and will occasionally fail.

### Measuring Latency

Where we used a counter for the total requests metric, we will use a [Histogram](https://prometheus.io/docs/concepts/metric_types/#histogram) for latency.

After adding our changes, our updated main.go will look like

```go
package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"

    // Import the promauto dependency.
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var totalRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Number of get requests",
	},
	[]string{"path"},
)

// 1. Newly registered histogram metric.
var httpDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name: "http_response_time_seconds",
	Help: "Duration of HTTP requests",
}, []string{"path"})

func init() {
    rand.Seed(time.Now().UnixNano())
	prometheus.Register(totalRequests)

    // 2. Register our latency histogram
	prometheus.Register(httpDuration)
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

        // 3. Introduce a timer in our middleware, to track the time to proxy the request.
        path := r.URL.Path
		timer := prometheus.NewTimer(httpDuration.WithLabelValues(path))

		next.ServeHTTP(w, r)

		totalRequests.WithLabelValues(path).Inc()
		timer.ObserveDuration()
	})
}

func main() {
	hello := http.HandlerFunc(helloHandler)
	http.Handle("/hello", prometheusMiddleware(hello))
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {

	// Mock performing work
	delay := time.Duration(rand.Intn(1000)) * time.Millisecond
	time.Sleep(delay)

	// Mock failure chance
	if failureChance := rand.Intn(10); failureChance < 2 {
		http.Error(w, "Error", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Hello, World!")
}
```

Lets test the change is exporting data as expected locally

```shellsession
$ go run main.go
```

Refresh the hello endpoint a few times, we should be able our latency histogram data being populated.

```shellsession
$ curl -s localhost:8080/metrics | grep http_response_time
# HELP http_response_time_seconds Duration of HTTP requests
# TYPE http_response_time_seconds histogram
http_response_time_seconds_bucket{path="/",le="0.005"} 0
http_response_time_seconds_bucket{path="/",le="0.01"} 0
http_response_time_seconds_bucket{path="/",le="0.025"} 0
http_response_time_seconds_bucket{path="/",le="0.05"} 0
http_response_time_seconds_bucket{path="/",le="0.1"} 0
http_response_time_seconds_bucket{path="/",le="0.25"} 0
http_response_time_seconds_bucket{path="/",le="0.5"} 4
http_response_time_seconds_bucket{path="/",le="1"} 5
http_response_time_seconds_bucket{path="/",le="2.5"} 5
http_response_time_seconds_bucket{path="/",le="5"} 5
http_response_time_seconds_bucket{path="/",le="10"} 5
http_response_time_seconds_bucket{path="/",le="+Inf"} 5
http_response_time_seconds_sum{path="/"} 2.108435289
http_response_time_seconds_count{path="/"} 5
```

### Errors

We can now track how many requests we are receiving, and their latency. Lets also track the error rate. Conceptually, this is just a counter like our earlier totalRequests method, but requires a few additional changes to integrate with the Go http api.

Currently our prometheus middleware will proxy requests to the next http handler in the chain, but has no knowledge of the Status code of requests. Will will intercept this data with a custom "Status Recorder" that implements ResponseWriter and records the status code.

After making all our required changes, the final version of the main.go looks as follows

```go
package main

import (
	"fmt"
	"math/rand"
	"net/http"

    // New Import
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var totalRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Number of get requests",
	},
	[]string{"path"},
)

var httpDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name: "http_response_time_seconds",
	Help: "Duration of HTTP requests",
}, []string{"path"})

// Define our responseStatus status counter
var responseStatus = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "response_status",
		Help: "Status of HTTP response",
	},
	[]string{"status"},
)

// Create our status recorder struct
type StatusRecorder struct {
	http.ResponseWriter
	Status int
}

// Implementent ResponseWriter on StatusRecorder
func (r *StatusRecorder) WriteHeader(status int) {
	r.Status = status
	r.ResponseWriter.WriteHeader(status)
}

func init() {
    rand.Seed(time.Now().UnixNano())
	prometheus.Register(totalRequests)
	prometheus.Register(httpDuration)

    // Register the new metric
	prometheus.Register(responseStatus)
}

func main() {
	hello := http.HandlerFunc(helloHandler)
	http.Handle("/hello", prometheusMiddleware(hello))
	http.Handle("/metrics", promhttp.Handler())

	http.ListenAndServe(":8080", nil)
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		timer := prometheus.NewTimer(httpDuration.WithLabelValues(path))

        // Wrap our responseWriter in our custom StatusRecorder
		recorder := &StatusRecorder{
			ResponseWriter: w,
			Status:         200,
		}
		next.ServeHTTP(recorder, r)

		statusCode := recorder.Status
		responseStatus.WithLabelValues(strconv.Itoa(statusCode)).Inc()

		totalRequests.WithLabelValues(path).Inc()
		timer.ObserveDuration()
	})
}

func helloHandler(w http.ResponseWriter, r *http.Request) {

	// Mock performing work
	delay := time.Duration(rand.Intn(1000)) * time.Millisecond
	time.Sleep(delay)

	// Mock failure chance
	if failureChance := rand.Intn(10); failureChance < 2 {
		http.Error(w, "Error", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Hello!")
}
```

Initially, this looks the same as our previous metrics. We create a new prometheus variable and include it in out init block

The major change is updating our prometheus middleware to use the new StatusRecorder type as a wrapper around our existing response writer. From our new type, we are able to extract the status code from the response and increment our responseStatus counter.

Now when we deploy our changes, refresh our endpoint a few times, we should be able to see extra data in our "/metrics" endpoint for response status

```shellsession
$ curl -s localhost:8080/metrics | grep response_status
# HELP response_status Status of HTTP response
# TYPE response_status counter
response_status{status="200"} 13
response_status{status="500"} 1
```

We now have a Go app exposing metrics on request count, latency and error rate that get scraped into a prometheus server.

## Setting up a Grafana server.

TODO

'deploy/grafana/deployment.yaml'

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: grafana
  name: grafana
spec:
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      securityContext:
        fsGroup: 472
        supplementalGroups:
          - 0
      containers:
        - name: grafana
          image: grafana/grafana:7.5.2
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http-grafana
              protocol: TCP
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /robots.txt
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 30
            successThreshold: 1
            timeoutSeconds: 2
          livenessProbe:
            failureThreshold: 3
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            tcpSocket:
              port: 3000
            timeoutSeconds: 1
          resources:
            requests:
              cpu: 250m
              memory: 750Mi
          volumeMounts:
            - mountPath: /var/lib/grafana
              name: grafana-pv
      volumes:
        - name: grafana-pv
          persistentVolumeClaim:
            claimName: grafana-pvce
```

'deploy/grafana/service.yaml'

```yaml
apiVersion: v1
kind: Service
metadata:
  name: grafana
spec:
  ports:
    - port: 3000
      protocol: TCP
      targetPort: http-grafana
  selector:
    app: grafana
  sessionAffinity: None
  type: LoadBalancer
```

'deploy/grafana/pvc.yaml'

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Makefile update:

```makefile
...
# Grafana
.PHONY: deploy-grafana
deploy-grafana:
	kubectl apply -f deploy/grafana/deployment.yaml
	kubectl apply -f deploy/grafana/service.yaml
	kubectl apply -f deploy/grafana/pvc.yaml
```

With this setup, we can use the default login of 'admin' for user and password

Setup Data source to connect to Prometheus service at the url exposed by minikube
Once the data source is connected, we can create our dashboard to read out custom metrics.

Throughput:

```
rate(http_requests_total[1m])
```

Latency: e.g. P95

```
histogram_quantile(0.95, rate(http_response_time_seconds_bucket{service="go-hello-service", path="/"}[1m]))
```

Status Code:

```
rate(response_status[1m])
```

### Generating load

I often use [Vegeta](https://github.com/tsenart/vegeta) as a local load testing tool

Once downloaded, we can generate load to our app by running

```shellsession
$ echo "GET $(minikube service go-hello-service --url)" |
vegeta attack -duration=10s -rate=30/1s |
tee resutls.bin |
vegeta report
```

And then see the traffic showing on our newly created dashboard.

// TODO Insert image of dashbaord.

## Summary

We have setup a Go server from scratch, and can monitor the request count, latency and errors as raw data and with dashboards in Grafana.

The source code for this post is available at [TODO ADD LINK](TODO NEW GITHUB REPO)
// Link to source code, in a clean "blog-reference" repo.

If you have feedback on this post, feel free to reach out to me on Twitter or LinkedIn. Links at the bottom of the page.

## Sources

- https://go.dev/doc/tutorial/create-module
- https://docs.docker.com/language/golang/build-images/
- https://www.alexedwards.net/blog/making-and-using-middleware
- https://gabrieltanner.org/blog/collecting-prometheus-metrics-in-golang
- https://gobyexample.com/random-numbers
- https://dev.to/julienp/logging-the-status-code-of-a-http-handler-in-go-25aa
- https://www.bogotobogo.com/GoLang/GoLang_Web_Building_Docker_Image_and_Deploy_to_Kubernetes.php
- https://flaviocopes.com/go-random/
  https://grafana.com/docs/grafana/latest/installation/kubernetes/
- https://github.com/prometheus/prometheus/blob/main/documentation/examples/prometheus-kubernetes.yml
- https://medium.com/kubernetes-tutorials/monitoring-your-kubernetes-deployments-with-prometheus-5665eda54045
