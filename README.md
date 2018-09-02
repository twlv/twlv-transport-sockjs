# twlv-transport-sockjs

```js
const { SockJsReceiver, SockJsDialer } = require('@twlv/transport-sockjs');
```

## SockJsReceiver

### Constructor options

- secure, default "auto"
  - "auto" Receiver will try https first then fallback to http if https is not available
  - true   Force https only
  - false  Force http only
