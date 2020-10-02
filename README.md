# An eCommerce application built on Angular & NestJS & TailwindCSS (the REST API part)

Ngx-storefront is an example of a modern eCommerce application built on TypeScript stack. The project consists of 3 parts:

*   the Customer UI [artemv01/ngx-storefront][ngx-storefront]
*   the REST API [artemv01/ngx-storefront-api][ngx-storefront-api]
*   and the Admin UI (coming soon)

This is a repository for the the REST API. 

## Technology stack

The technology stack used for the REST API includes:
* [NestJS][nestjs]
* [MongoDB][mongodb]/[Mongoose][mongoose]
* [AWS S3][s3] as a file storage

Deployed on Heroku.

## What’s currently missing

Integration/unit tests were omitted so far and might be implemented in the future.

## Setting up development environment


### Launch the REST API

```
git clone https://github.com/artemv01/ngx-storefront-api.git
cd ngx-storefront-api
cp .env.example .env
# Open the .env file with your favorite  text editor (in this example vim)
# Set the required params as per the documentation in .env file
vim .env
npm install
npm run start:dev
```


### Start the Customer UI
```
git clone https://github.com/artemv01/ngx-storefront.git
cd ngx-storefront
cp .env.example .env
# Open the .env file with your favorite  text editor (in this example vim)
# Set the required params as per the documentation in .env file
vim .env
npm install
npm run start
```



## Get in touch

If you’d like to chat, please find me on Twitter [https://twitter.com/artemv01](https://twitter.com/artemv01) or send me an email arteitip [at] gmail [dot] com


## Contributing

If you are interested and have any ideas for features, please open an [issue](https://github.com/artemv01/ngx-storefront/issues/new).

## License

Feel free to use my code on your project. It would be great if you put a reference to this repository.

[MIT](https://opensource.org/licenses/MIT)

[nestjs]: https://nestjs.com/
[mongodb]: https://www.mongodb.com/
[mongoose]: https://mongoosejs.com/
[s3]: https://aws.amazon.com/s3/
[ngx-storefront]: https://github.com/artemv01/ngx-storefront
[ngx-storefront-api]: https://github.com/artemv01/ngx-storefront-api
