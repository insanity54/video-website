# Futureporn

## Pubsub

### futureporn-transcoder

  * Subscribes to `futureporn` and waits for message `{ worker: 'ripper' }`
  * Publishes to `futureporn` with message `{ worker: 'transcoder' }`

### futureporn-ripper

  * Subscribes to none
  * Publishes to `futureporn` with message `{ worker: 'ripper' }`

### futureporn-scout

  * Subscribes to none
  * Publishes to `futureporn` with mesage `{ worker: 'scout' }`

### futureporn-builder

  * Subscribes to `futureporn` and waits for message `{ worker: 'scout'|'ripper'|'transcoder' }
  * Publishes to `futureporn` with message `{ worker: 'builder' }`
