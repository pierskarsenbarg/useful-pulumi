# Cloud function demo with private npm package

The private package here is the `@pierskarsenbarg/pk-private-package`.

In the `/app` folder (which is being pushed to the function) you need to have the `.npmrc` file which contains the following:

```
//<repository-url>/:_authToken=<access-token>
@scope:registry=https://<repository-url>/scope
```

So for example, for my private package it looks like this:

```
//npm.pkg.github.com/:_authToken=<github-access-token>
@pierskarsenbarg:registry=https://npm.pkg.github.com/pierskarsenbarg
```