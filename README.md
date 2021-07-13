# Print service control panel

Front-end companion for [print-service](https://github.com/ussserrr/print-service).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). See its docs for more details.

## Demo
![desktop](/demo/desktop/safari.gif)
![mobile](/demo/mobile/safari.gif)

## Useful commands

### Start
Development mode:
```bash
$ REACT_APP_API_URL=http://192.168.1.214:4000/api npm run start
```

In production, intended to be supplied with Docker-Nginx + Kubernetes. See [Dockerfile](/Dockerfile), [k8s configs](/k8s).
