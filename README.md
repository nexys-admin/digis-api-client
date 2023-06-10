# Digis Admin as a Service (AaaS) Client

## Description

The Admin as a Service (AaaS) client is a JavaScript client designed to connect to Digis' modules via the AaaS API. It's perfect for any application that requires administration service automation.

## Get started / example

see `src/main.ts`

note that if you use it as is you need to run

```
yarn build # builds a new version
yarn start MYTOKEN
```

## Live Server API Endpoint

[https://app.digis.ch/api](https://app.digis.ch/api)

## Mock Server

If you want to test the client without sending requests to the live server, you can use our mock server at [https://stoplight.io/mocks/nexys/digis-accounting-doc/47354](https://stoplight.io/mocks/nexys/digis-accounting-doc/47354). (_untested_)

## Authorization

This client uses the Authorization Code OAuth Flow. Ensure to provide the right credentials to get the access token.

- Authorize URL: `Not provided`
- Token URL: `Not provided`

_The Authorize and Token URLs will be typically provided by the OAuth provider. If you're unsure what these are, please contact the API administrator._

## Documentation

For more detailed information and specific usage examples, you can check our [API Documentation](https://nexys.stoplight.io/docs/digis-accounting-doc/fc90c18ee0256-admin-as-a-service-aaa-s).

## License

This project is licensed under the MIT License.

Please note that this document is for general guidance only. Developers should refer to the detailed API documentation for accurate information.
