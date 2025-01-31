<p align="center">
  <img src="https://user-images.githubusercontent.com/60735691/234904816-2a466e4d-e4f1-4f68-80ec-99e882583100.png" alt="Egemond" />
</p>

<p align="center">
  <strong>Take control of your finances</strong>
</p>

<p align="center">A powerful and easy to use open-source personal finance management app.</p>

![Egemond](https://user-images.githubusercontent.com/60735691/234904922-dfe0f637-f0f8-4658-a848-e0bd0a23d20e.png)

Egemond is a free and open-source app that helps you manage your personal finances.
- **Save your financial activity**: Quickly add your incomes and expenses and categorize and tag them.
- **Analyze receipts**: Egemond can analyze your receipts and automatically fill the title, amount, and date of the activity. It even recognizes every item you've purchased and categorizes it.
- **Split activity**: If a certain transaction consists of items from different categories, you can split the amount of the activity between multiple categories.
- **Keep track of your spending and earning**: With Egemond, you can monitor your spending and earning by time or category.
- **Easy to use**: Egemond is designed to be intuitive for any user, regardless of their technical experience.

## Getting started
To get started with Egemond read the [documentation](https://github.com/egemond/egemond/wiki) or follow the steps below.

### Installation
The easiest way to get started with Egemond is to download the latest release. Unzip the downloaded release into a new directory, such as `egemond`.

### Requirements
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/try/download/community)

### Configuration
You can use the following configuration to start using Egemond. Create a `.env` file with the following contents and replace `{MongoDB connection string}`, `{JWT secret}` and `{Master password}` placeholders with their respective values.

```
DB_CONNECTION_STRING="{MongoDB connection string}"
JWT_SECRET="{JWT secret}"
ENABLE_SIGNUP="true"
MASTER_PASSWORD="{Master password}"
```

- `DB_CONNECTION_STRING`: The connection string for MongoDB database (required)
- `JWT_SECRET`: A secret string used to sign JWT tokens that are used for authentication (required)
- `ENABLE_SIGNUP`: Whether or not to allow signing up (required for creating a user account)
- `MASTER_PASSWORD`: A password that must be entered when signing up (required if signing up is enabled)
- `MASTER_PASSWORD`: A password that must be entered when signing up (required if signing up is enabled)
- `TOTP_ALGORITHM`: Hashing algorithm for two-factor authentication (optional, default is SHA1)

#### AI features
To use the AI features, you will additionally also need the following:

- **Receipt analysis**: an Azure AI Document Intelligence API key
- **Item categorization**: an Open AI API key

Instructions on how to obtain and use these API keys can be found in the documentation.

Please note that although Egemond itself is open-source, AI features rely on third-party resources that are not free of charge.

### Run
You can start Egemond by running
```
npm install
npm start
```

Egemond should be accessible on [http://localhost:3000](http://localhost:3000). To create your user account, go to [http://localhost:3000/signup](http://localhost:3000/signup). Enter your email, desired password and master password that you have set in the configuration. Then, select the currency you would like to use. After that you are all set to start using Egemond.

### Docker
You can also run Egemond using Docker.

To create a Docker image, run
```
docker build -t egemond .
```

When the Docker image is created, run
```
docker run --name egemond -p 3000:3000 -e "DB_CONNECTION_STRING={MongoDB connection string}" -e "JWT_SECRET={JWT secret}" -e "ENABLE_SIGNUP=true" -e "MASTER_PASSWORD={Master password}" egemond
```

Same as before, Egemond should be accessible on [http://localhost:3000](http://localhost:3000).