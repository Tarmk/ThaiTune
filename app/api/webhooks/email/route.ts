import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, addDoc, serverTimestamp, getDocs, updateDoc } from 'firebase/firestore'

// Extract ticket ID from email subject
function extractTicketId(subject: string): string | null {
  // Look for patterns like [TT-516630-I33QFT] or TT-516630-I33QFT
  const match = subject.match(/\[?(TT-[A-Z0-9-]+)\]?/i)
  return match ? match[1] : null
}

// Clean email content by removing quoted text
function cleanEmailContent(text: string): string {
  // Remove common reply patterns
  const lines = text.split('\n')
  const cleanLines = []
  
  for (const line of lines) {
    // Stop at common reply markers
    if (line.includes('On ') && line.includes(' wrote:')) break
    if (line.includes('From:') && line.includes('Sent:')) break
    if (line.startsWith('>')) break
    if (line.includes('-----Original Message-----')) break
    if (line.includes('________________________________')) break
    
    cleanLines.push(line)
  }
  
  return cleanLines.join('\n').trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // SendGrid inbound webhook payload structure
    const {
      from,
      to,
      subject,
      text,
      html,
      headers
    } = body
    
    console.log('Received email webhook:', { from, to, subject })
    
    // Extract ticket ID from subject
    const ticketId = extractTicketId(subject || '')
    
    if (!ticketId) {
      console.log('No ticket ID found in subject:', subject)
      return NextResponse.json({ 
        success: false, 
        error: 'No ticket ID found in subject' 
      })
    }
    
    // Find the ticket in Firebase using ticketId field
    const ticketsRef = collection(db, 'support_tickets')
    const ticketsSnapshot = await getDocs(ticketsRef)
    
    let ticketDoc: any = null
    let ticketData: any = null
    let docId: string | null = null
    
    ticketsSnapshot.forEach((doc: any) => {
      const data = doc.data()
      if (data.ticketId === ticketId) {
        ticketDoc = doc
        ticketData = data
        docId = doc.id
      }
    })
    
    if (!ticketDoc || !ticketData || !docId) {
      console.log('Ticket not found:', ticketId)
      return NextResponse.json({ 
        success: false, 
        error: 'Ticket not found' 
      })
    }
    
    // Verify the email is from the original ticket submitter
    const emailFrom = from?.toLowerCase()
    const ticketEmail = ticketData.email?.toLowerCase()
    
    if (emailFrom !== ticketEmail) {
      console.log('Email not from ticket submitter:', { from: emailFrom, expected: ticketEmail })
      return NextResponse.json({ 
        success: false, 
        error: 'Email not from ticket submitter' 
      })
    }
    
    // Clean the email content
    const cleanText = cleanEmailContent(text || '')
    
    if (!cleanText || cleanText.length < 10) {
      console.log('Email content too short or empty')
      return NextResponse.json({ 
        success: false, 
        error: 'Email content too short or empty' 
      })
    }
    
    // Add message to conversation
    const conversationRef = collection(db, 'support_tickets', docId!, 'messages')
    const messageData = {
      message: cleanText,
      isAdmin: false,
      senderName: ticketData.name,
      senderEmail: ticketData.email,
      createdAt: serverTimestamp(),
      emailMessageId: headers?.['message-id'] || 'unknown',
      addedVia: 'email_webhook'
    }
    
    await addDoc(conversationRef, messageData)
    
    // Update ticket status if it was resolved/closed
    if (ticketData.status === 'resolved' || ticketData.status === 'closed') {
      await updateDoc(doc(db, 'support_tickets', docId!), {
        status: 'open',
        updatedAt: serverTimestamp()
      })
    }
    
    console.log('Email reply added to conversation:', { ticketId, from: emailFrom })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email reply added to conversation',
      ticketId
    })
    
  } catch (error) {
    console.error('Error processing email webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process email webhook' },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Email webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
} 