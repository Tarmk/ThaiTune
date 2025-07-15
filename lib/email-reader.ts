import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

// Email configuration - add these to your .env.local
const emailConfig: EmailConfig = {
  user: process.env.SUPPORT_EMAIL || 'support@thaitune.com',
  password: process.env.SUPPORT_EMAIL_PASSWORD || '',
  host: process.env.EMAIL_HOST || 'imap.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '993'),
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
};

export const processEmailReplies = async () => {
  console.log('Email config:', {
    user: emailConfig.user,
    host: emailConfig.host,
    port: emailConfig.port,
    hasPassword: !!emailConfig.password
  });
  
  if (!emailConfig.password) {
    console.warn('Email password not configured');
    return [];
  }

  const imap = new Imap(emailConfig);

  return new Promise((resolve, reject) => {
    imap.once('error', (err: any) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.once('ready', () => {
      console.log('IMAP connection ready');
      imap.openBox('INBOX', false, (err: any, box: any) => {
        if (err) {
          console.error('Error opening INBOX:', err);
          reject(err);
          return;
        }

        console.log('INBOX opened successfully, total messages:', box.messages.total);

        // Search for unread emails
        imap.search(['UNSEEN'], (err: any, results: any) => {
          if (err) {
            console.error('Error searching for unread emails:', err);
            reject(err);
            return;
          }

          console.log('Found', results.length, 'unread emails');
          if (results.length === 0) {
            console.log('No new emails found');
            imap.end();
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '' });
          
          fetch.on('message', (msg: any, seqno: any) => {
            let body = '';
            
            msg.on('body', (stream: any, info: any) => {
              stream.on('data', (chunk: any) => {
                body += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(body);
                await handleEmailReply(parsed);
                
                // Mark as read
                imap.addFlags(seqno, ['\\Seen'], (err: any) => {
                  if (err) console.error('Error marking email as read:', err);
                });
              } catch (error) {
                console.error('Error processing email:', error);
              }
            });
          });

          fetch.once('end', () => {
            imap.end();
            resolve(results);
          });
        });
      });
    });

    imap.once('error', (err: any) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    console.log('Attempting to connect to IMAP...');
    imap.connect();
  });
};

const handleEmailReply = async (email: any) => {
  const from = email.from?.text || '';
  const subject = email.subject || '';
  const text = email.text || '';
  const html = email.html || '';

  console.log('Processing email:', { from, subject });

  // Extract ticket ID from subject line
  const ticketMatch = subject.match(/\[([A-Z]{2}-\d{6}-[A-Z0-9]{6})\]/);
  
  if (!ticketMatch) {
    console.log('No ticket ID found in subject:', subject);
    return;
  }

  const ticketId = ticketMatch[1];
  console.log('Processing reply for ticket:', ticketId);

  try {
    // Find the ticket
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, where('ticketId', '==', ticketId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Ticket not found:', ticketId);
      return;
    }

    const ticketDoc = querySnapshot.docs[0];

    // Add the reply to the conversation
    const conversationRef = collection(db, 'support_tickets', ticketDoc.id, 'messages');
    await addDoc(conversationRef, {
      message: text || html || 'No message content',
      senderName: from.split('<')[0].trim().replace(/"/g, ''),
      senderEmail: from.match(/<(.+)>/) ? from.match(/<(.+)>/)[1] : from,
      isAdmin: false,
      createdAt: serverTimestamp()
    });

    // Update ticket status
    await updateDoc(doc(db, 'support_tickets', ticketDoc.id), {
      status: 'awaiting_response',
      lastReply: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Successfully processed email reply for ticket:', ticketId);
  } catch (error) {
    console.error('Error processing email reply:', error);
  }
};

// Function to send emails (simple SMTP)
export const sendEmail = async (to: string, subject: string, html: string) => {
  // You can use nodemailer or any SMTP service here
  console.log('Send email to:', to, 'Subject:', subject);
  // Implementation depends on your email provider
}; 