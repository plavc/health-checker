# health-checker
HTTP Service Health Checker.

Simple health checker tool. Based on provided Yaml file health-checker executes all requests and exits with 0 if all request succeded or 1 if there was an error. 

### Installation (globally)

`npm i @plavc/health-checker -g`

### How to run

`pl-health-checker services.yaml`

### Docker

Pull image

`docker pull plavchub/health-checker`

Run docker container

`docker run -it --rm -v ${pwd}/services.yaml:/opt/health-checker/config.yaml plavchub/health-checker`

### Example of input YAML file:

```
# services.yaml

config:
  timeout: 4000

vars:
  host: http://dummy.restapiexample.com/api/v1

services:

  employee:
    url: ${host}/employee/24863
    successCode: 200
    timeout: 2000
    method: GET
    
  employees:
    url: ${host}/employees
    
```

### Create Windows executable file:

`pkg --output health-checker.exe --targets=node10-win-x64 dist/index.js`
