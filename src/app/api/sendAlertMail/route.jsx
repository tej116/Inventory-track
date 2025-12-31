import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { items } = await req.json();

    // Configure your email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // For Workspace/College emails, you MUST use an 'App Password'
      // Regular passwords will be blocked by Google security
      auth: {
        user: '2k23cse167@kiot.ac.in', 
        pass: 'ojva pjfx odsz dcui',   
      },
    });

    // Format the low stock items list for the email body
    const itemsList = items.map(i => `- ${i.name}: Only ${i.remaining} remaining`).join('\n');

    const mailOptions = {
      from: '"Inventory System" <2k23cse167@kiot.ac.in>',
      // Added both requested emails to the 'to' field
      
       to: '2k23cse144@kiot.ac.in, 2k23cse167@kiot.ac.in , 2k23cse141@kiot.ac.in',
      subject: '⚠️ LOW STOCK ALERT - InvTrack',
      text: `The following items have dropped below 5 units:\n\n${itemsList}\n\nPlease restock soon.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Alert sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Mail Error:", error);
    return NextResponse.json({ message: "Error sending email", details: error.message }, { status: 500 });
  }
}