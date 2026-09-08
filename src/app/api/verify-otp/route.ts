import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { otpVerifications } from "@/db/schema";
const input=z.object({phone:z.string().min(7),orderId:z.string().min(3),code:z.string().regex(/^\d{6}$/)});const hash=(v:string)=>createHmac("sha256",process.env.OTP_SECRET||"development-only-change-me").update(v).digest("hex");
export async function POST(req:Request){try{const b=input.parse(await req.json());const [record]=await db.select().from(otpVerifications).where(and(eq(otpVerifications.orderPublicId,b.orderId),eq(otpVerifications.phone,b.phone))).limit(1);if(!record||record.expiresAt<new Date()||record.attempts>=5)return NextResponse.json({error:"Expired"},{status:400});const expected=Buffer.from(record.codeHash,"hex"),actual=Buffer.from(hash(`${b.orderId}:${b.code}`),"hex");const valid=expected.length===actual.length&&timingSafeEqual(expected,actual);await db.update(otpVerifications).set(valid?{verifiedAt:new Date()}:{attempts:record.attempts+1}).where(eq(otpVerifications.id,record.id));if(!valid)return NextResponse.json({error:"Invalid"},{status:400});return NextResponse.json({ok:true});}catch(e){console.error(e);return NextResponse.json({error:"Verification failed"},{status:400})}}
