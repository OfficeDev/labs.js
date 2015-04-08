labs.js
=======
Labs.js heavily relies on grunt for building and testing. The Visual Studio projects will build and compile the core files but do not run tests or package the resulting objects. To do this you need to install node.js (which will pull in npm). After this building and running is as simple as:

```
npm install
grunt
```

If you run a HTTP server you can then access blanket.js results. These aren't yet integrated into the project.

Full documentation can be found on [https://labsjs.blob.core.windows.net/sdk/index.html](https://labsjs.blob.core.windows.net/sdk/index.html). Future commits will move it to GitHub.

The labs.js blog can be found here [http://blog.labsjs.com](http://blog.labsjs.com)
