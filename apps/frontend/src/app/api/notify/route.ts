import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Meta WhatsApp Cloud API helper
const sendMetaWhatsApp = async (toPhone: string, templateName: string, customVariables: string[] = []) => {
  const token = process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;
  
  if (!token || !phoneId) return false;

  // Meta's default 'hello_world' template does NOT accept any variables. 
  // If we send variables to it, Meta throws an error.
  const components = (customVariables.length > 0 && templateName !== 'hello_world') ? [
    {
      type: "body",
      parameters: customVariables.map(text => ({ type: "text", text }))
    }
  ] : undefined;

  try {
    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone.replace(/\+/g, ''), // Meta expects format like 919876543210
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          ...(templateName !== 'hello_world' && components && { components })
        }
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Meta API Error: ${errorText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[META API ERROR]', err);
    return false;
  }
};

const GMAIL_DEFAULT_USER = 'kamaninimesh19@gmail.com';
const GMAIL_DEFAULT_PASS = 'vvbasyqfxsqjfybp';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || GMAIL_DEFAULT_USER,
    pass: (process.env.GMAIL_APP_PASSWORD || GMAIL_DEFAULT_PASS).replace(/\s+/g, '')
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { type, order, customMessage, teamPhones, payout } = await req.json();
    const senderEmail = process.env.GMAIL_USER || GMAIL_DEFAULT_USER;
    const fromSender = `"Vrundavan Studio" <${senderEmail}>`;
    const adminEmail = process.env.ADMIN_EMAIL || senderEmail;
    const adminPhone = process.env.ADMIN_PHONE; // Include country code e.g., 919876543210

    console.log(`[API/NOTIFY] Received request: ${type} for order ${order?.id}`);

    const responses = { email: false, whatsapp: false, adminAlert: false };

    // ============================================
    // 1. ADMIN ALERT: New Order Created
    // ============================================
    if (type === 'admin_new_order') {
      const subject = `🚨 New Quote Request: ${order.customer}`;
      const text = `You received a new quote request from ${order.customer}!\n\nEmail: ${order.email}\nPhone: ${order.phone}\nPackage: ${order.package}\nDate: ${order.date}\nTotal Estimate: ₹${order.total_amount}\n\nPlease check the Admin Portal.`;

      if (adminEmail && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: adminEmail, subject, text });
        responses.adminAlert = true;
      }
      
      if (adminPhone) {
        // Meta requires pre-approved templates for business-initiated messages
        // Replace 'new_order_admin_alert' with your actual approved Meta template name
        responses.adminAlert = await sendMetaWhatsApp(adminPhone, process.env.META_TEMPLATE_ADMIN || 'hello_world');
      }
    }

    // ============================================
    // 2. CUSTOMER ALERT: Quote Sent / Confirmed
    // ============================================
    else if (type === 'customer_confirmed') {
      const subject = `Your Payment is Under Verification - Vrundavan`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div style="background-color: #003366; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">VRUNDAVAN</h1>
            <p style="color: #a0aec0; margin-top: 5px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Cinematic Experiences</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; color: #1a202c;">
            <h2 style="margin-top: 0; font-size: 22px;">Hi ${order.customer},</h2>
            <p style="line-height: 1.6; color: #4a5568;">Thank you for choosing Vrundavan! We have received your payment screenshot for the <strong>"${order.package}"</strong> package.</p>
            <p style="line-height: 1.6; color: #4a5568;">Our team is currently verifying your payment. Once approved, you will receive an official confirmation locking in your dates.</p>
            
            <div style="background-color: #f7fafc; border-left: 4px solid #003366; padding: 15px 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 1px;">Your Quote ID</p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-family: monospace; font-weight: bold; color: #003366;">${order.quote_id || (order.id ? order.id.split('-')[0].toUpperCase() : '')}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #718096;">Warm regards,<br><strong style="color: #2d3748;">Vrundavan Team</strong></p>
          </div>
        </div>
      `;

      if (order.email && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: order.email, subject, html });
        responses.email = true;
      }
      
      if (order.phone) {
        let formattedPhone = order.phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;
        responses.whatsapp = await sendMetaWhatsApp(formattedPhone, process.env.META_TEMPLATE_CUSTOMER || 'hello_world');
      }
    }

    // ============================================
    // 3. TEAM ALERT: Team Member Assigned
    // ============================================
    else if (type === 'team_assignment' && teamPhones && Array.isArray(teamPhones)) {
      const templateName = process.env.META_TEMPLATE_TEAM || 'hello_world';
      const variables = customMessage ? [customMessage] : ["No additional instructions."];
      
      for (const phone of teamPhones) {
        if (phone) {
          // If you create a template with {{1}}, the customMessage will be passed.
          // Note: 'hello_world' template does not accept variables, but this is future-proof.
          await sendMetaWhatsApp(phone, templateName, variables);
        }
      }
      responses.whatsapp = true;
    }

    // ============================================
    // 4. CUSTOMER ALERT: Payment Reminder
    // ============================================
    else if (type === 'payment_reminder') {
      const subject = `Action Required: Advance Payment for Vrundavan Booking`;
      const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const quoteId = order.quote_id || (order.id ? order.id.split('-')[0].toUpperCase() : '');
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div style="background-color: #003366; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">VRUNDAVAN</h1>
            <p style="color: #a0aec0; margin-top: 5px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Cinematic Experiences</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; color: #1a202c;">
            <h2 style="margin-top: 0; font-size: 22px; color: #c05621;">Advance Payment Required</h2>
            <p style="line-height: 1.6; color: #4a5568;">Hi ${order.customer},</p>
            <p style="line-height: 1.6; color: #4a5568;">We are excited for your upcoming event! This is a friendly reminder that we are waiting for your advance token payment to officially lock your dates for the <strong>"${order.package}"</strong> package.</p>
            
            <div style="background-color: #fffaf0; border: 1px solid #feebc8; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #dd6b20; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Quote ID</p>
              <p style="margin: 5px 0 20px 0; font-size: 24px; font-family: monospace; font-weight: bold; color: #c05621; letter-spacing: 2px;">${quoteId}</p>
              
              <a href="${frontendUrl}/custom-plan" style="background-color: #003366; color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Resume Booking & Upload Screenshot</a>
            </div>
            
            <p style="line-height: 1.6; color: #718096; font-size: 13px;"><em>Instructions: Click the button above, enter your Quote ID on the page, and it will take you straight to the QR code and payment screenshot upload step.</em></p>
            
            <p style="margin-top: 30px; font-size: 14px; color: #718096;">Warm regards,<br><strong style="color: #2d3748;">Vrundavan Team</strong></p>
          </div>
        </div>
      `;

      if (order.email && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: order.email, subject, html });
        responses.email = true;
      }
    }

    // ============================================
    // 5. CUSTOMER ALERT: Order Update
    // ============================================
    else if (type === 'order_update' && customMessage) {
      const subject = `Update regarding your Vrundavan Booking`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div style="background-color: #003366; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">VRUNDAVAN</h1>
            <p style="color: #a0aec0; margin-top: 5px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Cinematic Experiences</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; color: #1a202c;">
            <h2 style="margin-top: 0; font-size: 22px;">Hi ${order.customer},</h2>
            <p style="line-height: 1.6; color: #4a5568;">We have an update regarding your booking:</p>
            
            <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 15px; color: #2b6cb0; line-height: 1.6;">${customMessage.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #718096;">Warm regards,<br><strong style="color: #2d3748;">Vrundavan Team</strong></p>
          </div>
        </div>
      `;

      if (order.email && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: order.email, subject, html });
        responses.email = true;
      }
    }

    // ============================================
    // 6. CUSTOMER ALERT: Order Confirmed (Invoice)
    // ============================================
    else if (type === 'order_confirmed_invoice') {
      const subject = `Booking Confirmed! Your Invoice for Vrundavan`;
      const quoteId = order.quote_id || (order.id ? order.id.split('-')[0].toUpperCase() : '');
      const paid = Number(order.amountPaid || 0);
      const total = Number(order.total_amount || 0);
      const balance = Math.max(0, total - paid);
      
      const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-700px; margin: 0 auto; background-color: #ffffff; color: #333333;">
          
          <div style="text-align: center; padding: 40px 20px; background-color: #f8fafc; border-bottom: 3px solid #003366;">
            <h1 style="color: #003366; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 2px;">VRUNDAVAN</h1>
            <p style="color: #64748b; margin-top: 8px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Cinematic Experiences</p>
          </div>

          <div style="padding: 40px;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 24px;">Booking Confirmed</h2>
              <p style="margin: 0; color: #64748b; font-size: 15px;">Your event dates are officially locked in!</p>
            </div>

            <div style="display: table; width: 100%; margin-bottom: 40px;">
              <div style="display: table-cell; width: 50%;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Billed To</p>
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px; color: #0f172a;">${order.customer}</p>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;">${order.email}</p>
                <p style="margin: 0; font-size: 14px; color: #475569;">${order.phone}</p>
              </div>
              <div style="display: table-cell; width: 50%; text-align: right;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Invoice Details</p>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Quote ID:</strong> ${quoteId}</p>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Event Date:</strong> ${order.date ? new Date(order.date).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
            </div>

            <div style="margin-bottom: 40px;">
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Package Blueprint</p>
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #003366;">
                <p style="margin: 0; font-size: 15px; color: #1e293b; line-height: 1.6;">${order.package}</p>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
              <thead>
                <tr>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Description</th>
                  <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: right; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px;">Total Contract Value</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; color: #10b981; font-size: 15px; font-weight: bold;">Advance Payment Received</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; color: #10b981; font-size: 15px; font-weight: bold; text-align: right;">-₹${paid.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 20px 0 0 0; color: #003366; font-size: 16px; font-weight: bold; text-transform: uppercase;">Balance Due</td>
                  <td style="padding: 20px 0 0 0; color: #003366; font-size: 18px; font-weight: bold; text-align: right;">₹${balance.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 40px;">
              <p style="margin: 0; color: #475569; font-size: 14px;">This is a system-generated invoice confirming your booking. We look forward to capturing your beautiful moments!</p>
            </div>

            <p style="margin: 0; text-align: center; font-size: 14px; color: #94a3b8;">Thank you for your business!<br><strong style="color: #64748b;">The Vrundavan Team</strong></p>
          </div>
        </div>
      `;

      if (order.email && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: order.email, subject, html });
        responses.email = true;
      }
      
      if (order.phone) {
        let formattedPhone = order.phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;
        responses.whatsapp = await sendMetaWhatsApp(formattedPhone, process.env.META_TEMPLATE_INVOICE || 'hello_world');
      }
    }

    // ============================================
    // 7. ADMIN ALERT: Team Payout Receipt
    // ============================================
    else if (type === 'team_payout_receipt' && payout) {
      const subject = `Payout Receipt: ₹${payout.amount} to ${payout.member_name}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div style="background-color: #003366; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">PAYOUT RECEIPT</h1>
            <p style="color: #a0aec0; margin-top: 5px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Team Payments</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; color: #1a202c;">
            <h2 style="margin-top: 0; font-size: 22px;">Payment Recorded Successfully</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tbody>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096; width: 40%;">Freelancer Name</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">${payout.member_name}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Role</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">${payout.role}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Amount Paid</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #38a169;">₹${Number(payout.amount).toLocaleString('en-IN')}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Client/Order</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">${payout.client || 'N/A'}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Date</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">${new Date(payout.date).toLocaleDateString('en-IN')}</td></tr>
                ${payout.note ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Note</td><td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; font-style: italic;">${payout.note}</td></tr>` : ''}
              </tbody>
            </table>
            
            ${payout.screenshot_url ? `
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #718096; font-size: 14px; margin-bottom: 15px;">Payment Proof Attached:</p>
                <img src="${payout.screenshot_url}" alt="Payment Screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                <br />
                <a href="${payout.screenshot_url}" target="_blank" style="display: inline-block; margin-top: 15px; color: #3182ce; text-decoration: none; font-size: 14px;">View Full Image</a>
              </div>
            ` : `
              <p style="margin-top: 30px; font-size: 14px; color: #a0aec0; text-align: center; font-style: italic;">No screenshot provided for this payout.</p>
            `}
            
            <p style="margin-top: 40px; font-size: 13px; color: #a0aec0; text-align: center;">This is an automated receipt from your Admin Portal.</p>
          </div>
        </div>
      `;

      if (adminEmail && senderEmail) {
        await transporter.sendMail({ from: fromSender, to: adminEmail, subject, html });
        responses.email = true;
      }
    }

    return NextResponse.json({ success: true, details: responses }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('[API/NOTIFY] Error:', error);
    // We return success true but with the error so the frontend doesn't crash on failed emails
    return NextResponse.json({ success: true, error: error.message }, { status: 200, headers: corsHeaders });
  }
}
