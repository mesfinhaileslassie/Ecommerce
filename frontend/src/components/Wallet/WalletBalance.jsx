import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaWallet, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WalletBalance = () => {
    const { user, token } = useSelector((state) => state.auth);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [showTransactions, setShowTransactions] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && user) {
            fetchWalletBalance();
            fetchTransactions();
        }
    }, [token, user]);

    const fetchWalletBalance = async () => {
        try {
            const { data } = await api.get('/wallet/balance');
            setBalance(data.balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/wallet/transactions');
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            <div style={styles.walletCard}>
                <div style={styles.walletHeader}>
                    <FaWallet size={24} color="#6366f1" />
                    <h3 style={styles.walletTitle}>My Wallet</h3>
                </div>
                <div style={styles.balanceContainer}>
                    <span style={styles.balanceLabel}>Available Balance</span>
                    <span style={styles.balanceAmount}>${balance.toFixed(2)} ETB</span>
                </div>
                <button 
                    onClick={() => setShowTransactions(!showTransactions)}
                    style={styles.historyBtn}
                >
                    <FaHistory /> Transaction History
                </button>
            </div>

            {showTransactions && (
                <div style={styles.transactionsModal}>
                    <div style={styles.transactionsContent}>
                        <div style={styles.transactionsHeader}>
                            <h3>Transaction History</h3>
                            <button onClick={() => setShowTransactions(false)} style={styles.closeBtn}>×</button>
                        </div>
                        <div style={styles.transactionsList}>
                            {transactions.length === 0 ? (
                                <p style={styles.noTransactions}>No transactions yet</p>
                            ) : (
                                transactions.map((tx, index) => (
                                    <div key={index} style={styles.transactionItem}>
                                        <div style={styles.transactionIcon}>
                                            {tx.type === 'credit' ? 
                                                <FaMoneyBillWave color="#10b981" /> : 
                                                <FaMoneyBillWave color="#ef4444" />
                                            }
                                        </div>
                                        <div style={styles.transactionDetails}>
                                            <p style={styles.transactionDesc}>{tx.description}</p>
                                            <p style={styles.transactionDate}>{formatDate(tx.createdAt)}</p>
                                        </div>
                                        <div style={styles.transactionAmount}>
                                            <span style={{
                                                color: tx.type === 'credit' ? '#10b981' : '#ef4444',
                                                fontWeight: 'bold'
                                            }}>
                                                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                            </span>
                                            <p style={styles.transactionBalance}>Balance: ${tx.balanceAfter?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
    },
    walletCard: {
        backgroundColor: '#fff',
        borderRadius: '0.5rem',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '200px',
    },
    walletHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
    },
    walletTitle: {
        fontSize: '14px',
        color: '#333',
        margin: 0,
    },
    balanceContainer: {
        marginBottom: '10px',
    },
    balanceLabel: {
        fontSize: '12px',
        color: '#666',
        display: 'block',
    },
    balanceAmount: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#6366f1',
        display: 'block',
    },
    historyBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#f3f4f6',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '12px',
        width: '100%',
        justifyContent: 'center',
    },
    transactionsModal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionsContent: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
    },
    transactionsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #eee',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999',
    },
    transactionsList: {
        overflowY: 'auto',
        padding: '20px',
    },
    transactionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '12px',
        borderBottom: '1px solid #f0f0f0',
    },
    transactionIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDesc: {
        fontSize: '14px',
        fontWeight: '500',
        margin: 0,
    },
    transactionDate: {
        fontSize: '11px',
        color: '#999',
        margin: 0,
    },
    transactionAmount: {
        textAlign: 'right',
    },
    transactionBalance: {
        fontSize: '11px',
        color: '#666',
        margin: '0',
    },
    noTransactions: {
        textAlign: 'center',
        color: '#999',
        padding: '20px',
    },
};

export default WalletBalance;