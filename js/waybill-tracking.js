// Waybill Tracking System for Electric Oracle Spirituals
// Handles shipment tracking, status updates, and notifications

// Firebase Firestore references
const db = firebase.firestore();

// Waybill number generator
function generateWaybillNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WB-${year}-${timestamp}-${random}`;
}

// Create new waybill/shipment
async function createWaybill(orderData) {
    try {
        const waybillNumber = generateWaybillNumber();
        const waybillRef = db.collection('waybills').doc(waybillNumber);
        
        const waybillData = {
            waybillNumber: waybillNumber,
            orderId: orderData.orderId || '',
            customerInfo: {
                name: orderData.customerName,
                phone: orderData.customerPhone,
                email: orderData.customerEmail,
                deliveryAddress: {
                    street: orderData.deliveryStreet,
                    city: orderData.deliveryCity,
                    state: orderData.deliveryState,
                    lga: orderData.deliveryLga
                }
            },
            productInfo: {
                name: orderData.productName,
                quantity: orderData.productQuantity || 1,
                value: orderData.productValue, // in kobo
                weight: orderData.productWeight || '',
                description: orderData.productDescription || ''
            },
            logisticsInfo: {
                courier: orderData.courier || 'Self-delivery',
                trackingNumber: orderData.externalTrackingNumber || '',
                estimatedDelivery: orderData.estimatedDelivery || '',
                pickupLocation: 'NNEWI ANAMBRA, NIGERIA'
            },
            status: 'pending',
            checkpoints: [{
                timestamp: new Date().toISOString(),
                location: 'NNEWI ANAMBRA',
                status: 'pending',
                handler: orderData.createdBy || 'System',
                notes: 'Waybill created',
                gpsCoordinates: { lat: 6.0145, lng: 6.9168 }
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            qrCodeUrl: ''
        };

        await waybillRef.set(waybillData);

        // Generate QR code for the waybill
        await generateWaybillQRCode(waybillNumber);

        // Send notification to customer
        await sendWaybillNotification(waybillData, 'created');

        return {
            success: true,
            waybillNumber: waybillNumber,
            message: 'Waybill created successfully'
        };
    } catch (error) {
        console.error('Error creating waybill:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Update waybill status and add checkpoint
async function updateWaybillStatus(waybillNumber, statusUpdate) {
    try {
        const waybillRef = db.collection('waybills').doc(waybillNumber);
        const waybillDoc = await waybillRef.get();

        if (!waybillDoc.exists) {
            throw new Error('Waybill not found');
        }

        const waybillData = waybillDoc.data();
        
        // Create new checkpoint
        const newCheckpoint = {
            timestamp: new Date().toISOString(),
            location: statusUpdate.location || '',
            status: statusUpdate.status,
            handler: statusUpdate.handler || 'Staff',
            notes: statusUpdate.notes || '',
            gpsCoordinates: statusUpdate.gpsCoordinates || null,
            photoUrl: statusUpdate.photoUrl || '' // Photo evidence
        };

        // Update waybill
        await waybillRef.update({
            status: statusUpdate.status,
            checkpoints: firebase.firestore.FieldValue.arrayUnion(newCheckpoint),
            updatedAt: new Date().toISOString()
        });

        // Send notification to customer
        await sendWaybillNotification({
            ...waybillData,
            status: statusUpdate.status,
            latestCheckpoint: newCheckpoint
        }, 'status_update');

        return {
            success: true,
            message: 'Status updated successfully'
        };
    } catch (error) {
        console.error('Error updating waybill:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Track waybill - Public function for customers
async function trackWaybill(waybillNumber) {
    try {
        const waybillRef = db.collection('waybills').doc(waybillNumber);
        const waybillDoc = await waybillRef.get();

        if (!waybillDoc.exists) {
            return {
                success: false,
                error: 'Waybill not found. Please check the number and try again.'
            };
        }

        const waybillData = waybillDoc.data();
        
        return {
            success: true,
            data: waybillData
        };
    } catch (error) {
        console.error('Error tracking waybill:', error);
        return {
            success: false,
            error: 'Unable to track waybill. Please try again later.'
        };
    }
}

// Generate QR code for waybill (using QRCode.js library)
async function generateWaybillQRCode(waybillNumber) {
    try {
        // Create tracking URL
        const trackingUrl = `${window.location.origin}/track.html?waybill=${waybillNumber}`;
        
        // Generate QR code as data URL
        const qrCanvas = document.createElement('canvas');
        QRCode.toCanvas(qrCanvas, trackingUrl, { width: 300 });
        const qrDataUrl = qrCanvas.toDataURL();

        // Optional: Upload to Firebase Storage for persistent storage
        // For now, just store the data URL in Firestore
        await db.collection('waybills').doc(waybillNumber).update({
            qrCodeUrl: qrDataUrl
        });

        return qrDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
}

// Send notification to customer (SMS/Email)
async function sendWaybillNotification(waybillData, notificationType) {
    try {
        let subject = '';
        let message = '';
        
        switch(notificationType) {
            case 'created':
                subject = `Waybill Created - ${waybillData.waybillNumber}`;
                message = `
                    Dear ${waybillData.customerInfo.name},
                    
                    Your order has been registered for shipment.
                    
                    Waybill Number: ${waybillData.waybillNumber}
                    Product: ${waybillData.productInfo.name}
                    Estimated Delivery: ${waybillData.logisticsInfo.estimatedDelivery}
                    
                    Track your shipment at: ${window.location.origin}/track.html?waybill=${waybillData.waybillNumber}
                    
                    Thank you for shopping with Electric Oracle Spirituals!
                `;
                break;
                
            case 'status_update':
                subject = `Shipment Update - ${waybillData.waybillNumber}`;
                message = `
                    Dear ${waybillData.customerInfo.name},
                    
                    Your shipment status has been updated:
                    
                    Status: ${formatStatus(waybillData.status)}
                    Location: ${waybillData.latestCheckpoint.location}
                    Time: ${new Date(waybillData.latestCheckpoint.timestamp).toLocaleString()}
                    Notes: ${waybillData.latestCheckpoint.notes}
                    
                    Track your shipment: ${window.location.origin}/track.html?waybill=${waybillData.waybillNumber}
                    
                    Electric Oracle Spirituals
                `;
                break;
        }

        // Send via Formspree (reusing existing infrastructure)
        const formData = new FormData();
        formData.append('email', waybillData.customerInfo.email);
        formData.append('phone', waybillData.customerInfo.phone);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('_replyto', 'electricoraclespiritual@gmail.com');

        await fetch('https://formspree.io/f/xrbybaao', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        // Optional: Integrate SMS API (e.g., Termii, Africa's Talking)
        // await sendSMS(waybillData.customerInfo.phone, message);

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending Dispatch',
        'dispatched': 'Dispatched',
        'in_transit': 'In Transit',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'failed': 'Delivery Failed'
    };
    return statusMap[status] || status;
}

// Get status color for UI
function getStatusColor(status) {
    const colorMap = {
        'pending': '#FFA500',
        'dispatched': '#4169E1',
        'in_transit': '#1E90FF',
        'out_for_delivery': '#32CD32',
        'delivered': '#228B22',
        'failed': '#DC143C'
    };
    return colorMap[status] || '#666';
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createWaybill,
        updateWaybillStatus,
        trackWaybill,
        generateWaybillNumber,
        formatStatus,
        getStatusColor
    };
}
