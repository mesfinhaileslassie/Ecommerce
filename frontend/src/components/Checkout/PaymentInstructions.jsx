import React, { useState } from 'react';
import { FaMobile, FaQrcode, FaCopy, FaCheck, FaUniversity, FaPhoneAlt } from 'react-icons/fa';

const PaymentInstructions = ({ paymentMethod, orderId, totalAmount }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getInstructions = () => {
        switch(paymentMethod) {
            case 'CBE Birr':
                return {
                    title: 'CBE Birr Payment',
                    icon: <FaUniversity size={24} />,
                    steps: [
                        'Open CBE Birr app on your mobile phone',
                        'Select "Pay" or "Send Money" option',
                        'Enter merchant details:',
                        `• Merchant Name: E-Shop Store`,
                        `• Amount: ${totalAmount.toFixed(2)} ETB`,
                        `• Reference: ${orderId?.slice(-8) || 'ORDER'}`,
                        'Confirm payment with your PIN',
                        'Save the transaction reference number'
                    ],
                    ussdCode: '*847#',
                    instruction: 'Dial *847# and follow the prompts to pay'
                };
            case 'Telebirr':
                return {
                    title: 'Telebirr Payment',
                    icon: <FaMobile size={24} />,
                    steps: [
                        'Open Telebirr app on your mobile phone',
                        'Click "Pay" or "Scan QR Code"',
                        'Enter merchant details:',
                        `• Merchant Name: E-Shop Store`,
                        `• Amount: ${totalAmount.toFixed(2)} ETB`,
                        `• Reference: ${orderId?.slice(-8) || 'ORDER'}`,
                        'Enter your Telebirr PIN to confirm',
                        'Save the transaction reference number'
                    ],
                    ussdCode: '*127#',
                    instruction: 'Dial *127# and follow the prompts to pay'
                };
            case 'Mobile Banking':
                return {
                    title: 'Mobile Banking',
                    icon: <FaPhoneAlt size={24} />,
                    steps: [
                        'Open your mobile banking app',
                        'Select "Transfer" or "Pay" option',
                        'Enter merchant details:',
                        `• Account: E-Shop Store`,
                        `• Amount: ${totalAmount.toFixed(2)} ETB`,
                        `• Reference: ${orderId?.slice(-8) || 'ORDER'}`,
                        'Confirm the transaction',
                        'Save the transaction reference number'
                    ],
                    ussdCode: 'Contact your bank',
                    instruction: 'Use your bank\'s mobile app to complete payment'
                };
            default:
                return null;
        }
    };

    const instructions = getInstructions();
    if (!instructions) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {instructions.icon}
                <h3 style={styles.title}>{instructions.title}</h3>
            </div>
            
            <div style={styles.amountBox}>
                <span>Amount to Pay:</span>
                <strong>{totalAmount.toFixed(2)} ETB</strong>
            </div>
            
            <div style={styles.instructionBox}>
                <p style={styles.instructionText}>
                    <strong>Quick Payment:</strong> {instructions.instruction}
                </p>
                <div style={styles.codeBox}>
                    <code style={styles.code}>{instructions.ussdCode}</code>
                    <button 
                        onClick={() => copyToClipboard(instructions.ussdCode)}
                        style={styles.copyBtn}
                    >
                        {copied ? <FaCheck /> : <FaCopy />}
                        {copied ? ' Copied!' : ' Copy'}
                    </button>
                </div>
            </div>

            <div style={styles.stepsContainer}>
                <h4 style={styles.stepsTitle}>Step-by-Step Instructions:</h4>
                <ol style={styles.stepsList}>
                    {instructions.steps.map((step, index) => (
                        <li key={index} style={styles.stepItem}>
                            {step.includes('•') ? (
                                <div style={styles.subStep}>{step}</div>
                            ) : (
                                step
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            <div style={styles.orderInfo}>
                <p><strong>Order ID:</strong> {orderId}</p>
                <p><strong>Amount:</strong> {totalAmount.toFixed(2)} ETB</p>
            </div>

            <div style={styles.noteBox}>
                <strong>⚠️ Important:</strong>
                <ul style={styles.noteList}>
                    <li>Make sure to save the transaction reference number after payment</li>
                    <li>Enter the reference number in the form below to confirm your payment</li>
                    <li>Your order will be processed after payment confirmation</li>
                    <li>For any issues, contact our customer support</li>
                </ul>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #f0f0f0',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#333',
        margin: 0,
    },
    amountBox: {
        backgroundColor: '#f0fdf4',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        border: '1px solid #bbf7d0',
    },
    instructionBox: {
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        border: '1px solid #e2e8f0',
    },
    instructionText: {
        margin: '0 0 0.75rem 0',
        color: '#334155',
    },
    codeBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    code: {
        backgroundColor: '#1e293b',
        color: '#f1f5f9',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    copyBtn: {
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        transition: 'background-color 0.3s',
    },
    stepsContainer: {
        marginBottom: '1rem',
    },
    stepsTitle: {
        marginBottom: '0.75rem',
        color: '#333',
        fontSize: '1rem',
    },
    stepsList: {
        paddingLeft: '1.25rem',
        margin: 0,
    },
    stepItem: {
        marginBottom: '0.5rem',
        color: '#4b5563',
        lineHeight: '1.5',
    },
    subStep: {
        paddingLeft: '1rem',
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    orderInfo: {
        backgroundColor: '#fef3c7',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        border: '1px solid #fde68a',
    },
    noteBox: {
        backgroundColor: '#fee2e2',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: '#991b1b',
        border: '1px solid #fecaca',
    },
    noteList: {
        margin: '0.5rem 0 0 1rem',
        padding: 0,
    },
};

export default PaymentInstructions;