# viewer
Extensible PCAPI / W*S viewer

## Quick install & testing

1. git clone this repo
2. git submodule sync
3. git submodule update

You can now test that everything works by loading the map with the test data using any webserver e.g.

```
python -m SimpleHTTPServer 8080
```

Which makes the viewer available at localhost:8080

## Deploying on a production environment

Follow the `Quick install` steps above and change the `js/config.js` file appropriately (s. comments)
