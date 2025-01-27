# Crypto Arbitrage Monitor

This is a real-time arbitrage monitoring system that tracks price differences between Binance (CEX) and Solana DEX
markets(raydium) for USDC trading pairs. The system detects arbitrage opportunities and calculates potential profits after
considering the fees from both exchanges.

## Features

- **Real-Time Price Monitoring**: Monitors prices for BTC/USDC, ETH/USDC, and SOL/USDC pairs.
- **Arbitrage Opportunity Detection**: Detects and alerts on potential arbitrage opportunities by adding them in db.
- **Fee-Aware Profit Calculations**: Accounts for trading fees on Binance and Solana DEX to calculate net profits.
- **WebSocket Integration**: Uses WebSockets for real-time price updates to minimize latency.
- **Dynamic Trading Pair Addition**: Allows for dynamic addition of new trading pairs without restarting the service.
- **Database Integration**: Stores historical price data and flagged arbitrage opportunities in MongoDB.
- **Raydium Integration**: Uses Raydium AMM to get the latest prices for the trading pairs.

## Prerequisites

Before running the Crypto Arbitrage Monitor, ensure that you have the following installed:

1. **Node.js**
2. **MongoDB and MONGO_URL**
3. **QUICKNODE SOLANA RPC URL**

# Setup

1.Clone the repo

```bash
git clone
```

Run the following command to install the required dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add the following environment variables:

```bash
MONGO_URL=your_mongo_url
QUICKNODE_URL=your_solana_rpc_url
```

3. Start the server:

```bash
node arbitrage.js
```

## API Endpoints

The Crypto Arbitrage Monitor exposes the following API endpoints:

1. **GET /prices**: Returns the latest prices for BTC/USDC, ETH/USDC, and SOL/USDC pairs.

``````
http://localhost:3000/api/price/:pair
``````

2. **GET /opportunities**: Returns the list of arbitrage opportunities detected by the system.

````````
http://localhost:3000/api/opportunities
````````

3. **POST /add/pair**: Adds a new trading pair to the monitoring system.

````````
#### http://localhost:3000/api/add/pair

Body : {
name:"btcusdc
nameOnBinace:"btcusdc",
solanaAmmAddress:"your_solana_amm_address",
}
````````
  

## Services

### Websocket service

This service is responsible for creating websockets for the trading pairs that are added dynamically.
It works by checking mongodb for the trading pairs that are added and then creates a websocket for each trading pair 
if the websocket isnt already initialized



## Design decisions

1. **MongoDB**: MongoDB was chosen as the database for storing historical price data and arbitrage opportunities due to its flexibility and scalability. It allows for easy addition of new trading pairs without changing the schema.
2. **WebSockets**: WebSockets were used for real-time price updates to minimize latency and provide a responsive user experience.

The database stores the following key collections:
Arbitrage Opportunities: Stores historical data for each detected arbitrage opportunity, including timestamps, trading pair, price information, calculated profit, and fees.
User Configuration: Stores user-configured trading pairs. This allows users to add or remove trading pairs easily.

Future Extensions

**1.Adding More Exchanges:**

The system currently supports Binance and Solana DEX for arbitrage detection. To add support for more exchanges (e.g., Coinbase, Kraken), we could:
Integrate new APIs or WebSocket streams to fetch live prices from other exchanges.
Add additional fee structures and trading rules specific to each exchange.
Modify the arbitrage calculation logic to account for different exchange behaviors.

**2. Real-Time Notifications:**

To enhance user experience, the system could notify users when an arbitrage opportunity arises. This could be done via:
Email Notifications: Using services like SendGrid or Mailgun.
SMS Alerts: Using services like Twilio.
Push Notifications: For mobile apps or browser-based push notifications.

**3. Different Arbitrage Strategies:**

We could try different arbitrage strategies to maximize profits

