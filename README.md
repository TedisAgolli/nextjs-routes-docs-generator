# NextJS Routes Docs

Automatically generate Swagger Docs for your NextJS project.

- [NextJS Routes Docs](#nextjs-routes-docs)
  - [Execute](#execute)
  - [Options](#options)
  - [Example output](#example-output)
  - [Support](#support)

For information about terms used in this document see: [terminology](./docs/terminology.md)

## Execute

```bash
npx nextjs-routes-docs [dir]
```


## Options
```bash
npx nextjs-routes-docs --help
```
```bash
Usage: npx nextjs-routes-docs [dir]

Arguments:
  dir                   Nextjs project directory

Options:
  -V, --version         output the version number
  -t, --text            Produce text docs
  -s, --swagger         Produce swagger docs
  -p, --params          [BETA] Parse code to get params
  -o, --output <value>  Choose output folder
  -h, --help            display help for command
```

## Example output
`Swagger: routes.yml`
```yaml
swagger: '2.0'
info:
  title: Swagger API
  version: 1.0.0
paths:
  /api/room/join:
    post:
      parameters:
        - in: body
          name: roomId
        - in: body
          name: user
  /api/room/update:
    post:
      parameters:
        - in: body
          name: roomId
        - in: body
          name: roomName
        - in: body
          name: roomSize
  /api/room:
    post:
      parameters:
        - in: body
          name: roomId
        - in: body
          name: createdBy
    get:
      parameters:
        - in: query
          name: roomId
    delete:
      parameters:
        - in: query
          name: roomId
  /api/user:
    post:
      parameters:
        - in: body
          name: userId
        - in: body
          name: userName
    get:
      parameters:
        - in: query
          name: userId
```

`Plain text: routes`
```txt
C:\Users\Tedis\Desktop\src\nextjs-project\pages\api\room\join.js
POST 	 /api/room/join 	 {body: {roomId, user}}
---------------------------------
C:\Users\Tedis\Desktop\src\nextjs-project\pages\api\room\update.js
POST 	 /api/room/update 	 {body: {roomId, roomName, roomSize}}
---------------------------------
C:\Users\Tedis\Desktop\src\nextjs-project\pages\api\room.js
POST 	 /api/room 	 {body: {roomId, createdBy}}
GET 	 /api/room 	 ?roomId
DELETE 	 /api/room 	 ?roomId
---------------------------------
C:\Users\Tedis\Desktop\src\nextjs-project\pages\api\user.js
POST 	 /api/user 	 {body: {userId, userName}}
GET 	 /api/user 	 ?userId
---------------------------------
```

## Support

1. Crete an an issue in the public [Github](https://github.com/TedisAgolli/nextjs-routes-docs-generator/issues)
2. Email `hey@tedis.me`
