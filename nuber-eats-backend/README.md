# Nuber Eats

The Backend of Nuber Eats Clone

## User Model:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

- Orders Subscription:

  - Pending Orders (Owner) (T: createOrder)
  - Order Status (Customer, Delivery, Owner) (T: editOrder)
  - Pending Pickup Order (Delivery)

- Payments (CRON)
