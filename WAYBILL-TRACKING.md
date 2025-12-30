# Waybill Tracking System Documentation

## Overview

A comprehensive waybill tracking system for Electric Oracle Spirituals to track products being shipped across Nigeria. The system includes waybill management, real-time status updates, customer notifications, and QR code generation.

## Features

### ✅ Core Features Implemented

1. **Waybill Management System**
   - Unique waybill number generation (`WB-YEAR-TIMESTAMP-RANDOM`)
   - Complete customer and product information tracking
   - Support for multiple courier services (GIG Logistics, DHL, FedEx, NIPOST, etc.)
   - Firebase Firestore database for reliable data storage

2. **Multi-Stage Status Tracking**
   - Pending Dispatch
   - Dispatched
   - In Transit
   - Out for Delivery
   - Delivered
   - Failed Delivery
   
3. **Checkpoint System**
   - Detailed tracking at each transit point
   - Timestamp for every checkpoint
   - Location tracking
   - Handler identification
   - Notes/comments for each checkpoint
   - Optional GPS coordinates and photo evidence

4. **Customer Tracking Interface**
   - Public tracking page (`track.html`)
   - Real-time status updates
   - Visual timeline display
   - Responsive design for mobile devices
   - Direct URL sharing with waybill number

5. **Admin Dashboard**
   - Create new waybills
   - Update shipment status
   - View all waybills
   - Search and filter functionality
   - Reports and analytics
   - Authentication required

6. **Notifications**
   - Email notifications via Formspree
   - Notifications sent on:
     - Waybill creation
     - Status updates
   - Ready for SMS integration (Termii, Africa's Talking)

7. **QR Code Generation**
   - Unique QR code for each waybill
   - Scannable tracking links
   - Easy sharing with customers

## File Structure

```
Electric Oracle/
├── track.html                      # Public tracking page
├── admin-waybill.html              # Admin dashboard
├── js/
│   └── waybill-tracking.js         # Core tracking logic
├── WAYBILL-TRACKING.md             # This documentation
└── index.html                      # Main site (existing)
```

## Setup Instructions

### 1. Firebase Firestore Setup

Enable Firestore in your Firebase console and create the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to waybills for tracking
    match /waybills/{waybillId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Enable Firestore Indexes

Create a composite index for:
- Collection: `waybills`
- Fields: `createdAt` (Descending)

### 3. Add Links to Main Site

Add these links to your main `index.html` navigation:

```html
<a href="track.html">Track Order</a>
<a href="admin-waybill.html">Admin</a>
```

### 4. Optional: SMS Integration

To enable SMS notifications, uncomment the SMS code in `js/waybill-tracking.js` and integrate with:

#### Option 1: Termii (Nigerian SMS Provider)
```javascript
async function sendSMS(phone, message) {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: phone,
            from: "ElectricOracle",
            sms: message,
            type: "plain",
            channel: "generic",
            api_key: "YOUR_TERMII_API_KEY"
        })
    });
    return response.json();
}
```

#### Option 2: Africa's Talking
```javascript
async function sendSMS(phone, message) {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
            'apiKey': 'YOUR_API_KEY',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            username: 'YOUR_USERNAME',
            to: phone,
            message: message
        })
    });
    return response.json();
}
```

## Usage Guide

### For Admins

#### Creating a Waybill

1. Navigate to `admin-waybill.html`
2. Login with your Firebase account
3. Fill in the form:
   - Customer information (name, phone, email)
   - Delivery address (street, city, state, LGA)
   - Product details (name, quantity, value, weight)
   - Logistics info (courier, tracking number, estimated delivery)
4. Click "Create Waybill"
5. Share the generated waybill number with the customer

#### Updating Shipment Status

1. Go to "Manage Waybills" tab
2. Find the waybill in the table
3. Click the edit button (pencil icon)
4. Fill in:
   - New status
   - Current location
   - Notes (e.g., "Package arrived at Lagos hub")
   - Handler name
5. Submit the update
6. Customer receives automatic notification

#### Viewing Reports

1. Go to "Reports" tab
2. View statistics:
   - Total waybills
   - Pending shipments
   - In transit
   - Delivered

### For Customers

#### Tracking an Order

**Method 1: Direct Link**
- Open the tracking link sent via email: `https://yoursite.com/track.html?waybill=WB-2025-xxx`

**Method 2: Manual Entry**
1. Visit `track.html`
2. Enter waybill number
3. Click "Track Shipment"

**Method 3: QR Code**
- Scan the QR code from waybill printout
- Automatically opens tracking page

## Database Schema

### Waybills Collection

```javascript
{
  waybillNumber: "WB-2025-1735567890123-456",
  orderId: "order_123",
  customerInfo: {
    name: "John Doe",
    phone: "+2348012345678",
    email: "john@example.com",
    deliveryAddress: {
      street: "123 Main Street",
      city: "Lagos",
      state: "Lagos",
      lga: "Ikeja"
    }
  },
  productInfo: {
    name: "Spiritual Candles Set",
    quantity: 2,
    value: 2500000, // in kobo (₦25,000)
    weight: "2kg",
    description: "Handle with care - fragile"
  },
  logisticsInfo: {
    courier: "GIG Logistics",
    trackingNumber: "GIG123456",
    estimatedDelivery: "2025-01-05",
    pickupLocation: "NNEWI ANAMBRA"
  },
  status: "in_transit",
  checkpoints: [
    {
      timestamp: "2025-12-30T10:00:00Z",
      location: "NNEWI ANAMBRA",
      status: "dispatched",
      handler: "Warehouse Staff",
      notes: "Package picked by courier",
      gpsCoordinates: { lat: 6.0145, lng: 6.9168 },
      photoUrl: ""
    }
  ],
  createdAt: "2025-12-30T09:00:00Z",
  updatedAt: "2025-12-30T15:30:00Z",
  qrCodeUrl: "data:image/png;base64,..."
}
```

## Integration with Existing Payment Flow

You can automatically create waybills after successful Paystack payments by adding this code to your existing payment success handler in `index.html`:

```javascript
// After successful payment (around line 1548 in index.html)
async function onPaymentSuccess(reference, email, name, phone, amount, productName) {
    // Existing email notification code...
    
    // Create waybill automatically
    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        deliveryStreet: "To be confirmed", // Collect during checkout
        deliveryCity: "To be confirmed",
        deliveryState: "To be confirmed",
        deliveryLga: "",
        productName: productName,
        productQuantity: 1,
        productValue: amount, // Already in kobo
        productWeight: "",
        productDescription: `Order via website - Ref: ${reference}`,
        courier: "Self-delivery",
        externalTrackingNumber: "",
        estimatedDelivery: "",
        orderId: reference
    };
    
    const result = await createWaybill(orderData);
    
    if (result.success) {
        console.log('Waybill created:', result.waybillNumber);
        // Optionally show waybill number to customer
    }
}
```

## Best Practices

### 1. Regular Status Updates
- Update waybill status at each major checkpoint
- Provide clear, customer-friendly notes
- Include handler names for accountability

### 2. Customer Communication
- Send notifications at key milestones:
  - Dispatch
  - Arrival at major hubs
  - Out for delivery
  - Delivery confirmation
- Include estimated delivery times

### 3. Data Management
- Regularly backup Firestore data
- Archive delivered waybills after 6 months
- Monitor failed deliveries and follow up

### 4. Security
- Keep admin dashboard access restricted
- Use Firebase Authentication
- Don't expose sensitive customer data publicly
- Validate all inputs

### 5. Performance
- Limit waybill queries (currently 100 per load)
- Implement pagination for large datasets
- Use Firestore indexes for faster queries

## Future Enhancements

### Short-term
- [ ] SMS notifications integration
- [ ] Print waybill/shipping label function
- [ ] Bulk waybill upload via CSV
- [ ] Photo upload at checkpoints
- [ ] Real-time GPS tracking integration

### Medium-term
- [ ] Customer signature capture on delivery
- [ ] Proof of delivery photos
- [ ] Integration with courier APIs (GIG, DHL, etc.)
- [ ] Delivery time prediction using ML
- [ ] WhatsApp notifications

### Long-term
- [ ] Mobile app for delivery personnel
- [ ] Route optimization
- [ ] Analytics dashboard (delivery times, success rates, etc.)
- [ ] Automated dispatch workflows
- [ ] Integration with inventory management

## Support & Troubleshooting

### Common Issues

**Issue**: Waybills not loading in admin dashboard
- **Solution**: Check Firebase Authentication. Ensure Firestore rules allow read access for authenticated users.

**Issue**: Notifications not sending
- **Solution**: Verify Formspree form ID in `waybill-tracking.js` line 236. Check customer email is valid.

**Issue**: QR codes not generating
- **Solution**: Ensure QRCode.js library is loaded properly. Check browser console for errors.

**Issue**: "Waybill not found" error
- **Solution**: Verify waybill number is correct. Check Firestore collection for document.

## Contact

For questions or support:
- Email: electricoraclespiritual@gmail.com
- Phone: +2348060537893

---

**Version**: 1.0  
**Last Updated**: December 30, 2025  
**Author**: Electric Oracle Spirituals Development Team
