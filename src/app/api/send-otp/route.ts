import { createHmac, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { otpVerifications } from "@/db/schema";
import { eq } from "drizzle-orm";
const input=z.object({phone:z.string().min(7).max(40),orderId:z.string().min(3).max(64)});
const hash=(v:string)=>createHmac("sha256",process.env.OTP_SECRET||"development-only-change-me").update(v).digest("hex");
export async function POST(req:Request){try{const b=input.parse(await req.json());const code=process.env.TWILIO_ACCOUNT_SID?String(randomInt(100000,1000000)):"123456";await db.delete(otpVerifications).where(eq(otpVerifications.orderPublicId,b.orderId));await db.insert(otpVerifications).values({orderPublicId:b.orderId,phone:b.phone,codeHash:hash(`${b.orderId}:${code}`),expiresAt:new Date(Date.now()+10*60*1000)});if(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_FROM){const auth=Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,{method:"POST",headers:{Authorization:`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({To:b.phone,From:process.env.TWILIO_FROM,Body:`Roma Office Sharing: ${code}. Il codice scade tra 10 minuti.`})});if(!r.ok)throw new Error("SMS provider rejected request");}return NextResponse.json({ok:true,demo:!process.env.TWILIO_ACCOUNT_SID});}catch(e){console.error(e);return NextResponse.json({error:"OTP could not be sent"},{status:400})}}
