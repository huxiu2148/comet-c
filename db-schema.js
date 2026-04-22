// db-schema.js

/**
 * Database Schema Documentation
 *
 * This file describes the Firestore collection structure for the application.
 *
 * Collections:
 * 1. campaigns
 * 2. orders
 * 3. users
 * 4. groups
 * 5. exchange rates
 * 6. accounting
 */

// 1. campaigns
// Collection: campaigns
// Document structure:
// - campaignId: string, unique identifier for the campaign
// - name: string, the name of the campaign
// - startDate: timestamp, when the campaign starts
// - endDate: timestamp, when the campaign ends
// - budget: number, total budget allocated for the campaign
// - status: string, current status of the campaign (e.g., active, completed)

// 2. orders
// Collection: orders
// Document structure:
// - orderId: string, unique identifier for the order
// - userId: string, reference to the user who placed the order
// - campaignId: string, reference to the campaign associated with the order
// - amount: number, total amount for the order
// - createdDate: timestamp, when the order was created
// - status: string, current status of the order (e.g., completed, pending)

// 3. users
// Collection: users
// Document structure:
// - userId: string, unique identifier for the user
// - username: string, the username of the user
// - email: string, email address of the user
// - createdDate: timestamp, when the user account was created
// - lastLogin: timestamp, last time the user logged in

// 4. groups
// Collection: groups
// Document structure:
// - groupId: string, unique identifier for the group
// - name: string, name of the group
// - members: array of userIds, list of users in the group
// - createdDate: timestamp, when the group was created

// 5. exchange rates
// Collection: exchange rates
// Document structure:
// - rateId: string, unique identifier for the exchange rate entry
// - currencyFrom: string, currency code of the source currency
// - currencyTo: string, currency code of the target currency
// - rate: number, exchange rate value
// - lastUpdated: timestamp, when the exchange rate was last updated

// 6. accounting
// Collection: accounting
// Document structure:
// - recordId: string, unique identifier for the accounting record
// - userId: string, reference to the user associated with the record
// - amount: number, amount of the transaction
// - transactionType: string, type of transaction (e.g., income, expense)
// - createdDate: timestamp, when the record was created
// - description: string, description of the transaction