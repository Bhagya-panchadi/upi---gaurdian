export interface SampleMessage {
  id: string;
  category: 'scam' | 'safe' | 'suspicious';
  title: string;
  badgeLabel: string;
  message: string;
}

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'cashback-scam',
    category: 'scam',
    title: '₹4,999 Cashback Reward Link',
    badgeLabel: 'Fake Reward',
    message: '🎉 Congratulations! You have received ₹4,999 cashback in your Google Pay account. Click the link to claim reward directly into your bank account: https://gpay-rewards-claim99.top/upi?claim=4999',
  },
  {
    id: 'electricity-bill',
    category: 'scam',
    title: 'Electricity Power Cut Threat',
    badgeLabel: 'Urgent Disconnection',
    message: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Immediately contact electricity officer at 9876543210 or approve the UPI collect request sent by powerdept.bill@okhdfcbank to prevent disconnection.',
  },
  {
    id: 'overpayment-refund',
    category: 'suspicious',
    title: 'Mistaken Transfer Refund Request',
    badgeLabel: 'Accidental Transfer',
    message: 'Hello, I accidentally sent ₹12,500 to your PhonePe mobile number while paying my child\'s hospital fees. Please check your SMS and kindly refund ₹12,500 back to my UPI ID: ramesh.medical98@paytm urgently. God bless you.',
  },
  {
    id: 'kyc-block-threat',
    category: 'scam',
    title: 'UPI Blocked / KYC Expiry',
    badgeLabel: 'KYC Phishing',
    message: 'ALERT: Dear SBI customer, your UPI transaction limit has been blocked due to expired PAN KYC. To unblock immediately and avoid account freeze, submit your UPI MPIN and details at: http://sbi-netbanking-kyc-verify.in/auth',
  },
  {
    id: 'qr-code-olx',
    category: 'scam',
    title: 'Scan QR Code to Receive Money',
    badgeLabel: 'OLX Marketplace',
    message: 'I want to purchase your sofa immediately. I am an Army officer stationed in Pune. I have generated a special UPI QR code for ₹18,000. Kindly scan this QR code in Google Pay and enter your UPI PIN to receive the advance payment in your bank.',
  },
  {
    id: 'legitimate-credit',
    category: 'safe',
    title: 'Legitimate Bank UPI Credit SMS',
    badgeLabel: 'Genuine Bank Alert',
    message: 'Dear Customer, INR 1,500.00 is credited to your A/C XX4209 on 09-OCT-26 14:22:10 via UPI:428391029381. Linked VPA: rahul.sharma@okaxis. Available Balance: INR 24,850.70. - HDFC Bank',
  },
];
