# SPHERO.IO

## HTTP

### GET /spheros

### POST /spheros

#### Request

- ACK - Should this wait on results from robots
- CID - Command ID
- DID - Device ID
- DATA - BASE64 encoded buffer to send as arguments

#### Response

An array with the following formatted objects

- SOP2 - Status code for response
- MRSP - Varies by command
- DATA - BASE64 encoded buffer of data recieved

### POST /spheros/:name

#### Request

- ACK - Should this wait on results from robot
- CID - Command ID
- DID - Device ID
- DATA - BASE64 encoded buffer to send as arguments

#### Response

- ID - Type of notification
- DATA - BASE64 encoded buffer of data recieved
- SOP2 - Status code for response

## WS

When connected via WS you will get all async notifications

- ID - Type of notification
- DATA - BASE64 encoded buffer of data recieved
- SOP2 - Status code for response