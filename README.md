# Apteryx

- [Apteryx](#apteryx)
	- [Overview](#overview)
	- [Getting Started](#getting-started)


## Overview
Apteryx is a utility library for interacting with the RPC API of [Kiwi TCMS](https://kiwitcms.org).

## Getting Started

First you will need to initialize the connector, and log in.
```TypeScript
import { KiwiConnector } from 'apteryx'

// Inside an async function...

// Set up the connection to the Kiwi server
await KiwiConnector.init({
		hostName: 'localhost',
		useSSL: true,
		port: 3001 // Optional.  Defaults to 80 or 443, based on useSSL value.
	});
// Login with your Kiwi username & password (real values should be loaded from an enrivonment variable)
await KiwiConnector.login('username', 'password');
```

Once this is complete, you can interact with various Kiwi entities by using the static methods of the appropriate class.

Management Items:
- `Build`
- `Category`
- `Classification`
- `Component`
- `Environment`
- `EnvironmentProperty`
- `Priority`
- `Product`
- `Tag`
- `User`
- `Version`

Testing Items:
- `PlanType`
- `TestCase`
- `TestCaseProperty`
- `TestCaseStatus`
- `TestExecution`
- `TestExecutionStatus`
- `TestPlan`
- `TestRun`

