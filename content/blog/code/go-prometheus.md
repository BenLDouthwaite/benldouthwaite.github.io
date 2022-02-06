---
title: Go monitoring with Prometheus
date: "2022-02-02"
description: ""
---

I like the standarised approach to monitoring provided by Prometheus, this tutorial walks through setting up Prometheus monitoring on a simple Go server.

To follow along, you should make sure you already have Go, Docker and Docker Compose installed, and ideally have some base knowledge of the Go language, but this is not strictly required.

The post is split into several sections. Each solving a different problem.

1. Providing a minimal config to track the number of requests to an endpoint of a Go app.
2. Collect latency data
3. Collect error / status code data
4. Simulate traffic, and query the data

## Part 1. Tracking request count.

Lets start with a simple use case, an endpoint to return "Hello", and a [Counter](https://prometheus.io/docs/concepts/metric_types/#counter) to track the number of requests we receive.

### Go App Server

We'll setup a Go server to monitor. For simplicity I will avoid using any outside libraries such as mux.

Start our module with

```
go mod init example.com/goprometheus
```

And create our 'main.go'.

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/hello", helloHandler)
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello!")
}
```

This is all we need for a functional server. We can run our code with

```
go run main.go
```

and verify the response with

```
curl localhost:8080/hello
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
	http.HandleFunc("/hello", helloHandler)
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello!")
}
```

will then import the prometheus dependency.

```
go mod tidy
```

Restart our app, and we can view our metrics

```
curl localhost:8080/metrics
```

Prometheus gives us a lot of metrics by default, but we're specifically interested in our endpoint.

We can now add our custom 'totalRequests' counter. To trigger our counter's increment, we will create a Prometheus Middleware layer for requests. If you are unfamilar with middleware in Go, I recommend [Alex Edwards' Tutorial](https://www.alexedwards.net/blog/making-and-using-middleware)

After making all the required changes, our `main.go` will looks as follows

```go
package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var totalRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Number of get requests",
	},
	[]string{"path"},
)

func init() {
	prometheus.Register(totalRequests)
}

func main() {
	hello := http.HandlerFunc(helloHandler)
	http.Handle("/hello", prometheusMiddleware(hello))
	http.Handle("/metrics", promhttp.Handler())

	http.ListenAndServe(":8080", nil)
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		totalRequests.WithLabelValues(r.URL.Path).Inc()
	})
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello!")
}
```

Ther's a few changes here, so lets review them in turn.

First we create our counter variable

```go
var totalRequests = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Number of get requests",
	},
	[]string{"path"},
)
```

Introduce an init function, and register our counter

```go
func init() {
	prometheus.Register(totalRequests)
}
```

Create the prometheus middleware, that will forward requests to the handler it wraps, and increment our counter

```go
func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
		totalRequests.WithLabelValues(r.URL.Path).Inc()
	})
}
```

Finally, update our main method to wrap our hello handler in our prometheus middleware

```go
func main() {
	hello := http.HandlerFunc(helloHandler)
	http.Handle("/hello", prometheusMiddleware(hello))
	http.Handle("/metrics", promhttp.Handler())

	http.ListenAndServe(":8080", nil)
}
```

The end result of these changes is that we can now restart our application, and after calling the "/hello" endpoint several times, our "/metrics" endpoint will contain our counter, incrementing on each call to "/hello"

```
...
# HELP http_requests_total Number of get requests
# TYPE http_requests_total counter
http_requests_total{path="/hello"} 3
...
```

### Scraping the data

_Many thanks to Gabriel Tanner for his post on [Golang Application monitoring using Prometheus](https://gabrieltanner.org/blog/collecting-prometheus-metrics-in-golang) that helped me resolve several issues in this section_

Now that we are exposing the data, it's ready to be scraped by a Prometheus server. You can run this locally, but I find it is easier and more portable to setup a containerized solution.

First, lets create a minimal Dockerfile for our Go server.

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

Now we need to add the configuration to run our prometheus server

lets setup a docker-compose file to refernce our new app

```yaml
version: "3.9"

services:
  golang:
    build:
      context: ./
      dockerfile: Dockerfile
    container_name: golang
    restart: always
    ports:
      - "8080:8080"
  prometheus:
    image: prom/prometheus:v2.24.0
    volumes:
      - ./prometheus/:/etc/prometheus/
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/usr/share/prometheus/console_libraries"
      - "--web.console.templates=/usr/share/prometheus/consoles"
    ports:
      - 9090:9090
    restart: always

volumes:
  prometheus_data:
```

and finally setup our prometheus config in './prometheus/prometheus.yml'

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ["localhost:9090"]
  - job_name: golang
    metrics_path: /metrics
    static_configs:
      - targets:
          - golang:8080
```

By now our directory structure looks like

```
.
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
├── main.go
└── prometheus
    └── prometheus.yml
```

Now we can start our Go app and prometheus server with

```
docker-compose up
```

now we can view the prometheus server and query metrics on [localhost:9090](http://localhost:9090), to see the total requests.

We can see the rate of requests over time using : `rate(http_requests_total{path="/hello"}[1m])`.

## Part 2. Latency and Errors

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

	fmt.Fprintf(w, "Hello!")
}
```

and be sure to add "math/rand" to our imports.

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

func init() {
	prometheus.Register(totalRequests)
	prometheus.Register(httpDuration)
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

		next.ServeHTTP(w, r)

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

Lets review these changes 1 at a time.

We create our httpDuration histogram var (with import for promauto)

```go
var httpDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name: "http_response_time_seconds",
	Help: "Duration of HTTP requests",
}, []string{"path"})
```

Register in our init block

```go
func init() {
	prometheus.Register(totalRequests)
	prometheus.Register(httpDuration)
}
```

And update the prometheus middleware to trigger a timer to measure the time taken to proxy the request

```go
func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		timer := prometheus.NewTimer(httpDuration.WithLabelValues(path))

		next.ServeHTTP(w, r)

		totalRequests.WithLabelValues(path).Inc()
		timer.ObserveDuration()
	})
}
```

Note, if the newly deployed code does not seem to have picked up the changes, we might need to refresh our images.

```
docker-compose down
docker-compose build --no-cache
docker-compose up
```

Once our changes are deployed, after refreshing the hello endpoints a few times, we should be able our latency histogram data being populated.

```
...
# HELP http_response_time_seconds Duration of HTTP requests
# TYPE http_response_time_seconds histogram
http_response_time_seconds_bucket{path="/hello",le="0.005"} 2
...
http_response_time_seconds_bucket{path="/hello",le="+Inf"} 54
http_response_time_seconds_sum{path="/hello"} 24.157544996000006
http_response_time_seconds_count{path="/hello"} 54
...
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

var responseStatus = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "response_status",
		Help: "Status of HTTP response",
	},
	[]string{"status"},
)

type StatusRecorder struct {
	http.ResponseWriter
	Status int
}

func (r *StatusRecorder) WriteHeader(status int) {
	r.Status = status
	r.ResponseWriter.WriteHeader(status)
}

func init() {
	prometheus.Register(totalRequests)
	prometheus.Register(httpDuration)
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

Initially, this looks the same as our previous metrics. We create a new prometheus variable

```go
var responseStatus = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "response_status",
		Help: "Status of HTTP response",
	},
	[]string{"status"},
)
```

include the variable in our init method

```go
func init() {
	prometheus.Register(totalRequests)
	prometheus.Register(httpDuration)
	prometheus.Register(responseStatus)
}
```

Now things change a bit, we need to create our new type implementing the ResponseWriter interface

```go
type StatusRecorder struct {
	http.ResponseWriter
	Status int
}

func (r *StatusRecorder) WriteHeader(status int) {
	r.Status = status
	r.ResponseWriter.WriteHeader(status)
}
```

and update our prometheus middleware to use this new type as a wrapper around our existing response writer. Then from our new type, we are able to extract the status code from the response and increment our response status counter.

```go
func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		timer := prometheus.NewTimer(httpDuration.WithLabelValues(path))

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
```

Now when we deploy our changes, refresh our endpoint a few times, we should be able to see extra data in our "/metrics" endpoint for response status

```
...
# HELP response_status Status of HTTP response
# TYPE response_status counter
response_status{status="200"} 8
response_status{status="500"} 3
```

## Part 4. Generating Load

Until now, we have been testing the population of our metrics by manually hitting our endpoint. Lets add a bit more traffic, to allow us to query some more realistic data, and see how Prometheus can visualise it.

- Add tool for generating mock traffic to the endpoints.

- Add example queries for checking the status codes and latency values.

It is also easy enough to configure all the above to work with Kubernetes instead of Docker-Compose

## Summary

We have setup a Go server from scratch, and can monitor the request count, latency and errors as raw data and graphs in Prometheus.

At this point, it would be a common pattern to expose the prometheus data to Grafana to create monitoring dashboards, but I'll save that for a future post.

The source code for this post is available at [TODO ADD LINK](TODO NEW GITHUB REPO)
// Link to source code, in a clean "blog-reference" repo.

If you have feedback on this post, feel free to reach out to me on Twitter or LinkedIn. Links at the bottom of the page.

# TODO Notes from implementing, not for posting

- Why do the code blocks have padding on first line
  - Add `display: block` to all code blocks
- [ ] Setup randomised load test

- Can I get the gatsby prism highlighting to allow line or block highlights?

## Sources

- https://go.dev/doc/tutorial/create-module
- https://docs.docker.com/language/golang/build-images/
- https://www.alexedwards.net/blog/making-and-using-middleware
- https://gabrieltanner.org/blog/collecting-prometheus-metrics-in-golang
- https://gobyexample.com/random-numbers
- https://dev.to/julienp/logging-the-status-code-of-a-http-handler-in-go-25aa
