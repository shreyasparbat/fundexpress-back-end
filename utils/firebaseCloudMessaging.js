// const fcm = require('fcm-node');
// const serverKey = 'AAAAZL70Bas:APA91bHRU55TnhMawT0ZO9BwSyELQQbuGsQ_RugsG7VqO0Nax9OlomfC0NILPy3JXcV9l2waxXFZP1OrmZD-pDgur8B4DFDZXgZmrW723Pge0gn8ZWARFGPJLJdoLN3Vsf1vkYq6W2S4';
// const fcm = new FCM(serverKey);

// const expiryReminderMessage = {
//     to: 'registration_token', 
    
//     notification: {
//         title: 'Pawned Item Payemnt Expiry Date Reminder', 
//         body: 'Hello! This is a reminder that you have only 1 week left to complete the repayment for your pawned item.'
//     }
// };

// const gracePeriodStartedMessage = {
//     to: 'registration_token',

//     notification: {
//         title: 'Pawned Item Payment Grace Period Started',
//         body: 'Hello! Your payment deadline for your pawned item has been passed. Your one month grace period for payment has started now.'
//     }
// };

// const gracePeriodReminderMessage = {
//     to: 'registration_token',

//     notification: {
//         title: 'Pawned Item Payment Grace Period Expiry Reminder',
//         body: 'Hello! Your one month grace period for payment will end in 1 week. Please complete your payment within that timeline.'
//     }
// };

// const expiryMessage = {
//     to: 'registration_token',

//     notification: {
//         title: 'Pawned Item Payment Grace Period Ended',
//         body: 'Hello! Your grace period for payment has passed. Your payment has been defaulted.'
//     }
// };

// Send method will be called in the routes

// fcm.send(message, function(err, response){
//     if (err) {
//         console.log("Something has gone wrong!");
//     } else {
//         console.log("Successfully sent with response: ", response);
//     }
// });